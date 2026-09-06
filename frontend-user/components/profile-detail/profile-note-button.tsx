/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Bouton et panneau interactif de Note Privée pour profil/portfolio (5 états successifs : Au repos, Déployé texte, Enregistrement audio avec waveform, Transcription modifiable, Enregistrée avec style de marque).
 * @created 2026-09-06
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useRef } from "react"
import {
    FileText,
    FileEdit,
    Mic,
    Square,
    Sparkles,
    Check,
    Trash2,
    Lock,
    X,
    Volume2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

/** Récupère les en-têtes nécessaires, y compris le token Bearer si connecté */
async function getAuthHeaders(includeJson = false): Promise<Record<string, string>> {
    const headers: Record<string, string> = {}
    if (includeJson) {
        headers["Content-Type"] = "application/json"
    }
    try {
        const supabase = createClient()
        let { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
            // Tenter getUser() qui réveille le refresh token si l'access_token a expiré
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const res = await supabase.auth.getSession()
                session = res.data.session
            }
        }
        if (session?.access_token) {
            headers["Authorization"] = `Bearer ${session.access_token}`
        }
    } catch {
        // En cas d'exception locale, les cookies restent envoyés par défaut
    }
    return headers
}

interface ProfileNoteButtonProps {
    profileId: string
    profileName?: string
    className?: string
}

type TabMode = "text" | "voice"
type VoicePhase = "idle" | "recording" | "transcribing" | "completed"

interface SavedNoteData {
    content: string
    updatedAt: string
    hasAudio?: boolean
    audioDuration?: string
}

export function ProfileNoteButton({
    profileId,
    profileName,
    className
}: ProfileNoteButtonProps) {
    // La note vit désormais en base (profile_notes), pas dans le navigateur :
    // le localStorage la perdait au changement d'appareil et la laissait
    // lisible par n'importe quel script de la page.

    // États principaux
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<TabMode>("text")
    const [noteContent, setNoteContent] = useState("")
    const [hasSavedNote, setHasSavedNote] = useState(false)
    const [savedNoteMeta, setSavedNoteMeta] = useState<SavedNoteData | null>(null)

    // États du mode vocal
    const [voicePhase, setVoicePhase] = useState<VoicePhase>("idle")
    const [recordSeconds, setRecordSeconds] = useState(0)
    const [transcribedText, setTranscribedText] = useState("")
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Enregistrement audio réel : flux micro, morceaux, envoi à la transcription.
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const streamRef = useRef<MediaStream | null>(null)
    const [saving, setSaving] = useState(false)

    // Chargement de la note existante depuis le serveur.
    useEffect(() => {
        if (!profileId) return
        let active = true
        ;(async () => {
            try {
                const headers = await getAuthHeaders(false)
                const res = await fetch(`/api/profiles/${encodeURIComponent(profileId)}/note`, {
                    headers,
                })
                if (!res.ok) return
                const data = await res.json()
                if (!active || !data?.note?.content) return
                setNoteContent(data.note.content)
                setHasSavedNote(true)
                setSavedNoteMeta({ content: data.note.content, updatedAt: data.note.updatedAt })
            } catch {
                // Lecture silencieuse : une note indisponible ne doit pas
                // bloquer la consultation du profil.
            }
        })()
        return () => { active = false }
    }, [profileId])

    // Le micro et le minuteur doivent être relâchés si le composant disparaît
    // en cours d'enregistrement — sinon la pastille rouge du navigateur reste
    // allumée après avoir quitté la page.
    useEffect(() => () => {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        if (timerRef.current) clearInterval(timerRef.current)
    }, [])

    // Gestion du timer pendant l'enregistrement
    useEffect(() => {
        if (voicePhase === "recording") {
            setRecordSeconds(0)
            timerRef.current = setInterval(() => {
                setRecordSeconds((prev) => prev + 1)
            }, 1000)
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [voicePhase])

    const formatTimer = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60)
        const secs = totalSeconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    // Démarrage de l'enregistrement : on demande le micro AVANT de basculer
    // l'affichage, sinon un refus laisserait l'écran en « enregistrement » sans
    // que rien ne soit capté.
    const handleStartRecording = async () => {
        try {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    toast.error("Connectez-vous pour dicter une note.")
                    return
                }
            }
        } catch {
            // Continuation si Supabase indisponible
        }

        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
            toast.error("Votre navigateur ne permet pas l'enregistrement audio.")
            return
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream
            chunksRef.current = []

            const recorder = new MediaRecorder(stream)
            recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
            recorder.onstop = () => { void transcribe() }
            mediaRecorderRef.current = recorder
            recorder.start()
            setVoicePhase("recording")
        } catch {
            toast.error("Micro inaccessible. Autorisez l'accès pour dicter votre note.")
        }
    }

    /** Envoie l'audio capté à Gemini et récupère le texte prononcé. */
    const transcribe = async () => {
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || "audio/webm" })
        chunksRef.current = []
        if (blob.size === 0) {
            setVoicePhase("idle")
            toast.error("Rien n'a été enregistré.")
            return
        }

        try {
            const headers = await getAuthHeaders(false)
            const form = new FormData()
            form.append("audio", blob, "note.webm")
            const res = await fetch("/api/transcribe", {
                method: "POST",
                headers,
                body: form,
            })
            const data = await res.json().catch(() => null)

            if (!res.ok) {
                setVoicePhase("idle")
                toast.error(data?.error || "Transcription impossible.")
                return
            }
            if (data?.inaudible) {
                setVoicePhase("idle")
                toast.error("Enregistrement inaudible — réessayez.")
                return
            }
            if (data?.degraded || !data?.text) {
                // La transcription a échoué mais la note reste utilisable :
                // l'utilisateur peut écrire lui-même ce qu'il voulait dicter.
                setVoicePhase("idle")
                toast.error("Transcription indisponible. Saisissez votre note au clavier.")
                return
            }

            const text: string = data.text
            setTranscribedText(text)
            setNoteContent((prev) => (prev ? `${prev}\n${text}` : text))
            setVoicePhase("completed")
        } catch {
            setVoicePhase("idle")
            toast.error("Erreur réseau pendant la transcription.")
        }
    }

    // Arrêt de l'enregistrement : la transcription part depuis onstop, une fois
    // le dernier morceau reçu.
    const handleStopRecording = () => {
        setVoicePhase("transcribing")
        mediaRecorderRef.current?.stop()
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
    }

    // Enregistrement définitif : la note part en base, où elle survit au
    // rechargement et au changement d'appareil.
    const handleSaveNote = async () => {
        const content = noteContent.trim()
        if (!content) {
            toast.error("Veuillez saisir un pense-bête avant d'enregistrer.")
            return
        }

        try {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    toast.error("Connectez-vous pour enregistrer une note.")
                    return
                }
            }
        } catch {
            // Continuation
        }

        setSaving(true)
        try {
            const headers = await getAuthHeaders(true)
            const res = await fetch(`/api/profiles/${encodeURIComponent(profileId)}/note`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ content, isVoice: voicePhase === "completed" }),
            })
            const data = await res.json().catch(() => null)

            if (!res.ok) {
                toast.error(data?.error || "Impossible d'enregistrer la note.")
                return
            }

            setHasSavedNote(true)
            setSavedNoteMeta({
                content,
                updatedAt: data?.note?.updatedAt || new Date().toISOString(),
                hasAudio: voicePhase === "completed",
                audioDuration: formatTimer(recordSeconds),
            })
            setIsOpen(false)
            setVoicePhase("idle")
            toast.success("Note privée enregistrée.")
        } catch {
            toast.error("Erreur réseau — la note n'a pas été enregistrée.")
        } finally {
            setSaving(false)
        }
    }

    // Suppression : une note vidée est supprimée côté serveur, la ligne ne
    // reste pas en base avec un contenu vide — sinon le bouton resterait
    // allumé pour une note qui n'existe plus.
    const handleDeleteNote = async () => {
        setSaving(true)
        try {
            const headers = await getAuthHeaders(true)
            const res = await fetch(`/api/profiles/${encodeURIComponent(profileId)}/note`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ content: "" }),
            })
            if (!res.ok) {
                toast.error("Impossible de supprimer la note.")
                return
            }
            setNoteContent("")
            setHasSavedNote(false)
            setSavedNoteMeta(null)
            setVoicePhase("idle")
            setTranscribedText("")
            setIsOpen(false)
            toast.info("Note privée supprimée.")
        } catch {
            toast.error("Erreur réseau — la note n'a pas été supprimée.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={cn("relative flex-1 lg:flex-none", className)}>
            {/* ── Bouton d'action dans le Hero (État 1 Au repos ou État 5 Enregistrée) ── */}
            <Button
                type="button"
                variant={hasSavedNote ? "default" : "outline"}
                size="default"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "rounded-xl h-11 text-xs px-5 gap-2 font-semibold tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex-1 lg:flex-none min-w-[112px] w-full",
                    hasSavedNote
                        ? "bg-[#013ff4]/10 hover:bg-[#013ff4]/15 text-[#013ff4] dark:text-[#03b3f8] border-2 border-[#013ff4] dark:border-[#03b3f8] shadow-sm font-bold"
                        : "border-border bg-card hover:bg-muted shadow-sm text-foreground"
                )}
                aria-label={hasSavedNote ? "Voir la note privée enregistrée" : "Ajouter une note privée"}
            >
                {hasSavedNote ? (
                    <>
                        <FileEdit className="h-4 w-4 text-[#013ff4] dark:text-[#03b3f8] shrink-0" />
                        <span>Note enregistrée</span>
                    </>
                ) : (
                    <>
                        <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                        <span>Note</span>
                    </>
                )}
            </Button>

            {/* ── Panneau de saisie extensible (États 2, 3, 4) ── */}
            {isOpen && (
                <div
                    className={cn(
                        "mt-3 w-full sm:min-w-[340px] md:min-w-[380px] bg-card border border-border/90 rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_rgb(15,23,42,0.12)] z-[60] transition-all duration-300 animate-in fade-in slide-in-from-top-2",
                        "lg:absolute lg:right-0 lg:top-full lg:mt-2"
                    )}
                >
                    {/* En-tête du volet */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#013ff4]/10 text-[#013ff4]">
                                <FileText className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-xs font-black text-foreground tracking-wide">
                                Note privée {profileName ? `• ${profileName}` : ""}
                            </span>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-foreground hover:bg-muted"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Onglets Texte / Vocal (Image 1 - Déployé) */}
                    <div className="mt-3.5 flex items-center p-1 rounded-xl bg-muted/80 border border-border/50">
                        <button
                            type="button"
                            onClick={() => setActiveTab("text")}
                            className={cn(
                                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center",
                                activeTab === "text"
                                    ? "bg-card text-[#013ff4] shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Texte
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("voice")
                                if (voicePhase === "idle") {
                                    handleStartRecording()
                                }
                            }}
                            className={cn(
                                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5",
                                activeTab === "voice"
                                    ? "bg-card text-[#013ff4] shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Mic className="h-3.5 w-3.5" />
                            Vocal
                        </button>
                    </div>

                    {/* Contenu selon l'onglet actif */}
                    <div className="mt-3.5">
                        {activeTab === "text" ? (
                            /* ── État 2 : DÉPLOYÉ — TEXTE ── */
                            <div className="space-y-3">
                                <textarea
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    rows={4}
                                    placeholder="Ce que vous voulez retenir : un tarif annoncé, un délai..."
                                    className="w-full rounded-xl border border-border bg-muted/40 p-3 text-xs sm:text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#013ff4]/20 focus:border-[#013ff4] resize-none font-medium leading-relaxed"
                                    autoFocus
                                />
                            </div>
                        ) : (
                            /* ── États 3 & 4 : ENREGISTREMENT & TRANSCRIPTION ── */
                            <div className="space-y-3">
                                {voicePhase === "recording" && (
                                    /* État 3 : Enregistrement actif avec bouton rouge carré et waveform */
                                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                                        <button
                                            type="button"
                                            onClick={handleStopRecording}
                                            title="Arrêter l'enregistrement"
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white shadow-md shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            <Square className="h-4 w-4 fill-white text-white" />
                                        </button>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-block h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                                                <span className="text-xs font-bold text-foreground">
                                                    Enregistrement...
                                                </span>
                                                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                                                    {formatTimer(recordSeconds)}
                                                </span>
                                            </div>

                                            {/* Waveform animée en barres bleues (Image 1) */}
                                            <div className="mt-2 flex items-center gap-1 h-5">
                                                {[30, 70, 45, 90, 60, 100, 75, 40, 85, 55, 65, 35].map((height, i) => (
                                                    <span
                                                        key={i}
                                                        className="w-1 rounded-full bg-[#013ff4] dark:bg-[#03b3f8] animate-pulse"
                                                        style={{
                                                            height: `${height}%`,
                                                            animationDelay: `${i * 90}ms`,
                                                            animationDuration: "800ms"
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {voicePhase === "transcribing" && (
                                    /* État 4 : Transcription en cours */
                                    <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-2 text-center animate-in fade-in">
                                        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#013ff4] dark:text-[#03b3f8]">
                                            <Sparkles className="h-4 w-4 animate-spin text-[#013ff4]" />
                                            Transcription en cours...
                                        </div>
                                        <p className="text-[11px] text-muted-foreground font-medium">
                                            Conversion de la voix en texte exploitable...
                                        </p>
                                    </div>
                                )}

                                {(voicePhase === "completed" || (voicePhase === "idle" && noteContent)) && (
                                    /* État 4 achevé : Texte transcrit modifiable */
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                                            <span className="flex items-center gap-1.5 text-[#013ff4]">
                                                <Volume2 className="h-3.5 w-3.5" />
                                                Audio joint ({formatTimer(recordSeconds || 12)})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleStartRecording}
                                                className="text-xs text-slate-500 hover:text-foreground font-bold hover:underline"
                                            >
                                                Réenregistrer
                                            </button>
                                        </div>

                                        <textarea
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            rows={3}
                                            className="w-full rounded-xl border border-border bg-muted/40 p-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#013ff4]/20 focus:border-[#013ff4] resize-none font-medium leading-relaxed"
                                            placeholder="Texte transcrit modifiable..."
                                        />
                                    </div>
                                )}

                                {voicePhase === "idle" && !noteContent && (
                                    <div className="p-4 text-center rounded-2xl bg-muted/40 border border-dashed border-border space-y-2">
                                        <p className="text-xs text-muted-foreground font-medium">
                                            Dictez un mémo vocal pour retenir les engagements.
                                        </p>
                                        <Button
                                            type="button"
                                            onClick={handleStartRecording}
                                            size="sm"
                                            className="rounded-xl bg-[#013ff4] hover:bg-[#013ff4]/90 text-white font-bold text-xs gap-1.5"
                                        >
                                            <Mic className="h-3.5 w-3.5" />
                                            Démarrer le vocal
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pied de carte avec rappel de confidentialité et boutons */}
                    <div className="mt-4 pt-3 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                            <Lock className="h-3 w-3 shrink-0" />
                            <span>Visible de vous seul sur cet appareil</span>
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                            {hasSavedNote && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDeleteNote}
                                    disabled={saving}
                                    className="h-8 px-2.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold"
                                    title="Supprimer la note"
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Effacer
                                </Button>
                            )}

                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSaveNote}
                                disabled={saving}
                                className="h-8 px-3.5 rounded-lg bg-[#013ff4] hover:bg-[#013ff4]/90 text-white text-xs font-bold gap-1.5 shadow-sm disabled:opacity-60"
                            >
                                <Check className="h-3.5 w-3.5" />
                                {saving ? "Enregistrement…" : hasSavedNote ? "Mettre à jour" : "Enregistrer"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Écran de recherche — point d'entrée universel de la recherche de profils.
 *              Design clair aligné charte (bleu roi #013ff4 / cyan #03b3f8).
 *              Assistant Groq : reformulations suggérées pendant la saisie,
 *              dégradation silencieuse si le service est indisponible.
 *              Soumission → /annuaire?search=…
 * @created 2026-08-19
 * @updated 2026-08-26
 */

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Bell, Search, ArrowRight, Mic, Sparkles, Loader2 } from "lucide-react"

// Délai entre la fin de la dictée et le lancement de la recherche. Assez court
// pour paraître immédiat, assez long pour que la phrase reconnue s'affiche —
// l'utilisateur voit ce qui a été compris avant de changer d'écran.
const VOICE_SUBMIT_DELAY_MS = 30

// Délai d'inactivité après la dernière frappe avant d'interroger l'assistant.
const ASSISTANT_DEBOUNCE_MS = 600

// Exemples de requêtes en langage naturel (guident l'utilisateur non expert).
const SUGGESTIONS = [
    "un couturier à Akpakpa",
    "électricien à Cotonou",
    "graphiste freelance",
    "menuisier à Porto-Novo",
]

export default function RecherchePage() {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [micAvailable, setMicAvailable] = useState(false)
    const [listening, setListening] = useState(false)
    // Phrase dictée en attente d'envoi : passer par un état évite de capturer
    // une version périmée de la navigation dans le gestionnaire de l'API vocale.
    const [dictated, setDictated] = useState<string | null>(null)
    // Reformulations de l'assistant Groq pendant la saisie (charge vide = masqué).
    const [assistantMessage, setAssistantMessage] = useState<string | null>(null)
    const [assistantSuggestions, setAssistantSuggestions] = useState<string[]>([])
    const [assistantLoading, setAssistantLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null)

    // Autofocus : le clavier s'ouvre immédiatement → l'utilisateur tape direct.
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    // Reconnaissance vocale (Web Speech API) — précieux pour la cible mobile.
    useEffect(() => {
        if (typeof window === "undefined") return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SR) return
        setMicAvailable(true)
        const recognition = new SR()
        recognition.lang = "fr-FR"
        recognition.interimResults = false
        recognition.maxAlternatives = 1
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const transcript = event?.results?.[0]?.[0]?.transcript || ""
            setQuery(transcript)
            setListening(false)
            if (transcript.trim()) setDictated(transcript.trim())
        }
        recognition.onend = () => setListening(false)
        recognition.onerror = () => setListening(false)
        recognitionRef.current = recognition
        return () => {
            try {
                recognition.stop()
            } catch {
                /* noop */
            }
        }
    }, [])

    // Une dictée vaut validation : l'utilisateur a parlé, il n'a pas à appuyer
    // sur un bouton en plus.
    useEffect(() => {
        if (!dictated) return
        const timer = setTimeout(() => {
            router.push(`/annuaire?search=${encodeURIComponent(dictated)}`)
            setDictated(null)
        }, VOICE_SUBMIT_DELAY_MS)
        return () => clearTimeout(timer)
    }, [dictated, router])

    // Assistant de recherche (Groq) : reformulations en direct pendant la frappe.
    // Non bloquant — réponse vide ou erreur = on masque simplement les pistes IA.
    useEffect(() => {
        const q = query.trim()
        if (q.length < 2) {
            setAssistantMessage(null)
            setAssistantSuggestions([])
            setAssistantLoading(false)
            return
        }
        setAssistantLoading(true)
        const controller = new AbortController()
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search-assistant?q=${encodeURIComponent(q)}`, {
                    signal: controller.signal,
                })
                const data = await res.json()
                setAssistantMessage(typeof data?.message === "string" && data.message ? data.message : null)
                setAssistantSuggestions(Array.isArray(data?.suggestions) ? data.suggestions.slice(0, 4) : [])
            } catch {
                /* requête annulée ou service indisponible : on reste silencieux */
            } finally {
                setAssistantLoading(false)
            }
        }, ASSISTANT_DEBOUNCE_MS)
        return () => {
            controller.abort()
            clearTimeout(timer)
        }
    }, [query])

    const submit = useCallback(() => {
        const q = query.trim()
        if (!q) {
            inputRef.current?.focus()
            return
        }
        router.push(`/annuaire?search=${encodeURIComponent(q)}`)
    }, [query, router])

    const toggleMic = useCallback(() => {
        const recognition = recognitionRef.current
        if (!recognition) return
        if (listening) {
            recognition.stop()
            setListening(false)
        } else {
            try {
                recognition.start()
                setListening(true)
            } catch {
                setListening(false)
            }
        }
    }, [listening])

    return (
        <div className="relative min-h-[100dvh] w-full overflow-hidden bg-card text-foreground">
            {/* Halos lumineux d'ambiance — charte */}
            <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#013ff4]/10 blur-[110px]" />
            <div className="pointer-events-none absolute top-40 -right-20 h-64 w-64 rounded-full bg-[#03b3f8]/10 blur-[110px]" />

            <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md lg:max-w-5xl flex-col px-6 pb-10 pt-4">

                {/* ── Top navbar ─────────────────────────────────────────────── */}
                <header className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        aria-label="Retour"
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    <span className="text-lg font-extrabold tracking-tight text-foreground">
                        Emi<span className="text-[#013ff4]">ID</span>
                    </span>

                    <Link
                        href="/notifications"
                        aria-label="Notifications"
                        className="relative flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#03b3f8] ring-2 ring-white" />
                    </Link>
                </header>

                {/* ── Contenu : 1 colonne mobile, 2 volets desktop ──────────── */}
                <div className="lg:grid lg:grid-cols-12 lg:gap-14 lg:items-start lg:flex-1 lg:flex-grow">
                    <div className="lg:col-span-7">
                        {/* ── En-tête ────────────────────────────────────────────── */}
                        <div className="mt-14 lg:mt-20 flex flex-col items-center lg:items-start text-center lg:text-left">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#013ff4]/15 bg-[#013ff4]/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#013ff4]">
                                <Sparkles className="h-3.5 w-3.5" />
                                Recherche
                            </span>

                            <h1 className="mt-5 text-[30px] lg:text-4xl font-extrabold leading-[1.15] tracking-tight text-foreground">
                                Qui recherchez-vous
                                <br />
                                <span className="relative inline-block">
                                    aujourd&apos;hui&nbsp;?
                                    <span className="absolute -bottom-1.5 left-0 h-1 w-full rounded-full bg-[linear-gradient(90deg,#013ff4_0%,#03b3f8_70%,transparent_100%)]" />
                                </span>
                            </h1>

                            <p className="mt-4 max-w-xs text-sm font-medium text-muted-foreground">
                                Décrivez ce que vous cherchez, même en langage courant.
                            </p>
                        </div>

                        {/* ── Barre de recherche ─────────────────────────────────── */}
                        <div className="mt-8">
                    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 pl-4 shadow-[0_12px_40px_-12px_rgba(1,63,244,0.25)] transition-colors focus-within:border-[#013ff4]/40">
                        <Search className="h-5 w-5 shrink-0 text-slate-400" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && submit()}
                            placeholder="Rechercher un artisan, un métier..."
                            aria-label="Rechercher"
                            className="min-w-0 flex-1 bg-transparent py-2 text-[15px] font-medium text-foreground placeholder:text-slate-400 focus:outline-none"
                        />
                        {micAvailable && (
                            <button
                                onClick={toggleMic}
                                aria-label={listening ? "Arrêter la dictée" : "Recherche vocale"}
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                                    listening
                                        ? "bg-[#013ff4]/10 text-[#013ff4] animate-pulse"
                                        : "text-slate-400 hover:bg-muted"
                                }`}
                            >
                                <Mic className="h-5 w-5" />
                            </button>
                        )}
                        <button
                            onClick={submit}
                            aria-label="Lancer la recherche"
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#013ff4] text-white shadow-[0_8px_20px_-4px_rgba(1,63,244,0.5)] transition-all hover:bg-[#0150fd] hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Suggestions en langage naturel */}
                    <div className="mt-5">
                        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Suggestions</p>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => router.push(`/annuaire?search=${encodeURIComponent(s)}`)}
                                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[#013ff4]/40 hover:bg-[#013ff4]/[0.04] hover:text-[#013ff4]"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    </div>
                    </div>

                    {/* ── Assistant de recherche — volet droit desktop ──────────── */}
                    <aside className="lg:col-span-5 lg:pt-24 mt-auto lg:mt-0 pt-10">
                        <div className="relative overflow-hidden rounded-3xl border border-border bg-[linear-gradient(135deg,#013ff4_0%,#03b3f8_100%)] p-5 text-white shadow-[0_18px_45px_-15px_rgba(1,63,244,0.5)]">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-card/15 blur-2xl" />
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card/15">
                                {assistantLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Sparkles className="h-5 w-5" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold">Assistant de recherche</p>
                                <p className="text-xs text-white/80">
                                    {assistantMessage ||
                                        "Décrivez votre besoin : il vous suggère des pistes adaptées."}
                                </p>
                            </div>
                        </div>
                        {assistantSuggestions.length > 0 && (
                            <div className="relative mt-4 flex flex-wrap gap-2">
                                {assistantSuggestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() =>
                                            router.push(`/annuaire?search=${encodeURIComponent(s)}`)
                                        }
                                        className="rounded-full bg-card/15 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-card/25"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

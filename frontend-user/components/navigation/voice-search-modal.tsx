/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Modal d'écoute et recherche vocale intelligente (Voice Search Modal).
 *              Microphone animé, onde sonore réactive, suggestions et redirection automatique vers l'annuaire.
 * @created 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, X, Sparkles, Search, Check, AlertCircle, ArrowRight } from "lucide-react"
import { useVoiceSearch } from "@/hooks/use-voice-search"
import { cn } from "@/lib/utils"

interface VoiceSearchModalProps {
  open: boolean
  onClose: () => void
}

const VOICE_SUGGESTIONS = [
  "Menuisier à Cotonou",
  "Plombier à Akpakpa",
  "Graphiste freelance",
  "Électricien du bâtiment",
  "Couturier traditionnel",
]

const WAVE_BARS = [35, 65, 90, 50, 80, 100, 70, 45, 85]

export function VoiceSearchModal({ open, onClose }: VoiceSearchModalProps) {
  const router = useRouter()
  const [interimText, setInterimText] = useState("")
  const [confirmedText, setConfirmedText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleSubmit = useCallback(
    (query: string) => {
      const clean = query.trim()
      if (!clean) return
      setIsSubmitting(true)
      setConfirmedText(clean)

      submitTimerRef.current = setTimeout(() => {
        onClose()
        router.push(`/annuaire?search=${encodeURIComponent(clean)}`)
      }, 450)
    },
    [onClose, router]
  )

  const handleVoiceResult = useCallback(
    (transcript: string) => {
      setInterimText("")
      handleSubmit(transcript)
    },
    [handleSubmit]
  )

  const handleInterim = useCallback((interim: string) => {
    setInterimText(interim)
  }, [])

  const { available, listening, start, stop } = useVoiceSearch({
    onResult: handleVoiceResult,
    onInterim: handleInterim,
  })

  // Démarrage automatique du micro à l'ouverture si supporté
  useEffect(() => {
    if (open) {
      setInterimText("")
      setConfirmedText("")
      setIsSubmitting(false)
      if (available) {
        start()
      }
    } else {
      stop()
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current)
    }
  }, [open, available, start, stop])

  // Fermeture par touche Echap
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  const goToKeyboardSearch = useCallback(() => {
    onClose()
    router.push("/recherche")
  }, [onClose, router])

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex flex-col justify-end lg:hidden">
        {/* Voile de fond flouté */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Panneau inférieur (Bottom Sheet) */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="relative z-10 w-full rounded-t-[32px] border-t border-border/80 bg-card/95 p-6 pb-8 shadow-[0_-16px_48px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
        >
          {/* Poignée supérieure */}
          <div className="flex justify-center mb-4">
            <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          </div>

          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#013ff4]/10 text-[#013ff4]">
                <Sparkles className="h-4 w-4 text-[#013ff4]" />
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Recherche Vocale IA
              </h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted active:scale-95"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Corps principal : Micro et Retours */}
          <div className="flex flex-col items-center justify-center py-4">
            <MicrophoneOrb
              listening={listening}
              isSubmitting={isSubmitting}
              available={available}
              onClick={() => (listening ? stop() : start())}
            />

            {/* Statut / Retours vocaux */}
            <VoiceStatusDisplay
              available={available}
              listening={listening}
              isSubmitting={isSubmitting}
              interimText={interimText}
              confirmedText={confirmedText}
            />

            {/* Forme d'onde animée */}
            {listening && <WaveformVisualizer />}
          </div>

          {/* Suggestions rapides */}
          <div className="mt-6 mb-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              Exemples de recherche vocale :
            </p>
            <div className="flex flex-wrap gap-2">
              {VOICE_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSubmit(suggestion)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-[#013ff4]/50 hover:bg-[#013ff4]/5 active:scale-95"
                >
                  <span>{suggestion}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Pied de feuille : Bascule recherche clavier */}
          <div className="mt-4 pt-3 border-t border-border/60">
            <button
              onClick={goToKeyboardSearch}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-muted/40 py-3 text-xs font-bold text-foreground transition-colors hover:bg-muted active:scale-[0.99]"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Ou saisir votre recherche au clavier</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

interface MicrophoneOrbProps {
  listening: boolean
  isSubmitting: boolean
  available: boolean
  onClick: () => void
}

function MicrophoneOrb({ listening, isSubmitting, available, onClick }: MicrophoneOrbProps) {
  return (
    <div className="relative flex items-center justify-center my-2">
      {/* Ondes radar pulsantes */}
      {listening && (
        <>
          <motion.span
            animate={{ scale: [1, 1.5, 1.9], opacity: [0.6, 0.25, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
            className="pointer-events-none absolute -inset-3 rounded-full bg-[#03b3f8]/30 blur-sm"
          />
          <motion.span
            animate={{ scale: [1, 1.3, 1.6], opacity: [0.8, 0.35, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: 0.4, ease: "easeOut" }}
            className="pointer-events-none absolute -inset-2 rounded-full bg-[#013ff4]/30 blur-sm"
          />
        </>
      )}

      {/* Bouton principal de micro */}
      <button
        type="button"
        disabled={!available}
        onClick={onClick}
        aria-label={listening ? "Arrêter l'écoute" : "Démarrer l'écoute vocale"}
        className={cn(
          "relative z-10 flex h-20 w-20 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 active:scale-95",
          isSubmitting
            ? "bg-emerald-500 shadow-emerald-500/40"
            : listening
              ? "bg-gradient-to-tr from-[#013ff4] via-[#0b4bff] to-[#03b3f8] shadow-[#013ff4]/50 ring-4 ring-[#03b3f8]/30"
              : "bg-slate-700 hover:bg-slate-600"
        )}
      >
        {isSubmitting ? (
          <Check className="h-9 w-9 animate-in zoom-in-75 duration-200" />
        ) : (
          <Mic className={cn("h-9 w-9", listening && "animate-pulse")} />
        )}
      </button>
    </div>
  )
}

interface VoiceStatusDisplayProps {
  available: boolean
  listening: boolean
  isSubmitting: boolean
  interimText: string
  confirmedText: string
}

function VoiceStatusDisplay({
  available,
  listening,
  isSubmitting,
  interimText,
  confirmedText,
}: VoiceStatusDisplayProps) {
  if (!available) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-600">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Dictée vocale non disponible sur ce navigateur</span>
      </div>
    )
  }

  if (isSubmitting || confirmedText) {
    return (
      <div className="mt-4 text-center">
        <p className="text-xs font-semibold text-emerald-600">Recherche confirmée</p>
        <p className="mt-1 text-base font-extrabold text-foreground">« {confirmedText} »</p>
      </div>
    )
  }

  if (interimText) {
    return (
      <div className="mt-4 text-center">
        <p className="text-xs font-semibold text-[#013ff4] animate-pulse">Transcription en direct...</p>
        <p className="mt-1 text-base font-extrabold text-foreground italic">« {interimText} »</p>
      </div>
    )
  }

  return (
    <div className="mt-4 text-center">
      <p className="text-sm font-bold text-foreground">
        {listening ? "Parlez maintenant..." : "Appuyez sur le micro pour parler"}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {listening ? "Dites un métier, une compétence ou une ville" : "Recherche instantanée sans clavier"}
      </p>
    </div>
  )
}

function WaveformVisualizer() {
  return (
    <div className="flex items-center gap-1.5 mt-3 h-6">
      {WAVE_BARS.map((h, i) => (
        <motion.span
          key={i}
          animate={{ height: [6, (h * 24) / 100, 6] }}
          transition={{
            repeat: Infinity,
            duration: 0.5 + (i % 4) * 0.15,
            ease: "easeInOut",
          }}
          className="w-1 rounded-full bg-gradient-to-t from-[#013ff4] to-[#03b3f8]"
        />
      ))}
    </div>
  )
}

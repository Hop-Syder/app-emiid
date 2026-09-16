/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte interactive d'assistance IA pour cadrer le besoin d'une mission.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import { Sparkles, Loader2, ArrowRight, Wand2 } from "lucide-react"
import type { MissionBriefResult } from "@/lib/mission-brief-assistant"

interface MissionBriefAiCardProps {
  onApplyBrief: (brief: MissionBriefResult) => void
}

export function MissionBriefAiCard({ onApplyBrief }: MissionBriefAiCardProps) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 5) return

    setLoading(true)
    setFeedback(null)

    try {
      const res = await fetch("/api/missions/ai-refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setFeedback(data.error || "Impossible d'analyser le besoin pour l'instant.")
        return
      }

      onApplyBrief(data.brief)
      setFeedback("Votre besoin a été structuré avec succès dans le formulaire ci-dessous !")
    } catch (err) {
      setFeedback("Erreur de connexion lors de l'appel à l'assistant IA.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-[#000616] via-[#021442] to-[#000616] p-6 text-white shadow-xl md:p-8">
      {/* Halos de lumière */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#03b3f8]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#013ff4]/25 blur-3xl" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#03b3f8]">
          <Wand2 className="h-4 w-4" />
          <span>Assistant IA de Cadrage EmiID</span>
        </div>

        <div>
          <h2 className="font-heading text-xl font-black text-white md:text-2xl">
            Décrivez votre besoin en quelques mots
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            Exprimez librement ce que vous cherchez. Notre IA convertit instantanément votre texte en cahier des charges clair, suggère un budget réaliste et sélectionne la bonne catégorie.
          </p>
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex : J'ai besoin en urgence d'un menuisier qualifié à Cotonou pour concevoir et poser 2 portes en teck massif avant le 28 septembre..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-white/15 bg-white/[0.06] p-4 text-xs text-white placeholder-slate-400 outline-none backdrop-blur-md transition-colors focus:border-[#03b3f8] focus:ring-1 focus:ring-[#03b3f8]"
          />
        </div>

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || prompt.trim().length < 5}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#013ff4] to-[#03b3f8] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Structuration en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Cadrer et pré-remplir</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400">
            Vous garderez le contrôle total pour modifier les valeurs avant publication.
          </p>
        </div>

        {feedback && (
          <div
            className={`rounded-xl p-3 text-xs font-medium ${
              feedback.includes("succès")
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border border-rose-500/30 bg-rose-500/10 text-rose-300"
            }`}
          >
            {feedback}
          </div>
        )}
      </div>
    </div>
  )
}

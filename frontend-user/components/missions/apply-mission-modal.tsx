/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Modal de candidature à une mission courte avec consommation de 1 crédit.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { useCredits } from "@/hooks/use-credits"
import {
  X,
  Coins,
  ShieldCheck,
  Zap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react"

interface ApplyMissionModalProps {
  missionId: string
  missionTitle: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ApplyMissionModal({
  missionId,
  missionTitle,
  isOpen,
  onClose,
  onSuccess,
}: ApplyMissionModalProps) {
  const { balance, loading: creditsLoading, refetch: refetchCredits } = useCredits()

  const [proposal, setProposal] = useState("")
  const [priceQuote, setPriceQuote] = useState<number | "">("")
  const [estimatedDays, setEstimatedDays] = useState<number | "">("")

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const hasEnoughCredits = balance >= 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!proposal.trim() || proposal.trim().length < 10) {
      setErrorMsg("Veuillez rédiger une note d'intention de 10 caractères minimum.")
      return
    }

    if (!hasEnoughCredits) {
      setErrorMsg("Solde insuffisant. Vous devez disposer d'au moins 1 crédit pour postuler.")
      return
    }

    try {
      setSubmitting(true)

      const res = await fetch("/api/missions/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          proposal: proposal.trim(),
          priceQuote: priceQuote ? Number(priceQuote) : null,
          estimatedDays: estimatedDays ? Number(estimatedDays) : null,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Impossible de soumettre votre candidature.")
        return
      }

      setSuccessMsg(data.message || "Candidature enregistrée avec succès !")
      await refetchCredits()

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur de connexion lors de la candidature.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop sombre */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 md:p-8">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-[#013ff4] dark:bg-blue-950/40 dark:text-[#03b3f8]">
              <Coins className="h-3.5 w-3.5" />
              <span>Consomme 1 crédit de candidature</span>
            </div>
            <h3 className="mt-2 font-heading text-lg font-bold text-slate-900 dark:text-white">
              Postuler à la mission
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
              {missionTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alerte solde de crédits */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#013ff4] dark:text-[#03b3f8]" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Votre solde :
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-white">
              {creditsLoading ? "..." : `${balance} crédit${balance > 1 ? "s" : ""}`}
            </span>
          </div>

          {!hasEnoughCredits && (
            <Link
              href="/credits"
              className="text-xs font-bold text-[#013ff4] hover:underline dark:text-[#03b3f8]"
            >
              Recharger
            </Link>
          )}
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <p>{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Votre note d'intention & méthodologie <span className="text-[#013ff4]">*</span>
            </label>
            <textarea
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Expliquez brièvement comment vous comptez exécuter la mission et vos références similaires..."
              rows={4}
              required
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 outline-none transition-colors focus:border-[#013ff4] focus:bg-white focus:ring-1 focus:ring-[#013ff4] dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Devis ferme (FCFA)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={priceQuote}
                onChange={(e) => setPriceQuote(e.target.value ? Number(e.target.value) : "")}
                placeholder="Ex : 45000"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 outline-none transition-colors focus:border-[#013ff4] focus:bg-white focus:ring-1 focus:ring-[#013ff4] dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Délai estimé (jours)
              </label>
              <input
                type="number"
                min={1}
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value ? Number(e.target.value) : "")}
                placeholder="Ex : 3"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 outline-none transition-colors focus:border-[#013ff4] focus:bg-white focus:ring-1 focus:ring-[#013ff4] dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
              />
            </div>
          </div>

          {/* Règle de remboursement automatique */}
          <div className="rounded-xl bg-blue-50/50 p-3 text-[11px] leading-relaxed text-slate-600 dark:bg-blue-950/20 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-[#013ff4] dark:text-[#03b3f8]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Garantie de remboursement EmiID</span>
            </div>
            <p className="mt-1">
              Si le client annule sa mission sans retenir de candidat, votre crédit sera automatiquement recrédité sur votre portefeuille.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !hasEnoughCredits || !!successMsg}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#013ff4] px-5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-[#0135d0] active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validation de la candidature...</span>
                </>
              ) : !hasEnoughCredits ? (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Solde de crédits insuffisant</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Confirmer la candidature (1 crédit)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

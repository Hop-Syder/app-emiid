/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Modal de modification d'une candidature déjà soumise (PENDING) —
 *              ne consomme pas de crédit supplémentaire, contrairement à
 *              ApplyMissionModal.
 * @created 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import { X, Pencil, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import type { MissionApplication } from "@/types/missions"

interface EditApplicationModalProps {
  application: MissionApplication
  missionTitle: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditApplicationModal({
  application,
  missionTitle,
  isOpen,
  onClose,
  onSuccess,
}: EditApplicationModalProps) {
  const [proposal, setProposal] = useState(application.pitch || "")
  const [priceQuote, setPriceQuote] = useState<number | "">(application.proposed_price)

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!proposal.trim() || proposal.trim().length < 10) {
      setErrorMsg("Veuillez rédiger une note d'intention de 10 caractères minimum.")
      return
    }

    if (priceQuote === "" || Number(priceQuote) < 0) {
      setErrorMsg("Le devis proposé est obligatoire.")
      return
    }

    try {
      setSubmitting(true)

      const res = await fetch("/api/missions/update-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          proposal: proposal.trim(),
          priceQuote: Number(priceQuote),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Impossible de modifier votre candidature.")
        return
      }

      setSuccessMsg(data.message || "Candidature mise à jour avec succès !")

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1200)
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur de connexion.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-background/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-[#013ff4] dark:bg-blue-950/40 dark:text-[#03b3f8]">
              <Pencil className="h-3.5 w-3.5" />
              <span>Aucun crédit supplémentaire consommé</span>
            </div>
            <h3 className="mt-2 font-heading text-lg font-bold text-foreground">
              Modifier ma candidature
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {missionTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Votre note d'intention & méthodologie <span className="text-[#013ff4]">*</span>
            </label>
            <textarea
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Expliquez brièvement comment vous comptez exécuter la mission et vos références similaires..."
              rows={4}
              required
              className="w-full resize-none rounded-2xl border border-border bg-muted/50 p-3 text-base md:text-sm text-foreground outline-none transition-colors focus:border-[#013ff4] focus:bg-card focus:ring-1 focus:ring-[#013ff4]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Devis ferme (FCFA) <span className="text-[#013ff4]">*</span>
            </label>
            <input
              type="number"
              min={0}
              step={500}
              value={priceQuote}
              onChange={(e) => setPriceQuote(e.target.value ? Number(e.target.value) : "")}
              placeholder="Ex : 45000"
              required
              className="h-11 w-full rounded-2xl border border-border bg-muted/50 px-3 text-base md:text-sm text-foreground outline-none transition-colors focus:border-[#013ff4] focus:bg-card focus:ring-1 focus:ring-[#013ff4]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !!successMsg}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#013ff4] px-5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-[#0135d0] active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description File d'attente d'arbitrage des litiges de missions (Admin EmiID).
 * @created 2026-09-15
 * @updated 2026-09-15
 * �� ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldAlert,
  Loader2,
  User,
  Scale,
} from "lucide-react"

interface DisputeItem {
  id: string
  title: string
  cancellation_reason?: string | null
  escrow_amount?: number | null
  assigned_to?: string | null
  client?: { full_name?: string | null }
  freelancer?: { full_name?: string | null }
  updated_at: string
}

interface AdminDisputesQueueProps {
  disputes: DisputeItem[]
  onRefresh: () => void
}

export function AdminDisputesQueue({ disputes, onRefresh }: AdminDisputesQueueProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleResolve = async (
    missionId: string,
    resolution: "REFUND_CLIENT" | "RELEASE_FREELANCER"
  ) => {
    try {
      setProcessingId(missionId)
      setFeedback(null)

      const res = await fetch("/api/admin/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESOLVE_DISPUTE",
          missionId,
          resolution,
          notes: `Arbitré en faveur de ${
            resolution === "REFUND_CLIENT" ? "Client (Remboursement)" : "Prestataire (Paiement)"
          }`,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setFeedback(data.error || "Échec de l'arbitrage.")
        return
      }

      setFeedback("Arbitrage exécuté et fonds débloqués selon la décision.")
      onRefresh()
    } catch (err: any) {
      setFeedback(err?.message || "Erreur de connexion.")
    } finally {
      setProcessingId(null)
    }
  }

  const handleStrike = async (freelancerId: string) => {
    try {
      setProcessingId(freelancerId)
      const res = await fetch("/api/admin/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_STRIKE",
          freelancerId,
          notes: "Sanction pour abandon ou non-conformité grave.",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback("Strike d'intégrité consigné avec succès.")
        onRefresh()
      }
    } catch (err: any) {
      setFeedback("Erreur lors de la consignation du strike.")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-8">
      <div className="flex items-center justify-between pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Scale className="h-4 w-4" />
            <span>Chambre d'arbitrage EmiID</span>
          </div>
          <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
            Litiges en attente de décision ({disputes.length})
          </h3>
        </div>
      </div>

      {feedback && (
        <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
          {feedback}
        </div>
      )}

      {disputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
            Aucun litige actif
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Toutes les missions se déroulent en conformité avec la charte de confiance.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="py-6 space-y-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                    {dispute.title}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Client : <strong className="text-slate-800 dark:text-slate-200">{dispute.client?.full_name || "Client"}</strong></span>
                    <span>•</span>
                    <span>Prestataire : <strong className="text-slate-800 dark:text-slate-200">{dispute.freelancer?.full_name || "Prestataire"}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Séquestre consigné</span>
                  <p className="text-sm font-black text-[#013ff4] dark:text-[#03b3f8]">
                    {(dispute.escrow_amount || 0).toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              </div>

              {/* Motif du litige */}
              <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5 text-xs text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-300">
                <p className="font-bold">Motif de la contestation :</p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  {dispute.cancellation_reason || "Non spécifié par le contestataire."}
                </p>
              </div>

              {/* Actions d'arbitrage */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={processingId === dispute.id}
                  onClick={() => handleResolve(dispute.id, "REFUND_CLIENT")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
                  <span>Rembourser le Client</span>
                </button>

                <button
                  type="button"
                  disabled={processingId === dispute.id}
                  onClick={() => handleResolve(dispute.id, "RELEASE_FREELANCER")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Libérer au Prestataire</span>
                </button>

                {dispute.assigned_to && (
                  <button
                    type="button"
                    disabled={processingId === dispute.assigned_to}
                    onClick={() => handleStrike(dispute.assigned_to!)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Appliquer 1 Strike</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

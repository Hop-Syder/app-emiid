/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Timeline interactive du cycle de vie de mission avec fenêtre 72h et litige.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Clock,
  Play,
  PackageCheck,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  Lock,
} from "lucide-react"
import type { Mission, MissionStatus } from "@/types/missions"

interface MissionStatusTimelineProps {
  mission: Mission
  isClient: boolean
  isAssignedFreelancer: boolean
  onActionSuccess: () => void
}

const STEPS: { key: MissionStatus; label: string; desc: string }[] = [
  {
    key: "OPEN",
    label: "Publication & Candidatures",
    desc: "Recherche des 2 candidats qualifiés",
  },
  {
    key: "ASSIGNED",
    label: "Prestataire Retenu",
    desc: "Sélection effectuée & séquestre enclenché",
  },
  {
    key: "IN_PROGRESS",
    label: "Exécution des Travaux",
    desc: "Prestation en cours de réalisation",
  },
  {
    key: "DELIVERED",
    label: "Livraison & Recette",
    desc: "Fenêtre 72h de contestation active",
  },
  {
    key: "COMPLETED",
    label: "Mission Validée & Clôturée",
    desc: "Fonds séquestre libérés au prestataire",
  },
]

export function MissionStatusTimeline({
  mission,
  isClient,
  isAssignedFreelancer,
  onActionSuccess,
}: MissionStatusTimelineProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState("")

  const statusIndex = STEPS.findIndex((s) => s.key === mission.status)
  const isDisputed = mission.status === "DISPUTED"

  const handleAction = async (action: "START_WORK" | "DELIVER" | "COMPLETE" | "DISPUTE", reason?: string) => {
    try {
      setLoadingAction(action)
      setErrorMsg(null)

      const res = await fetch("/api/missions/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          missionId: mission.id,
          reason,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "L'action n'a pas pu aboutir.")
        return
      }

      setShowDisputeModal(false)
      onActionSuccess()
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur de connexion.")
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Suivi & Cycle de vie de la mission
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Traçabilité des jalons de livraison et protection séquestre
          </p>
        </div>

        {isDisputed && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-4 w-4" />
            <span>Litige en cours d'arbitrage</span>
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Stepper visuel */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
        {STEPS.map((step, idx) => {
          const isDone = statusIndex > idx || mission.status === "COMPLETED"
          const isCurrent = statusIndex === idx && !isDisputed

          return (
            <div
              key={step.key}
              className={`relative flex flex-col rounded-2xl p-3.5 transition-all ${
                isCurrent
                  ? "border border-[#013ff4] bg-blue-500/5 shadow-xs"
                  : isDone
                  ? "bg-slate-50 dark:bg-slate-800/40"
                  : "opacity-40"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-[#013ff4] text-white"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {step.label}
                </span>
              </div>
              <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                {step.desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* Alerte fenêtre 72h si DELIVERED */}
      {mission.status === "DELIVERED" && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Fenêtre de recette de 72 heures active
              </h4>
              <p className="text-xs md:text-sm leading-relaxed text-amber-800 dark:text-amber-300">
                Le travail a été déclaré livré par le prestataire. Le client dispose de 72 heures pour tester et valider le livrable. Sans contestation de votre part dans ce délai, les fonds seront automatiquement libérés au prestataire.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Boutons d'action contextuels */}
      <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {/* Actions Freelance */}
        {isAssignedFreelancer && mission.status === "ASSIGNED" && (
          <button
            type="button"
            onClick={() => handleAction("START_WORK")}
            disabled={loadingAction === "START_WORK"}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#013ff4] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-[#0135d0] active:scale-95 disabled:opacity-50"
          >
            {loadingAction === "START_WORK" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>Démarrer la mission (Passer à En cours)</span>
          </button>
        )}

        {isAssignedFreelancer && mission.status === "IN_PROGRESS" && (
          <button
            type="button"
            onClick={() => handleAction("DELIVER")}
            disabled={loadingAction === "DELIVER"}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            {loadingAction === "DELIVER" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PackageCheck className="h-4 w-4" />
            )}
            <span>Déclarer la mission livrée</span>
          </button>
        )}

        {/* Actions Client */}
        {isClient && mission.status === "DELIVERED" && (
          <>
            <button
              type="button"
              onClick={() => handleAction("COMPLETE")}
              disabled={loadingAction === "COMPLETE"}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
            >
              {loadingAction === "COMPLETE" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Valider le travail & Libérer les fonds</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDisputeModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Contester / Ouvrir un litige</span>
            </button>
          </>
        )}
      </div>

      {/* Modal de contestation */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowDisputeModal(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-base font-bold">Ouverture d'un litige</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Les fonds séquestre seront immédiatement bloqués. L'équipe d'arbitrage EmiID interviendra sous 48h.
            </p>

            <div className="mt-4 space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Motif de la contestation <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Décrivez les non-conformités constatées par rapport au cahier des charges initial..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-base md:text-sm text-slate-900 outline-none transition-colors focus:border-rose-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDisputeModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={loadingAction === "DISPUTE" || disputeReason.trim().length < 10}
                onClick={() => handleAction("DISPUTE", disputeReason.trim())}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 disabled:opacity-50"
              >
                {loadingAction === "DISPUTE" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Confirmer le litige</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

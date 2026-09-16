/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section d'affichage et de sélection des candidatures (Étape 4).
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Users2,
  CheckCircle2,
  Clock,
  Banknote,
  User,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react"
import type { MissionApplication } from "@/types/missions"

interface MissionApplicationsSectionProps {
  missionId: string
  applications: MissionApplication[]
  isClient: boolean
  canSelect: boolean
  onSelectSuccess: () => void
}

export function MissionApplicationsSection({
  missionId,
  applications,
  isClient,
  canSelect,
  onSelectSuccess,
}: MissionApplicationsSectionProps) {
  const [selectingId, setSelectingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSelect = async (applicationId: string) => {
    try {
      setSelectingId(applicationId)
      setErrorMsg(null)

      const res = await fetch("/api/missions/select-applicant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          applicationId,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Impossible de retenir ce prestataire.")
        return
      }

      onSelectSuccess()
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur de connexion.")
    } finally {
      setSelectingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Candidatures reçues ({applications.length}/2)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isClient
              ? "Examinez les 2 offres et retenez le prestataire idéal pour démarrer les travaux."
              : "Les candidatures sont limitées à 2 prestataires maximum par mission."}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#013ff4] dark:bg-blue-950/40 dark:text-[#03b3f8]">
          <Users2 className="h-3.5 w-3.5" />
          <span>Plafond 2 candidats</span>
        </span>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 inline mr-1" />
          {errorMsg}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center dark:border-slate-800 dark:bg-slate-900/30">
          <Users2 className="h-8 w-8 text-slate-400" />
          <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            Aucune candidature pour le moment
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            La mission est en attente des 2 propositions de prestataires qualifiés.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {applications.map((app) => {
            const isAccepted = app.status === "ACCEPTED"
            const isRejected = app.status === "REJECTED"

            return (
              <div
                key={app.id}
                className={`relative flex flex-col justify-between rounded-3xl border p-6 transition-all ${
                  isAccepted
                    ? "border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20 dark:bg-emerald-950/20"
                    : isRejected
                    ? "border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-900/30"
                    : "border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                }`}
              >
                <div>
                  {/* Profil Freelance */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {app.freelancer?.avatar_url ? (
                        <Image
                          src={app.freelancer.avatar_url}
                          alt={app.freelancer.full_name || "Prestataire"}
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-full object-cover ring-2 ring-[#013ff4]/20"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#013ff4]/10 text-[#013ff4]">
                          <User className="h-5 w-5" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {app.freelancer?.full_name || "Prestataire EmiID"}
                          </h4>
                          {app.freelancer?.identity_verified && (
                            <ShieldCheck className="h-3.5 w-3.5 text-[#013ff4] dark:text-[#03b3f8]" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {app.freelancer?.headline || "Professionnel Certifié"}
                        </p>
                      </div>
                    </div>

                    {isAccepted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                        <CheckCircle2 className="h-3 w-3" /> Retenu
                      </span>
                    )}
                  </div>

                  {/* Chiffres clés devis */}
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/40">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Devis proposé
                      </span>
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {app.price_quote
                          ? `${app.price_quote.toLocaleString("fr-FR")} FCFA`
                          : "Non spécifié"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Délai estimé
                      </span>
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {app.estimated_days
                          ? `${app.estimated_days} jour${app.estimated_days > 1 ? "s" : ""}`
                          : "À convenir"}
                      </p>
                    </div>
                  </div>

                  {/* Note d'intention */}
                  <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {app.proposal || "Aucune note d'intention fournie."}
                  </p>
                </div>

                {/* Bouton de sélection (réservé au client si statut OPEN) */}
                {isClient && canSelect && !isAccepted && !isRejected && (
                  <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleSelect(app.id)}
                      disabled={!!selectingId}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-[#013ff4] px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-[#0135d0] active:scale-98 disabled:opacity-50"
                    >
                      {selectingId === app.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      <span>Retenir ce prestataire</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

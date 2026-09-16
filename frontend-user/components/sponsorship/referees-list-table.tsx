/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tableau de bord et suivi de l'activité des filleuls parrainés.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Image from "next/image"
import { Users, User, ShieldCheck, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import type { RefereeItem } from "@/hooks/use-sponsorship"

interface RefereesListTableProps {
  referees: RefereeItem[]
  loading?: boolean
}

export function RefereesListTable({ referees, loading = false }: RefereesListTableProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="h-6 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/50"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Vos membres parrainés
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Suivez l'intégration et l'intégrité de vos cooptations
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {referees.length} filleul{referees.length > 1 ? "s" : ""}
        </span>
      </div>

      {referees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <Users className="h-7 w-7" />
          </div>
          <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
            Aucun filleul enregistré
          </p>
          <p className="mt-1 max-w-xs text-xs text-slate-400">
            Partagez votre lien d'invitation avec vos confrères et collègues de confiance pour démarrer.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {referees.map((item) => {
            const formattedDate = new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(item.created_at))

            const strikes = item.strikes_count || 0

            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
              >
                <div className="flex items-center gap-3">
                  {item.referee?.avatar_url ? (
                    <Image
                      src={item.referee.avatar_url}
                      alt={item.referee.full_name || "Filleul"}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#013ff4]/10 text-[#013ff4]">
                      <User className="h-5 w-5" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.referee?.full_name || "Membre invité"}
                      </span>
                      {item.referee?.identity_verified && (
                        <ShieldCheck className="h-3.5 w-3.5 text-[#013ff4] dark:text-[#03b3f8]" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Inscrit le {formattedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        strikes >= 2
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : strikes === 1
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {strikes >= 2
                        ? "Suspendu (2 strikes)"
                        : strikes === 1
                        ? "1 avertissement"
                        : "Profil exemplaire"}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

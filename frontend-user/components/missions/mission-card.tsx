/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte de mission courte — Bento Grid EmiID avec jauge de sélection 2/2.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import {
  Calendar,
  Users2,
  Banknote,
  Clock,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react"
import type { Mission } from "@/types/missions"

interface MissionCardProps {
  mission: Mission
}

export function MissionCard({ mission }: MissionCardProps) {
  const appCount = mission.applications_count || 0
  const isFull = appCount >= 2
  const isOpen = mission.status === "OPEN"

  const formattedBudget =
    mission.budget_min && mission.budget_max
      ? `${mission.budget_min.toLocaleString("fr-FR")} - ${mission.budget_max.toLocaleString("fr-FR")} FCFA`
      : mission.budget_min
      ? `À partir de ${mission.budget_min.toLocaleString("fr-FR")} FCFA`
      : mission.budget_max
      ? `Jusqu'à ${mission.budget_max.toLocaleString("fr-FR")} FCFA`
      : "Budget à convenir"

  const createdDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(mission.created_at))

  return (
    <Link
      href={`/missions/${mission.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#013ff4]/40 hover:shadow-xl hover:shadow-blue-500/5 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-[#013ff4]/60"
    >
      <div>
        {/* En-tête de la carte */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-400">
            Publiée le {createdDate}
          </span>

          {/* Badge statut */}
          {isOpen ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isFull
                  ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  : appCount === 1
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <Users2 className="h-3 w-3" />
              <span>
                {isFull
                  ? "2/2 Complet"
                  : appCount === 1
                  ? "1/2 Candidat (Dernière place)"
                  : "0/2 Candidat"}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#013ff4] dark:text-[#03b3f8]">
              {mission.status}
            </span>
          )}
        </div>

        {/* Titre */}
        <h3 className="mt-3 font-heading text-base font-bold text-slate-900 transition-colors group-hover:text-[#013ff4] dark:text-white dark:group-hover:text-[#03b3f8]">
          {mission.title}
        </h3>

        {/* Description tronquée */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {mission.description}
        </p>
      </div>

      {/* Pied de carte */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Budget estimé
            </span>
            <p className="text-sm font-black text-slate-900 dark:text-white">
              {formattedBudget}
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-[#013ff4] transition-transform group-hover:translate-x-0.5 dark:text-[#03b3f8]">
            <span>Consulter</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}

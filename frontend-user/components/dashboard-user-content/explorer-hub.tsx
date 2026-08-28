/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Bloc « Explorer » unifié — Premium / Nouveaux / Catégories en onglets.
 *              Remplace 3 sections empilées → 1 seul bloc (moins de scroll, moins de
 *              redondance avec l'Annuaire).
 * @created 2026-07-10
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Crown, Sparkles, LayoutGrid, ArrowRight, Images } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PublicProfile } from "@/types"
import { EntrepreneursSection } from "./entrepreneurs-section"
import { CategoriesExplorer } from "./categories-explorer"
import { RealisationsShowcase } from "./realisations-showcase"

type TabId = "new" | "premium" | "categories" | "realisations"

interface ExplorerHubProps {
  premiumProfiles: PublicProfile[]
  newProfiles: PublicProfile[]
  categoryCounts?: Record<string, number>
  /**
   * Profils encore en cours de chargement. Sans cela, une liste vide est
   * indiscernable d'une absence de résultats et l'on affiche « aucun profil »
   * à quelqu'un dont les données arrivent.
   */
  loading?: boolean
}

export function ExplorerHub({ premiumProfiles, newProfiles, categoryCounts, loading = false }: ExplorerHubProps) {
  const hasPremium = premiumProfiles.length > 0

  const tabs = [
    { id: "new" as const, label: "Nouveaux", icon: Sparkles, color: "text-[#013ff4]", chip: "bg-[#013ff4]/10" },
    ...(hasPremium ? [{ id: "premium" as const, label: "Premium", icon: Crown, color: "text-amber-500", chip: "bg-amber-100" }] : []),
    { id: "realisations" as const, label: "Réalisations", icon: Images, color: "text-[#03b3f8]", chip: "bg-[#03b3f8]/10" },
    { id: "categories" as const, label: "Catégories", icon: LayoutGrid, color: "text-[#013ff4]", chip: "bg-[#013ff4]/10" },
  ]

  const [active, setActive] = useState<TabId>("new")

  const seeAllHref = active === "premium" ? "/annuaire?filter=premium" : active === "new" ? "/annuaire?filter=new" : "/annuaire"

  return (
    <div className="space-y-6 pt-8 pb-10 px-4 sm:px-8 -mx-4 sm:-mx-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgb(15,23,42,0.04)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#03b3f8]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* En-tête : titre + onglets + « Voir tout » */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 sm:px-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((t) => {
            const on = active === t.id
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all",
                  on ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200",
                )}
              >
                <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center", on ? "bg-white/15" : t.chip)}>
                  <Icon className={cn("w-3.5 h-3.5", on ? "text-white" : t.color)} />
                </span>
                {t.label}
              </button>
            )
          })}
        </div>

        {(active === "new" || active === "premium") && (
          <Link
            href={seeAllHref}
            className="shrink-0 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#013ff4] flex items-center gap-1 group self-start sm:self-auto"
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="relative z-10">
        {active === "new" && (
          <EntrepreneursSection entrepreneursList={newProfiles.slice(0, 8)} loading={loading} variant="glass-blue" />
        )}
        {active === "premium" && hasPremium && (
          <EntrepreneursSection entrepreneursList={premiumProfiles} loading={loading} variant="elite" />
        )}
        {active === "realisations" && <RealisationsShowcase />}
        {active === "categories" && <CategoriesExplorer categoryCounts={categoryCounts} />}
      </div>
    </div>
  )
}

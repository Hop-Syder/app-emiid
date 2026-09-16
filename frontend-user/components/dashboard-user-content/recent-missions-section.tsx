/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Aperçu des missions courtes les plus récentes sur le hub —
 *              3 cartes en grille sur desktop, défilement horizontal sur
 *              mobile (même logique que EntrepreneursSection).
 * @created 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { ArrowRight, Briefcase } from "lucide-react"
import { useMissions } from "@/hooks/use-missions"
import { MissionCard } from "@/components/missions/mission-card"
import { Skeleton } from "@/components/ui/skeleton"

const MAX_RECENT_MISSIONS = 3

export function RecentMissionsSection() {
  const { missions, loading } = useMissions("ALL")
  const recent = missions.slice(0, MAX_RECENT_MISSIONS)

  // Rien à montrer : comme CommuneSection, on masque plutôt que d'afficher
  // un titre au-dessus du vide.
  if (!loading && recent.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between px-1 sm:px-2 gap-2">
        <h3 className="text-lg sm:text-2xl font-black text-foreground flex items-center gap-2 sm:gap-3 tracking-tight">
          <div className="p-1.5 sm:p-2 bg-[#013ff4]/10 rounded-xl shrink-0">
            <Briefcase className="text-[#013ff4] w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span>Missions récentes</span>
        </h3>
        <Link
          href="/missions"
          className="text-xs sm:text-sm font-semibold text-[#013ff4] hover:text-[#0135d0] flex items-center gap-1 group shrink-0"
        >
          Voir tout <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-72 shrink-0 rounded-2xl md:w-auto" />
          ))}
        </div>
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
          {recent.map((mission) => (
            <div key={mission.id} className="w-[85%] max-w-sm shrink-0 snap-center md:w-auto md:max-w-none">
              <MissionCard mission={mission} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

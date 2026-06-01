/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dashboard Hub unifiant les statistiques utilisateur, les carrousels de découverte et l'annuaire global.
 * @created 2026-05-31
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { fetchWithAuth } from "@/lib/apiClient"
import type { PublicProfile } from "@/types"

import Link from "next/link"
import { DashboardBentoHeader } from "./dashboard-bento-header"
import { EntrepreneursSection } from "./entrepreneurs-section"
import { Sparkles, Target, LayoutGrid, ArrowRight } from "lucide-react"

// Nouveaux composants
import { CategoriesExplorer } from "./categories-explorer"
import { RecentActivityCta } from "./recent-activity-cta"
import { ProximitySection } from "./proximity-section"

interface DashboardHubContentProps {
  initialPremiumProfiles: PublicProfile[]
  initialNewProfiles: PublicProfile[]
  initialProximityProfiles?: PublicProfile[]
  userLocation?: { city: string; country_id: string; country_name: string } | null
}

export function DashboardHubContent({
  initialPremiumProfiles,
  initialNewProfiles,
  initialProximityProfiles = [],
  userLocation
}: DashboardHubContentProps) {
  // === 1. HOOKS ET ÉTATS STATISTIQUES ===
  const { stats, statsLoading, statsError } = useDashboardStats({
    endpoint: "/api/dashboard-user/stats",
    fetcher: fetchWithAuth,
    refreshIntervalMs: 30000,
  })

  // === RENDU DU COMPOSANT ===
  return (
    <div className="flex flex-col min-h-screen pb-12">
      {/* =========================================
          SECTION 1 : HEADER DARK (STATS & HERO)
          ========================================= */}
      <div className="pb-16 pt-6 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <DashboardBentoHeader stats={stats} statsLoading={statsLoading} />

          {statsError && (
            <p className="text-xs text-rose-400 flex items-center justify-center gap-2 px-1 pt-4 font-medium" data-testid="stats-sync-indicator">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              Connexion en direct interrompue — tentative de reconnexion...
            </p>
          )}
        </div>
      </div>

      {/* =========================================
          SECTION 2 : DÉCOUVERTE & ACTIVITÉ
          ========================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-10 z-20 space-y-12 relative">

        {/* BANNIÈRE HORIZONTALE CTA ACTIVITÉ RÉCENTE */}
        <div className="w-full">
          <RecentActivityCta />
        </div>

        {/* NOUVEAUX TALENTS */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-row items-center justify-between px-1 sm:px-2 gap-2">
            <h3 className="text-lg sm:text-2xl font-black text-slate-800 flex items-center gap-2 sm:gap-3 tracking-tight">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-xl shrink-0">
                <Sparkles className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="truncate">Nouveaux Talents</span>
            </h3>
            <Link href="/annuaire?filter=new" className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group shrink-0">
              Voir tout <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <EntrepreneursSection
            entrepreneursList={initialNewProfiles.slice(0, 8)}
            loading={false}
            variant="glass"
          />
        </div>

        {/* RECOMMANDATIONS SMART MATCH (PROFILS PREMIUM) */}
        {initialPremiumProfiles.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex flex-row items-center justify-between px-1 sm:px-2 gap-2">
              <h3 className="text-lg sm:text-2xl font-black text-slate-800 flex items-center gap-2 sm:gap-3 tracking-tight">
                <div className="p-1.5 sm:p-2 bg-amber-100 rounded-xl shrink-0">
                  <Target className="text-amber-500 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="truncate">Recommandé pour vous</span>
              </h3>
              <Link href="/annuaire?filter=premium" className="text-xs sm:text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 group shrink-0">
                Voir tout <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <EntrepreneursSection
              entrepreneursList={initialPremiumProfiles.slice(0, 8)}
              loading={false}
              variant="elite"
            />
          </div>
        )}


        {/* TALENTS À PROXIMITÉ (Temps Réel + Fallback) */}
        <ProximitySection fallbackLocation={userLocation} initialProfiles={initialProximityProfiles} />

        {/* EXPLORER PAR TYPE DE PROFIL */}
        <div className="space-y-6 pt-8 pb-10 px-4 sm:px-8 -mx-4 sm:-mx-8 bg-slate-50/80 rounded-[2.5rem] border border-slate-100/80 shadow-sm relative overflow-hidden">
          {/* Décoration d'arrière-plan abstraite */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-row items-center justify-between px-1 sm:px-2 gap-2">
            <h3 className="text-lg sm:text-2xl font-black text-slate-800 flex items-center gap-2 sm:gap-3 tracking-tight">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-xl shrink-0">
                <LayoutGrid className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="truncate">Explorer par Type de Profil</span>
            </h3>
          </div>
          <CategoriesExplorer />
        </div>

      </div>
    </div>
  )
}

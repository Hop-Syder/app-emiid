/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dashboard Hub unifiant les statistiques utilisateur, les carrousels de découverte et l'annuaire global.
 * @created 2026-05-31
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { fetchWithAuth } from "@/lib/apiClient"
import type { PublicProfile } from "@/types"

import { DashboardBentoHeader } from "./dashboard-bento-header"
import { EntrepreneursSection } from "./entrepreneurs-section"
import { Sparkles } from "lucide-react"

interface DashboardHubContentProps {
  initialDirectoryProfiles: PublicProfile[]
  initialPremiumProfiles: PublicProfile[]
  initialNewProfiles: PublicProfile[]
  initialVerifiedProfiles: PublicProfile[]
}

export function DashboardHubContent({ 
  initialDirectoryProfiles,
  initialPremiumProfiles,
  initialNewProfiles,
  initialVerifiedProfiles
}: DashboardHubContentProps) {
  // === 1. HOOKS ET ÉTATS STATISTIQUES ===
  const { stats, statsLoading, statsError } = useDashboardStats({
    endpoint: "/api/dashboard-user/stats",
    fetcher: fetchWithAuth,
    refreshIntervalMs: 30000,
  })

  // === 2. ÉTATS DES FILTRES DE L'ANNUAIRE ===
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    country: "all",
    city: "",
    tags: "",
    status: "all"
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

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
          SECTION 2 : DÉCOUVERTE (CARROUSELS)
          Chevauche légèrement la section dark
          ========================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-10 z-20 space-y-20 relative">
        
        {/* PREMIUM (Elite) */}
        {initialPremiumProfiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <span className="text-amber-500 text-xl">👑</span>
                </div>
                Cercle Premium
              </h3>
            </div>
            <EntrepreneursSection 
              entrepreneursList={initialPremiumProfiles} 
              loading={false} 
              variant="elite" 
            />
          </div>
        )}

        {/* NOUVEAUX ARRIVANTS */}
        {initialNewProfiles.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Sparkles className="text-blue-500 w-5 h-5" />
                </div>
                Nouveaux Talents
              </h3>
            </div>
            <EntrepreneursSection 
              entrepreneursList={initialNewProfiles} 
              loading={false} 
              variant="tech" 
            />
          </div>
        )}

        {/* 100% VÉRIFIÉS */}
        {initialVerifiedProfiles.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <span className="text-emerald-500 text-xl">✓</span>
                </div>
                Profils Vérifiés
              </h3>
            </div>
            <EntrepreneursSection 
              entrepreneursList={initialVerifiedProfiles} 
              loading={false} 
              variant="glass" 
            />
          </div>
        )}
      </div>
    </div>
  )
}

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

import { AnnuaireFilters } from "@/components/annuaire-public-content/annuaire-filters"
import { AnnuaireGrid } from "@/components/annuaire-public-content/annuaire-grid"
import { AlertTriangle } from "lucide-react"

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
    <div className="flex flex-col min-h-screen pb-12 bg-slate-50">
      {/* =========================================
          SECTION 1 : HEADER DARK (STATS & HERO)
          ========================================= */}
      <div className="bg-slate-900 border-b border-slate-800 pb-12 pt-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden z-10">
        {/* Effet lumineux en arrière-plan */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <DashboardBentoHeader stats={stats} statsLoading={statsLoading} />
          
          {statsError && (
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 px-1 pt-4" data-testid="stats-sync-indicator">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Statistiques non synchronisées — nouvelle tentative dans quelques secondes
            </p>
          )}
        </div>
      </div>

      {/* =========================================
          SECTION 2 : DÉCOUVERTE (CARROUSELS)
          Chevauche légèrement la section dark
          ========================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-6 z-20 space-y-8 relative">
        
        {/* PREMIUM (Elite) */}
        {initialPremiumProfiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 italic uppercase tracking-tighter">
                <span className="text-amber-500">👑</span> Premium
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
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 italic uppercase tracking-tighter">
                <span className="text-blue-500">⚡</span> Nouveaux Arrivants
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
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 italic uppercase tracking-tighter">
                <span className="text-indigo-500">✓</span> 100% Vérifiés
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

      {/* =========================================
          SECTION 3 : ANNUAIRE GLOBAL (GRILLE)
          ========================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12 space-y-6">
        <div className="pt-8 border-t border-slate-200">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-[#022753] uppercase tracking-tight">
              Explorer le Réseau
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              Trouvez des partenaires, clients ou prestataires parmi tous nos membres.
            </p>
          </div>
          
          <AnnuaireFilters filters={filters} onFilterChange={handleFilterChange} />
          
          <div className="mt-8">
            <AnnuaireGrid filters={filters} initialProfiles={initialDirectoryProfiles} />
          </div>
        </div>
      </div>
    </div>
  )
}

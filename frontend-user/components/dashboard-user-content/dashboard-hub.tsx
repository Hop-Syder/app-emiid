"use client"

import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { fetchWithAuth } from "@/lib/apiClient"
import type { PublicProfile } from "@/types"

import { DashboardBentoHeader } from "./dashboard-bento-header"
import { ProximitySection } from "./proximity-section"
import { CommuneSection } from "./commune-section"
import { HubContextualCta } from "./hub-contextual-cta"
import { HubCommunities } from "./hub-communities"
import { ExplorerHub } from "./explorer-hub"

interface DashboardHubContentProps {
  initialNewProfiles: PublicProfile[]
  initialProximityProfiles?: PublicProfile[]
  userLocation?: { city: string | null; country_id: string | null; country_name: string | null } | null
}

export function DashboardHubContent({
  initialNewProfiles,
  initialProximityProfiles = [],
  userLocation
}: DashboardHubContentProps) {
  const { stats, statsError } = useDashboardStats({
    endpoint: "/api/dashboard-user/stats",
    fetcher: fetchWithAuth,
    refreshIntervalMs: 30000,
    // Pas de faux chiffres de secours ici : contrairement au hub public, cette
    // page n'a pas vocation à afficher des stats globales "crédibles" inventées.
    fallbackStats: null,
  })

  return (
    <div className="flex flex-col min-h-screen pb-12">

      {/* =========================================
          SECTION 1 : HERO + STATS RÉSEAU
          ========================================= */}
      <div className="pb-16 pt-6 relative overflow-hidden z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <DashboardBentoHeader />
          {statsError && (
            <p className="text-xs text-rose-400 flex items-center justify-center gap-2 px-1 pt-4 font-medium" data-testid="stats-sync-indicator">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              Connexion en direct interrompue — tentative de reconnexion...
            </p>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-10 z-20 space-y-6 relative">

        {/* SECTION 1.5 + 2 (cockpit personnel : complétude/stats + activité
            récente) déménagée dans /portefeuille le 16/09 — voir
            PortefeuilleContent. */}

        {/* =========================================
            SECTION 3 : TALENTS À PROXIMITÉ
            ========================================= */}
        <ProximitySection fallbackLocation={userLocation} initialProfiles={initialProximityProfiles} />

        {/* =========================================
            SECTION 4 : CTA CONTEXTUEL
            Intercalé entre les deux listes de talents pour casser leur
            répétition visuelle et relancer sur une action concrète.
            ========================================= */}
        <div>
          <HubContextualCta />
        </div>

        {/* =========================================
            SECTION 5 : TALENTS DE LA COMMUNE
            Échelle plus fine que la section ci-dessus (commune administrative
            plutôt que ville/GPS) et vitrine des boosts communaux. Se masque
            d'elle-même si le profil n'a pas de commune rattachée.
            ========================================= */}
        <CommuneSection />

        {/* =========================================
            SECTION 6 : EXPLORER (Nouveaux / Réalisations / Catégories — onglets)
            ========================================= */}
        <ExplorerHub
          newProfiles={initialNewProfiles}
          categoryCounts={stats?.categoryCounts}
        />

        {/* =========================================
            SECTION 7 : COMMUNAUTÉS
            ========================================= */}
        <div>
          <HubCommunities />
        </div>

      </div>
    </div>
  )
}

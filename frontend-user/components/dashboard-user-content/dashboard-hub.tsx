"use client"

import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { fetchWithAuth } from "@/lib/apiClient"
import type { PublicProfile } from "@/types"

import { DashboardBentoHeader } from "./dashboard-bento-header"
import { InlineActivityFeed } from "./inline-activity-feed"
import { ProximitySection } from "./proximity-section"
import { CommuneSection } from "./commune-section"
import { HubContextualCta } from "./hub-contextual-cta"
import { HubCommunities } from "./hub-communities"
import { PersonalHero } from "./personal-hero"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <DashboardBentoHeader />
          {statsError && (
            <p className="text-xs text-rose-400 flex items-center justify-center gap-2 px-1 pt-4 font-medium" data-testid="stats-sync-indicator">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              Connexion en direct interrompue — tentative de reconnexion...
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-10 z-20 space-y-12 relative">

        {/* =========================================
            SECTION 1.5 + 2 : COCKPIT PERSONNEL (bento desktop)
            Complétude/stats + activité récente côte à côte sur ≥ lg.
            ========================================= */}
        {/* Desktop uniquement depuis le 06/09. Sur mobile, le cockpit empilait
            complétude, compteurs et relances sous un bandeau qui porte déjà la
            salutation, la recherche et deux actions : l'utilisateur devait
            franchir tout cela avant d'atteindre les profils, seule raison de sa
            venue. Son accès aux notifications a été remonté dans le bandeau.

            C'est la GRILLE entière qui est masquée, pas seulement ses colonnes :
            un conteneur vide continuerait de recevoir l'espacement du parent
            (`space-y-12`) et laisserait un trou sur mobile. */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8">
          <div className="lg:col-span-7">
            <PersonalHero />
          </div>
          <div className="lg:col-span-5">
            <InlineActivityFeed />
          </div>
        </div>

        {/* =========================================
            SECTION 3 : TALENTS À PROXIMITÉ
            ========================================= */}
        <ProximitySection fallbackLocation={userLocation} initialProfiles={initialProximityProfiles} />

        {/* =========================================
            SECTION 3 bis : TALENTS DE LA COMMUNE
            Échelle plus fine que la section ci-dessus (commune administrative
            plutôt que ville/GPS) et vitrine des boosts communaux. Se masque
            d'elle-même si le profil n'a pas de commune rattachée.
            ========================================= */}
        <CommuneSection />

        {/* =========================================
            SECTION 4 : EXPLORER (Nouveaux / Réalisations / Catégories — onglets)
            ========================================= */}
        <ExplorerHub
          newProfiles={initialNewProfiles}
          categoryCounts={stats?.categoryCounts}
        />

        {/* =========================================
            SECTION 7 : CTA CONTEXTUEL
            ========================================= */}
        <div className="pt-4 pb-4">
          <HubContextualCta />
        </div>

        {/* =========================================
            SECTION 8 : COMMUNAUTÉS
            ========================================= */}
        <div className="pt-2 pb-8">
          <HubCommunities />
        </div>

      </div>
    </div>
  )
}

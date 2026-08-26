/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hub public — même ossature que le hub connecté.
 *
 *              Les rubriques et leur ordre sont ceux de /dashboard-user. Celles
 *              qui n'ont de sens que pour un compte — cockpit personnel,
 *              activité récente, talents à proximité — sont présentées
 *              verrouillées plutôt qu'omises : le visiteur voit ce qu'il
 *              gagnerait, au lieu de découvrir après inscription des rubriques
 *              qu'il ne soupçonnait pas.
 *
 *              Les rubriques de découverte, elles, sont ouvertes et servent le
 *              même composant que côté connecté : c'est la promesse du produit
 *              qu'on montre, pas une maquette.
 * @created 2025-12-24
 * @updated 2026-08-20
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { AlertTriangle, Gauge, Bell } from "lucide-react"
import { fetchPublic } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import type { DashboardStats } from "@/types"
import { PublicHeroMatrix } from "./public-hero-matrix"
import { LiveNetworkTicker } from "./live-network-ticker"
import { BentoMatrixPublic } from "./bento-matrix-public"
import { InstantClaimTerminal } from "./instant-claim-terminal"
import { ProximityLockSection } from "./proximity-lock-section"
import { PublicHubContextualCta } from "./public-hub-contextual-cta"
import { LockedSection, CockpitPreview, ActivityPreview } from "./locked-section"
import { ExplorerHub } from "../dashboard-user-content/explorer-hub"
import { HubCommunities } from "../dashboard-user-content/hub-communities"

export interface EntrepreneurProfile {
    id: string;
    slug?: string;
    name: string;
    role: string;
    location: string;
    avatar: string;
    specialty: string;
    category?: string;
    verified: boolean;
    premium: boolean;
    followers: number;
    isFollowed?: boolean;
    tags?: string[];
}

interface PublicProfileRow {
    id: string
    user_id?: string | null
    slug?: string | null
    first_name?: string | null
    last_name?: string | null
    role?: string | null
    city?: string | null
    avatar_url?: string | null
    specialty?: string | null
    category?: string | null
    is_verified?: boolean | null
    is_premium?: boolean | null
    followers_count?: number | null
    countries?: {
        name: string
        iso_code?: string
    } | null
    profile_tags?: {
        tags: {
            name: string
        } | null
    }[] | null
}

interface DashboardPublicContentProps {
    initialStats?: DashboardStats | null
    initialProfiles?: EntrepreneurProfile[]
}

export function DashboardPublicContent({ initialStats = null, initialProfiles = [] }: DashboardPublicContentProps) {
    const [loading, setLoading] = useState(initialProfiles.length === 0)
    const [entrepreneursList, setEntrepreneursList] = useState<EntrepreneurProfile[]>(initialProfiles)
    const [profilesWarning, setProfilesWarning] = useState<string | null>(null)
    const { stats, statsLoading, statsError } = useDashboardStats({
        endpoint: "/api/public/stats",
        fetcher: fetchPublic,
        refreshIntervalMs: 30000,
        initialData: initialStats,
    })

    const supabase = useMemo(() => createClient(), [])

    // ExplorerHub attend deux listes distinctes. La requête ramène les profils
    // les plus récents, d'où « nouveaux » = la liste entière ; l'onglet Premium
    // ne s'affiche que s'il y a effectivement des profils premium dedans.
    const premiumProfiles = useMemo(
        () => entrepreneursList.filter((e) => e.premium),
        [entrepreneursList],
    )

    useEffect(() => {
        let isMounted = true

        const loadPublicDashboardData = async (showLoading: boolean) => {
            if (showLoading && isMounted && initialProfiles.length === 0) {
                setLoading(true)
            }

            try {
                const nextWarning: string | null = null

                const { data: entData, error: entError } = await supabase
                    .from('public_profiles')
                    .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                    .eq('is_published', true)
                    .order('created_at', { ascending: false })
                    .limit(6)

                if (!entError && entData) {
                    let userFollowsIds: string[] = []
                    try {
                        const { fetchFollowedIds } = await import("@/lib/follows")
                        const ids = await fetchFollowedIds()
                        if (ids) userFollowsIds = [...ids]
                    } catch (error) {
                        console.error("Failed to load follows for public dashboard", error)
                    }

                    const nextEntrepreneurs = (entData as unknown as PublicProfileRow[]).map((e) => {
                        const profileId = e.user_id || e.id || "0"
                        return {
                            id: profileId,
                            slug: e.slug || undefined,
                            name: (e.first_name || e.last_name) ? `${e.first_name || ''} ${e.last_name || ''}`.trim() : "Utilisateur EmiID",
                            role: e.role || "Membre EmiID",
                            location: e.city ? `${e.city}, ${e.countries?.name || ''}` : (e.countries?.name || "Afrique"),
                            avatar: e.avatar_url || "/profil/avatar.jpg",
                            specialty: e.specialty || "Expertise",
                            category: e.category || "",
                            verified: !!e.is_verified,
                            premium: !!e.is_premium,
                            followers: e.followers_count || 0,
                            isFollowed: userFollowsIds.includes(profileId),
                            tags: e.profile_tags?.map((pt) => pt.tags?.name).filter((name): name is string => typeof name === "string") || []
                        }
                    })

                    if (!isMounted) return

                    setEntrepreneursList(nextEntrepreneurs)
                    setProfilesWarning(nextWarning)
                } else {
                    console.error("Erreur API entrepreneurs (Supabase):", entError)

                    if (showLoading && isMounted) {
                        setEntrepreneursList([])
                    }

                    if (isMounted) {
                        setProfilesWarning("Les profils en vedette n’ont pas pu être chargés pour le moment.")
                    }
                }
            } catch (error) {
                console.error("Erreur chargement profils publics:", error)
                if (showLoading && isMounted) {
                    setEntrepreneursList([])
                }

                if (isMounted) {
                    setProfilesWarning("Les profils en vedette n’ont pas pu être chargés pour le moment.")
                }
            } finally {
                if (showLoading && isMounted && initialProfiles.length === 0) {
                    setLoading(false)
                }
            }
        }

        void loadPublicDashboardData(initialProfiles.length === 0)

        const intervalId = window.setInterval(() => {
            void loadPublicDashboardData(false)
        }, 30000)

        return () => {
            isMounted = false
            window.clearInterval(intervalId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase])

    return (
        <div className="flex flex-col min-h-screen pb-16 w-full bg-slate-50/50">
            {/* =========================================
                SECTION 1 : HERO MATRIX 3D & STATS DYNAMIQUES
                ========================================= */}
            <div className="pt-4 sm:pt-6 pb-6 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
                    <PublicHeroMatrix stats={stats} />

                    {statsError && (
                        <p className="text-xs text-rose-400 flex items-center justify-center gap-2 px-1 font-medium">
                            <span className="inline-block h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                            Connexion en direct interrompue — tentative de reconnexion...
                        </p>
                    )}
                </div>
            </div>

            {/* =========================================
                BANDEAU RÉSEAU EN DIRECT — propre au public
                ========================================= */}
            <div className="w-full my-4">
                <LiveNetworkTicker />
            </div>

            {/* =========================================
                CORPS DU HUB — mêmes rubriques que /dashboard-user
                ========================================= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12 relative z-20 pt-4">
                {profilesWarning && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 relative z-10 shadow-xs">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                            <div>
                                <p className="font-semibold text-sm">Synchronisation partielle</p>
                                <p className="text-xs text-amber-800">{profilesWarning}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* =========================================
                    SECTION 1.5 : COCKPIT PERSONNEL — verrouillée
                    ========================================= */}
                <LockedSection
                    title="Votre cockpit personnel"
                    icon={Gauge}
                    pitch="Vues de votre profil, abonnés, complétude de votre carte : votre tableau de bord se remplit dès la création du compte."
                >
                    <CockpitPreview />
                </LockedSection>

                {/* =========================================
                    SECTION 2 : ACTIVITÉ RÉCENTE — verrouillée
                    ========================================= */}
                <LockedSection
                    title="Votre activité récente"
                    icon={Bell}
                    iconClassName="bg-amber-100 text-amber-600"
                    pitch="Qui a consulté votre profil, qui vous suit, qui vous écrit — suivez tout au même endroit."
                >
                    <ActivityPreview />
                </LockedSection>

                {/* =========================================
                    SECTION 3 : TALENTS À PROXIMITÉ — verrouillée
                    ========================================= */}
                <ProximityLockSection />

                {/* =========================================
                    SECTION 4 : EXPLORER — ouverte
                    Même composant que côté connecté : la découverte est
                    précisément ce qu'on veut donner à voir avant l'inscription.
                    ========================================= */}
                <ExplorerHub
                    premiumProfiles={premiumProfiles}
                    newProfiles={entrepreneursList}
                    categoryCounts={stats?.categoryCounts}
                    loading={loading}
                />

                {/* =========================================
                    GALERIE DES MÉTIERS — propre au public
                    ========================================= */}
                <BentoMatrixPublic />

                {/* =========================================
                    SECTION 7 : CTA CONTEXTUEL
                    ========================================= */}
                <div className="pt-4 pb-4">
                    <PublicHubContextualCta />
                </div>

                {/* =========================================
                    SECTION 8 : COMMUNAUTÉS
                    ========================================= */}
                <div className="pt-2 pb-8">
                    <HubCommunities />
                </div>

                {/* Terminal de Conversion & Passeport Digital */}
                <div className="pt-4">
                    <InstantClaimTerminal />
                </div>
            </div>
        </div>
    )
}


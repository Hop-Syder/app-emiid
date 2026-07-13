/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description dashboard-user principal avec sections Hero, Stats et Profils Premium
 * @created 2025-12-24
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { AlertTriangle } from "lucide-react"
import { fetchPublic } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import type { DashboardStats } from "@/types"
import { PublicBentoHeader } from "./public-bento-header"
import { ProximityLockSection } from "./proximity-lock-section"
import { EntrepreneursSection } from "./entrepreneurs-section"
import { CategoriesExplorer } from "../dashboard-user-content/categories-explorer"
import { AnnuaireProcess } from "../annuaire-public-content/annuaire-process"
import { AnnuaireCTA } from "../annuaire-public-content/annuaire-cta"
import { PublicHubContextualCta } from "./public-hub-contextual-cta"
import { HubCommunities } from "../dashboard-user-content/hub-communities"
import { LayoutGrid } from "lucide-react"

export interface EntrepreneurProfile {
    id: string;
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

export interface EntrepreneurApiResponse {
    id?: string;
    user_id?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    city?: string;
    countries?: { name: string };
    avatar_url?: string;
    specialty?: string;
    category?: string;
    is_verified?: boolean;
    is_premium?: boolean;
    followers_count?: number;
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
    // Initialisation avec les données ISR serveur → premier rendu instantané, CLS = 0
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

    useEffect(() => {
        let isMounted = true

        const loadPublicDashboardData = async (showLoading: boolean) => {
            // Ne montre le spinner que si aucun profil SSR n'est disponible (fallback dégradé)
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
                    // Récupérer les follows depuis le cache client (mémoire + sessionStorage,
                    // lecture Supabase directe la 1re fois) — plus d'aller-retour Express par vue.
                    let userFollowsIds: string[] = []
                    try {
                        const { fetchFollowedIds } = await import("@/lib/follows")
                        const ids = await fetchFollowedIds()
                        if (ids) userFollowsIds = [...ids]
                    } catch (error) {
                        console.error("Failed to load follows for public dashboard", error)
                    }

                    // La vue public_profiles n'a pas de relation FK déclarée → l'inférence du
                    // join échoue (SelectQueryError). On caste vers le type connu PublicProfileRow.
                    const nextEntrepreneurs = (entData as unknown as PublicProfileRow[]).map((e) => {
                        const profileId = e.user_id || e.id || "0"
                        return {
                            id: profileId,
                            slug: e.slug || undefined,
                            name: (e.first_name || e.last_name) ? `${e.first_name || ''} ${e.last_name || ''}`.trim() : "Utilisateur EmiID",
                            role: e.role || "Membre EmiID",
                            location: e.city ? `${e.city}, ${e.countries?.name || ''}` : (e.countries?.name || "Afrique "),
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

                    if (!isMounted) {
                        return
                    }

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

        // Premier chargement : enrichissement des follows (non bloquant si profils SSR déjà présents)
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
        <div className="flex flex-col min-h-screen pb-12 w-full">
            {/* =========================================
                SECTION 1 : HEADER DARK (STATS & BENTO HERO)
                ========================================= */}
            <div className="pb-16 pt-6 relative overflow-hidden z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10 w-full">
                    <PublicBentoHeader stats={stats} statsLoading={statsLoading} />
                    
                    {statsError && (
                        <p className="text-xs text-rose-400 flex items-center justify-center gap-2 px-1 pt-4 font-medium" data-testid="stats-sync-indicator">
                            <span className="inline-block h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                            Connexion en direct interrompue — tentative de reconnexion...
                        </p>
                    )}
                </div>
            </div>

            {/* =========================================
                SECTION 2 : DÉCOUVERTE & ENGAGEMENT PUBLIC
                ========================================= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-10 z-20 space-y-12 relative">
                
                {profilesWarning && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 relative z-10">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                            <div>
                                <p className="font-semibold">Synchronisation partielle</p>
                                <p className="text-sm text-amber-800">{profilesWarning}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Entrepreneurs du Réseau */}
                <EntrepreneursSection entrepreneursList={entrepreneursList} loading={loading} />

                {/* Talents à proximité (Lock/Onboarding) */}
                <ProximityLockSection />

                {/* Explorer par Type de Profil */}
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
                    <CategoriesExplorer categoryCounts={stats?.categoryCounts} />
                </div>

                {/* =========================================
                    SECTION : CTA PUBLIC & COMMUNAUTÉS
                    ========================================= */}
                <div className="pt-4 pb-4">
                    <PublicHubContextualCta />
                </div>
                
                <div className="pt-2 pb-8">
                    <HubCommunities />
                </div>

                {/* Process et CTA de Fin */}
                <div className="pt-8">
                    <AnnuaireProcess />
                    <AnnuaireCTA />
                </div>
            </div>
        </div>
    )
}

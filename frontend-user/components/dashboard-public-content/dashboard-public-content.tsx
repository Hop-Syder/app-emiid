/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description dashboard-user principal avec sections Hero, Stats et Profils Premium
 * @created 2025-12-24
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { AlertTriangle } from "lucide-react"
import { fetchPublic } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { DashboardStatsSkeleton } from "@/components/dashboard-stats-skeleton"
import type { DashboardStats } from "@/types"
import { HeroSection } from "./hero-section"
import { StatsSection } from "./stats-section"
import { EntrepreneursSection } from "./entrepreneurs-section"

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

interface DashboardPublicContentProps {
    initialStats?: DashboardStats | null
}

export function DashboardPublicContent({ initialStats = null }: DashboardPublicContentProps) {
    const [loading, setLoading] = useState(true)
    const [entrepreneursList, setEntrepreneursList] = useState<EntrepreneurProfile[]>([])
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
            if (showLoading && isMounted) {
                setLoading(true)
            }

            try {
                let nextWarning: string | null = null

                const { data: entData, error: entError } = await supabase
                    .from('public_profiles')
                    .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                    .eq('is_published', true)
                    .order('created_at', { ascending: false })
                    .limit(6)

                if (!entError && entData) {
                    // Optionnel: Récupérer les follows si l'utilisateur est connecté
                    let userFollowsIds: string[] = []
                    try {
                        const { fetchWithAuth } = await import("@/lib/apiClient")
                        const followsRes = await fetchWithAuth("/api/users/follows")
                        if (followsRes.ok) {
                            const followsData = await followsRes.json()
                            userFollowsIds = followsData.map((f: { user_id?: string; id?: string }) => f.user_id || f.id)
                        } else if (followsRes.status !== 401 && followsRes.status !== 403) {
                            nextWarning = "Le statut de vos abonnements n’a pas pu être synchronisé sur cette vue."
                        }
                    } catch (error) {
                        console.error("Failed to load follows for public dashboard", error)
                        nextWarning = "Le statut de vos abonnements n’a pas pu être synchronisé sur cette vue."
                    }

                    const nextEntrepreneurs = entData.map((e: any) => {
                        const profileId = e.user_id || e.id || "0"
                        return {
                            id: profileId,
                            name: (e.first_name || e.last_name) ? `${e.first_name || ''} ${e.last_name || ''}`.trim() : "Utilisateur EmiID",
                            role: e.role || "Membre EmiID",
                            location: e.city ? `${e.city}, ${e.countries?.name || ''}` : (e.countries?.name || "Afrique de l'Ouest"),
                            avatar: e.avatar_url || "/profil/avatar.jpg",
                            specialty: e.specialty || "Expertise",
                            category: e.category || "",
                            verified: !!e.is_verified,
                            premium: !!e.is_premium,
                            followers: e.followers_count || 0,
                            isFollowed: userFollowsIds.includes(profileId),
                            tags: e.profile_tags?.map((pt: any) => pt.tags?.name) || []
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
                if (showLoading && isMounted) {
                    setLoading(false)
                }
            }
        }

        void loadPublicDashboardData(true)

        const intervalId = window.setInterval(() => {
            void loadPublicDashboardData(false)
        }, 30000)

        return () => {
            isMounted = false
            window.clearInterval(intervalId)
        }
    }, [supabase])

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <HeroSection />

            {/* Stats Section — affiche toujours des valeurs (0 si backend KO), avec petit badge sync discret */}
            {stats ? (
                <div className="space-y-2">
                    <StatsSection stats={stats} />
                    {statsError && (
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 px-1" data-testid="stats-sync-indicator">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Statistiques non synchronisées — nouvelle tentative dans quelques secondes
                        </p>
                    )}
                </div>
            ) : statsLoading ? (
                <DashboardStatsSkeleton />
            ) : null}

            {profilesWarning && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
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


        </div>
    )
}

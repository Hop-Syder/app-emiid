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

import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { fetchPublic } from "@/lib/apiClient"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { DashboardStatsSkeleton } from "@/components/dashboard-stats-skeleton"
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
    followers_count?: number;
    tags?: string[];
}

export function DashboardPublicContent() {
    const [loading, setLoading] = useState(true)
    const [entrepreneursList, setEntrepreneursList] = useState<EntrepreneurProfile[]>([])
    const { stats, statsLoading, statsError } = useDashboardStats({
        endpoint: "/api/public/stats",
        fetcher: fetchPublic,
        refreshIntervalMs: 30000,
    })


    useEffect(() => {
        let isMounted = true

        const loadPublicDashboardData = async (showLoading: boolean) => {
            if (showLoading && isMounted) {
                setLoading(true)
            }

            try {
                const entRes = await fetchPublic("/api/public/profiles")

                if (entRes.ok) {
                    const entData = await entRes.json()

                    // Optionnel: Récupérer les follows si l'utilisateur est connecté
                    let userFollowsIds: string[] = []
                    try {
                        const { fetchWithAuth } = await import("@/lib/apiClient")
                        const followsRes = await fetchWithAuth("/api/users/follows")
                        if (followsRes.ok) {
                            const followsData = await followsRes.json()
                            userFollowsIds = followsData.map((f: { user_id?: string; id?: string }) => f.user_id || f.id)
                        }
                    } catch (error) {
                        // Silent failure - follows are optional for public view
                        console.warn("Failed to load follows for public dashboard")
                    }

                    const nextEntrepreneurs = entData.map((e: EntrepreneurApiResponse) => {
                            const profileId = e.user_id || e.id || "0"
                            return {
                                id: profileId,
                                name: (e.first_name || e.last_name) ? `${e.first_name || ''} ${e.last_name || ''}`.trim() : "Utilisateur Nexus",
                                role: e.role || "Membre Nexus",
                                location: e.city ? `${e.city}, ${e.countries?.name || ''}` : (e.countries?.name || "Afrique de l'Ouest"),
                                avatar: e.avatar_url || "/african-user.jpg",
                                specialty: e.specialty || "Expertise",
                                category: e.category || "",
                                verified: true,
                                premium: e.category?.toLowerCase() === 'entreprise',
                                followers: e.followers_count || 0,
                                isFollowed: userFollowsIds.includes(profileId),
                                tags: e.tags || []
                            }
                        })

                    if (!isMounted) {
                        return
                    }

                    setEntrepreneursList(nextEntrepreneurs)
                } else {
                    console.error("Erreur API entrepreneurs (Public):", entRes.status)

                    if (showLoading && isMounted) {
                        setEntrepreneursList([])
                    }
                }
            } catch (error) {
                console.error("Erreur chargement profils publics:", error)
                if (showLoading && isMounted) {
                    setEntrepreneursList([])
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
    }, [])

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <HeroSection />

            {statsError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                        <div>
                            <p className="font-semibold">Statistiques indisponibles</p>
                            <p className="text-sm text-amber-800">{statsError}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Section */}
            {statsLoading ? <DashboardStatsSkeleton /> : stats ? <StatsSection stats={stats} /> : null}

            {/* Entrepreneurs du Réseau */}
            <EntrepreneursSection entrepreneursList={entrepreneursList} loading={loading} />


        </div>
    )
}

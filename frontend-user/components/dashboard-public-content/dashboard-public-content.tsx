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
    const [statsError, setStatsError] = useState<string | null>(null)
    const [stats, setStats] = useState({
        totalEntrepreneurs: 0,
        verifiedMembers: 0,
        countriesCovered: 0,
        premiumMembers: 0,
    })
    const [entrepreneursList, setEntrepreneursList] = useState<EntrepreneurProfile[]>([])


    useEffect(() => {
        const loadPublicDashboardData = async () => {
            try {
                setStatsError(null)
                const [statsRes, entRes] = await Promise.all([
                    fetchPublic("/api/public/stats"),
                    fetchPublic("/api/public/profiles"),
                ])

                if (statsRes.ok) {
                    const statsData = await statsRes.json()
                    setStats(statsData)
                } else {
                    setStatsError("Impossible de charger les statistiques pour le moment.")
                }

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

                    setEntrepreneursList(
                        entData.map((e: EntrepreneurApiResponse) => {
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
                        }),
                    )
                } else {
                    console.error("Erreur API entrepreneurs (Public):", entRes.status)
                }


            } catch (error) {
                console.error("Erreur chargement dashboard public data:", error)
                setStatsError("Impossible de charger les statistiques pour le moment.")
                setEntrepreneursList([])
            } finally {
                setLoading(false)
            }
        }
        loadPublicDashboardData()
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
            <StatsSection stats={stats} />

            {/* Entrepreneurs du Réseau */}
            <EntrepreneursSection entrepreneursList={entrepreneursList} loading={loading} />


        </div>
    )
}

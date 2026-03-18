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
import { fetchPublic } from "@/lib/apiClient"
import { HeroSection } from "./hero-section"
import { StatsSection } from "./stats-section"
import { EntrepreneursSection } from "./entrepreneurs-section"

// Données mock pour le fallback
const mockEntrepreneurs = [
    { id: "1", name: "Amara Diallo", role: "Entrepreneur Tech", location: "Dakar, Sénégal", avatar: "/african-woman-entrepreneur.jpg", specialty: "FinTech", verified: true, premium: true, followers: 234 },
    { id: "2", name: "Kofi Mensah", role: "Développeur Senior", location: "Accra, Ghana", avatar: "/african-man-developer.jpg", specialty: "Intelligence Artificielle", verified: true, premium: true, followers: 189 },
    { id: "3", name: "Fatou Sow", role: "CEO & Fondatrice", location: "Abidjan, Côte d'Ivoire", avatar: "/african-woman-ceo.jpg", specialty: "E-commerce", verified: true, premium: true, followers: 456 },
    { id: "4", name: "Kwame Asante", role: "Designer UX/UI", location: "Lagos, Nigeria", avatar: "/african-man-designer.jpg", specialty: "Design Produit", verified: true, premium: false, followers: 178 },
    { id: "5", name: "Aissatou Barry", role: "Artisan Créatrice", location: "Conakry, Guinée", avatar: "/african-woman-tailor.jpg", specialty: "Mode Éthique", verified: true, premium: true, followers: 312 },
    { id: "6", name: "Moussa Traoré", role: "Photographe", location: "Bamako, Mali", avatar: "/african-man-photographer.jpg", specialty: "Photographie", verified: true, premium: false, followers: 267 },
]

const mockStats = {
    totalEntrepreneurs: 1250,
    activeProjects: 340,
    countriesCovered: 15,
    totalFunding: 2500000,
}

export function DashboardPublicContent() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalEntrepreneurs: 0,
        activeProjects: 0,
        countriesCovered: 15,
        totalFunding: 0,
    })
    const [entrepreneursList, setEntrepreneursList] = useState<any[]>([])


    useEffect(() => {
        const loadPublicDashboardData = async () => {
            try {
                const [statsRes, entRes] = await Promise.all([
                    fetchPublic("/api/public/stats"),
                    fetchPublic("/api/public/profiles"),
                ])

                if (statsRes.ok) {
                    const statsData = await statsRes.json()
                    setStats(statsData)
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
                            userFollowsIds = followsData.map((f: any) => f.user_id || f.id)
                        }
                    } catch (e) {}

                    setEntrepreneursList(
                        entData.map((e: any) => {
                            const profileId = e.user_id || e.id
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
                // Utiliser les données mock en cas d'erreur
                setStats(mockStats)
                setEntrepreneursList(mockEntrepreneurs)
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

            {/* Stats Section */}
            <StatsSection stats={stats} />

            {/* Entrepreneurs du Réseau */}
            <EntrepreneursSection entrepreneursList={entrepreneursList} loading={loading} />


        </div>
    )
}

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
                    setEntrepreneursList(
                        entData.map((e: any) => ({
                            id: e.user_id,
                            name: `${e.first_name} ${e.last_name}`,
                            role: e.role || "Membre Nexus",
                            location: e.city ? `${e.city}, ${e.countries?.name || ''}` : "Afrique de l'Ouest",
                            avatar: e.avatar_url || "/african-user.jpg",
                            specialty: e.specialty || "Expertise",
                            verified: true,
                            premium: e.category === 'Entreprise',
                            followers: 0,
                        })),
                    )
                }


            } catch (error) {
                console.error("Erreur chargement dashboard public data:", error)
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

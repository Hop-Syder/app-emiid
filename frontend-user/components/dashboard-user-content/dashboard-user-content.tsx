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
import { fetchWithAuth } from "@/lib/apiClient"
import { HeroSection } from "./hero-section"
import { StatsSection } from "./stats-section"
import { EntrepreneursSection } from "./entrepreneurs-section"


export function DashboardContent() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEntrepreneurs: 0,
    activeProjects: 0,
    countriesCovered: 15,
    totalFunding: 0,
  })
  const [entrepreneursList, setEntrepreneursList] = useState<any[]>([])


  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, entRes, projRes] = await Promise.all([
          fetchWithAuth("/api/dashboard-user/stats"),
          fetchWithAuth("/api/dashboard-user/featured-entrepreneurs"),
          fetchWithAuth("/api/ads"),
        ])

        if (statsRes.ok) setStats(await statsRes.json())

        if (entRes.ok) {
          const entData = await entRes.json()
          console.log("Données entrepreneurs reçues (User):", entData)
          setEntrepreneursList(
            entData.map((e: any) => ({
              id: e.user_id || e.id || Math.random().toString(),
              name: (e.first_name || e.last_name) ? `${e.first_name || ''} ${e.last_name || ''}`.trim() : "Utilisateur Nexus",
              role: e.role || "Membre Nexus",
              location: e.city ? `${e.city}, ${e.countries?.name || ''}` : (e.countries?.name || "Afrique de l'Ouest"),
              avatar: e.avatar_url || "/african-user.jpg",
              specialty: e.specialty || "Entrepreneuriat",
              verified: true,
              premium: e.category?.toLowerCase() === 'entreprise',
              followers: 0,
            })),
          )
        } else {
          console.error("Erreur API entrepreneurs (User):", entRes.status)
        }


      } catch (error) {
        console.error("Erreur chargement dashboard-user:", error)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
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

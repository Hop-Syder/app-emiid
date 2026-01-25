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
  const [projects, setProjects] = useState<any[]>([])


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

        if (projRes.ok) {
          const adsData = await projRes.json()
          setProjects(adsData)
        } else {
          console.error("Erreur API projets (User):", projRes.status)
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

      {projects.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold">Projets actifs</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((p: any) => (
              <div key={p.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                <h4 className="font-semibold mb-1">{p.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {p.description || p.content}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Budget : {p.budget_limit ?? 0}</span>
                  <span className="capitalize">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

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
import { fetchWithAuth } from "@/lib/apiClient"
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

interface DashboardContentProps {
  initialStats?: DashboardStats | null
}

export function DashboardContent({ initialStats = null }: DashboardContentProps) {
  const [loading, setLoading] = useState(true)
  const [entrepreneursList, setEntrepreneursList] = useState<EntrepreneurProfile[]>([])
  const [profilesWarning, setProfilesWarning] = useState<string | null>(null)
  const { stats, statsLoading, statsError } = useDashboardStats({
    endpoint: "/api/dashboard-user/stats",
    fetcher: fetchWithAuth,
    refreshIntervalMs: 30000,
    initialData: initialStats,
  })


  useEffect(() => {
    let isMounted = true

    const loadDashboardData = async (showLoading: boolean) => {
      if (showLoading && isMounted) {
        setLoading(true)
      }

      try {
        const entRes = await fetchWithAuth("/api/dashboard-user/featured-entrepreneurs")
        let nextWarning: string | null = null

        if (entRes.ok) {
          const entData = await entRes.json()

          let userFollowsIds: string[] = []
          try {
            const followsRes = await fetchWithAuth("/api/users/follows")
            if (followsRes.ok) {
              const followsData = await followsRes.json()
              userFollowsIds = followsData.map((f: any) => f.user_id || f.id)
            } else {
              nextWarning = "Le statut de vos abonnements n’a pas pu être synchronisé sur le dashboard." 
            }
          } catch (error) {
            console.error("Failed to load follows, continuing without", error)
            nextWarning = "Le statut de vos abonnements n’a pas pu être synchronisé sur le dashboard."
          }

          const nextEntrepreneurs = entData.map((e: EntrepreneurApiResponse) => {
            const profileId = e.user_id || e.id || "0"
            return {
              id: profileId,
              name: (e.first_name || e.last_name) ? `${e.first_name || ''} ${e.last_name || ''}`.trim() : "Utilisateur Nexus",
              role: e.role || "Membre Nexus",
              location: e.city ? `${e.city}, ${e.countries?.name || ''}` : (e.countries?.name || "Afrique de l'Ouest"),
              avatar: e.avatar_url || "/profil/avatar.jpg",
              specialty: e.specialty || "Expertise",
              category: e.category || "",
              verified: !!e.is_verified,
              premium: !!e.is_premium,
              followers: e.followers_count || 0,
              isFollowed: userFollowsIds.includes(profileId),
              tags: e.tags || []
            }
          })

          if (!isMounted) {
            return
          }

          setEntrepreneursList(nextEntrepreneurs)
          setProfilesWarning(nextWarning)
        } else {
          console.error("Erreur API entrepreneurs (User):", entRes.status)

          if (showLoading && isMounted) {
            setEntrepreneursList([])
          }

          if (isMounted) {
            setProfilesWarning("Les profils mis en avant n’ont pas pu être chargés pour le moment.")
          }
        }
      } catch (error) {
        console.error("Erreur chargement profils dashboard-user:", error)
        if (showLoading && isMounted) {
          setEntrepreneursList([])
        }

        if (isMounted) {
          setProfilesWarning("Les profils mis en avant n’ont pas pu être chargés pour le moment.")
        }
      } finally {
        if (showLoading && isMounted) {
          setLoading(false)
        }
      }
    }

    void loadDashboardData(true)

    const intervalId = window.setInterval(() => {
      void loadDashboardData(false)
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
      {stats ? <StatsSection stats={stats} /> : statsLoading ? <DashboardStatsSkeleton /> : null}

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

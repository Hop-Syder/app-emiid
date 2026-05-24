/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description dashboard-user principal avec sections Hero, Stats et Profils Premium
 * @created 2025-12-24
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { AlertTriangle } from "lucide-react"
import { fetchWithAuth } from "@/lib/apiClient"
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

interface DashboardContentProps {
  initialStats?: DashboardStats | null
}

export function DashboardContent({ initialStats = null }: DashboardContentProps) {
  const [premiumLoading, setPremiumLoading] = useState(true)
  const [newLoading, setNewLoading] = useState(true)
  const [verifiedLoading, setVerifiedLoading] = useState(true)
  const [premiumProfiles, setPremiumProfiles] = useState<EntrepreneurProfile[]>([])
  const [newProfiles, setNewProfiles] = useState<EntrepreneurProfile[]>([])
  const [verifiedProfiles, setVerifiedProfiles] = useState<EntrepreneurProfile[]>([])
  const [profilesWarning, setProfilesWarning] = useState<string | null>(null)
  const { stats, statsLoading, statsError } = useDashboardStats({
    endpoint: "/api/dashboard-user/stats",
    fetcher: fetchWithAuth,
    refreshIntervalMs: 30000,
    initialData: initialStats,
  })


  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let isMounted = true

    const loadDashboardData = async (showLoading: boolean) => {
      if (showLoading && isMounted) {
        setPremiumLoading(true)
        setNewLoading(true)
        setVerifiedLoading(true)
      }

      try {
        const selectFields = `
          id,
          user_id,
          first_name,
          last_name,
          role,
          city,
          avatar_url,
          specialty,
          category,
          is_verified,
          is_premium,
          followers_count,
          countries(name),
          profile_tags(tags(name))
        `

        const premiumQuery = supabase
          .from("user_profiles")
          .select(selectFields)
          .eq("is_published", true)
          .eq("is_premium", true)
          .limit(3)

        const newQuery = supabase
          .from("user_profiles")
          .select(selectFields)
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(6)

        const verifiedQuery = supabase
          .from("user_profiles")
          .select(selectFields)
          .eq("is_published", true)
          .eq("is_verified", true)
          .limit(4)

        const mapProfile = (e: any, follows: string[]) => {
          const profileId = e.user_id || e.id || "0"
          return {
            id: profileId,
            name: (e.first_name || e.last_name) ? `${e.first_name || ''} ${e.last_name || ''}`.trim() : "Membre EmiID",
            role: e.role || "Professionnel",
            location: e.city ? `${e.city}, ${e.countries?.name || ''}` : (e.countries?.name || "Afrique"),
            avatar: e.avatar_url || "/profil/avatar.jpg",
            specialty: e.specialty || "Expertise",
            verified: !!e.is_verified,
            premium: !!e.is_premium,
            followers: e.followers_count || 0,
            isFollowed: follows.includes(profileId),
            tags: e.profile_tags?.map((pt: any) => pt.tags?.name) || []
          }
        }

        let userFollowsIds: string[] = []
        try {
          const followsRes = await fetchWithAuth("/api/users/follows").catch(() => null)
          if (followsRes && "ok" in followsRes && followsRes.ok) {
            const followsData = await followsRes.json()
            userFollowsIds = followsData.map((f: any) => f.user_id || f.id).filter(Boolean)
          }
        } catch {
          // silencieux
        }

        const premiumPromise = premiumQuery
          .then(({ data }) => {
            if (!isMounted) return
            setPremiumProfiles((data || []).map((p) => mapProfile(p, userFollowsIds)))
          })
          .catch((e) => {
            console.error("Erreur chargement premium:", e)
            if (!isMounted) return
            setPremiumProfiles([])
            setProfilesWarning("Les profils mis en avant n’ont pas pu être chargés pour le moment.")
          })
          .finally(() => {
            if (!isMounted) return
            setPremiumLoading(false)
          })

        const newPromise = newQuery
          .then(({ data }) => {
            if (!isMounted) return
            setNewProfiles((data || []).map((p) => mapProfile(p, userFollowsIds)))
          })
          .catch((e) => {
            console.error("Erreur chargement nouveaux profils:", e)
            if (!isMounted) return
            setNewProfiles([])
            setProfilesWarning("Les profils mis en avant n’ont pas pu être chargés pour le moment.")
          })
          .finally(() => {
            if (!isMounted) return
            setNewLoading(false)
          })

        const verifiedPromise = verifiedQuery
          .then(({ data }) => {
            if (!isMounted) return
            setVerifiedProfiles((data || []).map((p) => mapProfile(p, userFollowsIds)))
          })
          .catch((e) => {
            console.error("Erreur chargement profils vérifiés:", e)
            if (!isMounted) return
            setVerifiedProfiles([])
            setProfilesWarning("Les profils mis en avant n’ont pas pu être chargés pour le moment.")
          })
          .finally(() => {
            if (!isMounted) return
            setVerifiedLoading(false)
          })

        await Promise.allSettled([premiumPromise, newPromise, verifiedPromise])
      } catch (error) {
        console.error("Erreur chargement profils dashboard-user:", error)

        if (isMounted) {
          setProfilesWarning("Les profils mis en avant n’ont pas pu être chargés pour le moment.")
        }
      } finally {
        if (showLoading && isMounted) {
          setPremiumLoading(false)
          setNewLoading(false)
          setVerifiedLoading(false)
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

      {/* Section Premium (Elite) */}
      <div className="space-y-4 py-4 bg-slate-50/50 -mx-4 px-4 sm:-mx-8 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 italic uppercase tracking-tighter">
              Profils Premium
            </h3>
            <p className="text-xs text-slate-500 font-medium">L&apos;excellence de notre réseau</p>
          </div>
        </div>
        <EntrepreneursSection entrepreneursList={premiumProfiles} loading={premiumLoading} variant="elite" />
      </div>

      {/* Section Nouveaux Profils (Horizontal) */}
      <div className="space-y-4 py-4 bg-slate-50/50 -mx-4 px-4 sm:-mx-8 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">
              ⚡ Nouveaux Arrivants
            </h3>
            <p className="text-xs text-slate-500 font-medium">Souhaitez-leur la bienvenue</p>
          </div>
        </div>
        <EntrepreneursSection entrepreneursList={newProfiles} loading={newLoading} variant="tech" />
      </div>

      {/* Section 100% Vérifiés */}
      <div className="space-y-4 py-4 bg-slate-50/50 -mx-4 px-4 sm:-mx-8 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 italic uppercase tracking-tighter">
              100% Vérifiés
            </h3>
            <p className="text-xs text-slate-500 font-medium">La confiance avant tout</p>
          </div>
        </div>
        <EntrepreneursSection entrepreneursList={verifiedProfiles} loading={verifiedLoading} variant="glass" />
      </div>
    </div>
  )
}

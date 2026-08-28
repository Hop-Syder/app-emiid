/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook de gestion des statistiques et états d'affichage du Portefeuille (contacts, réseau, compétences).
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useImpactStats } from "@/hooks/use-impact-stats"

export type TabId = "realisations" | "competences" | "reseau" | "communautes"

export interface PortefeuilleStats {
  userId: string
  profileId: string | null
  approvedItems: number
  isPublished: boolean
}

export function usePortefeuille() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  
  const [activeTab, setActiveTab] = useState<TabId>("realisations")
  const [stats, setStats] = useState<PortefeuilleStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Source unique des vues/abonnés — partagée avec le Dashboard (évite deux chiffres divergents).
  const { stats: impact, isLoading: impactLoading } = useImpactStats()

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!active) return
        if (!user) {
          router.push("/login")
          return
        }

        const [profileRes, galleryRes] = await Promise.all([
          supabase
            .from("user_profiles")
            .select("id, is_published")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("project_gallery")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "approved"),
        ])

        if (!active) return

        setStats({
          userId: user.id,
          profileId: profileRes.data?.id ?? null,
          isPublished: profileRes.data?.is_published ?? false,
          approvedItems: galleryRes.count ?? 0,
        })
      } catch (err) {
        console.error("Error loading portfolio stats", err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [supabase, router])

  return {
    activeTab,
    setActiveTab,
    stats,
    loading: loading || impactLoading,
    impact,
  }
}

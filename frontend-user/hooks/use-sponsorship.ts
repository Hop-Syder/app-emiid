/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook React pour la gestion du parrainage à engagement partagé
 *              et le suivi des strikes d'intégrité.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export interface RefereeItem {
  id: string
  referee_id: string
  status: "PENDING" | "ACTIVE" | "REVOKED"
  strikes_count: number
  created_at: string
  referee?: {
    full_name?: string | null
    avatar_url?: string | null
    identity_verified?: boolean | null
    headline?: string | null
  }
}

export function useSponsorship() {
  const [referees, setReferees] = useState<RefereeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [sponsorStrikes, setSponsorStrikes] = useState<number>(0)
  const [isSuspended, setIsSuspended] = useState<boolean>(false)

  const supabase = createClient()

  const fetchSponsorshipData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setReferees([])
        setLoading(false)
        return
      }

      setUserId(user.id)

      // 1. Récupération des parrainages où l'utilisateur est le sponsor
      const { data: spData, error: spError } = await (supabase as any)
        .from("sponsorships")
        .select(`
          id,
          referee_id,
          status,
          strikes_count,
          created_at,
          referee:referee_id(full_name, avatar_url, identity_verified, headline)
        `)
        .eq("sponsor_id", user.id)
        .order("created_at", { ascending: false })

      if (spError) {
        console.error("[useSponsorship] Erreur:", spError)
      } else if (spData) {
        setReferees(spData as RefereeItem[])

        // Calcul des strikes cumulés
        const totalStrikes = spData.reduce((acc: number, item: any) => acc + (item.strikes_count || 0), 0)
        setSponsorStrikes(totalStrikes)
        setIsSuspended(totalStrikes >= 2)
      }
    } catch (err: any) {
      console.error("[useSponsorship] Exception:", err)
      setError(err?.message || "Impossible de charger les données de parrainage.")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSponsorshipData()
  }, [fetchSponsorshipData])

  const referralLink = typeof window !== "undefined" && userId
    ? `${window.location.origin}/register?ref=${userId}`
    : userId
    ? `https://emiid.org/register?ref=${userId}`
    : ""

  return {
    referees,
    referralLink,
    sponsorStrikes,
    isSuspended,
    loading,
    error,
    refetch: fetchSponsorshipData,
  }
}

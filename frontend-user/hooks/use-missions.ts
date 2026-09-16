/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook React personnalisé pour la recherche, consultation
 *              et candidature aux missions courtes EmiID.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Mission, MissionApplication } from "@/types/missions"

export type MissionFilterTab = "ALL" | "MY_POSTED" | "MY_APPLIED"

export function useMissions(tab: MissionFilterTab = "ALL", searchQuery = "") {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      setCurrentUserId(user?.id || null)

      // NOTE (correctif 2026-09-15) : missions.client_id référence auth.users,
      // pas user_profiles — PostgREST ne peut pas faire d'embed direct
      // (`client:client_id(...)`) puisqu'aucune FK ne relie missions à
      // user_profiles. On récupère les profils séparément et on les fusionne
      // côté client (voir plus bas).
      let query = (supabase as any)
        .from("missions")
        .select("*")
        .order("created_at", { ascending: false })

      if (tab === "MY_POSTED") {
        if (!user) {
          setMissions([])
          setLoading(false)
          return
        }
        query = query.eq("client_id", user.id)
      } else if (tab === "MY_APPLIED") {
        if (!user) {
          setMissions([])
          setLoading(false)
          return
        }
        // Récupère d'abord les IDs de mission où l'utilisateur a postulé.
        // Colonne réelle : pro_id (pas freelancer_id) — voir
        // sql/migrations/20260915_missions_engine_phase1.sql:124-133.
        const { data: myApps, error: myAppsError } = await (supabase as any)
          .from("mission_applications")
          .select("mission_id")
          .eq("pro_id", user.id)

        if (myAppsError) {
          console.error("[useMissions] Erreur lecture candidatures:", myAppsError)
          setError(myAppsError.message)
          return
        }

        const missionIds = (myApps || []).map((a: any) => a.mission_id)
        if (missionIds.length === 0) {
          setMissions([])
          setLoading(false)
          return
        }
        query = query.in("id", missionIds)
      } else {
        // "ALL" : missions visibles hors brouillon/annulé/expiré/litige.
        // Valeurs réelles de l'enum public.mission_status (aucune valeur
        // "OPEN" n'existe) — voir sql/migrations/20260915_missions_engine_phase1.sql:64-66.
        query = query.in("status", [
          "PUBLISHED", "APPLICATIONS_OPEN", "APPLICATIONS_CLOSED",
          "ASSIGNED", "IN_PROGRESS", "DELIVERED", "COMPLETED",
        ])
      }

      if (searchQuery.trim()) {
        query = query.ilike("title", `%${searchQuery.trim()}%`)
      }

      const { data: missionsData, error: missionsError } = await query

      if (missionsError) {
        console.error("[useMissions] Erreur chargement missions:", missionsError)
        setError(missionsError.message)
        return
      }

      const missionIds = (missionsData || []).map((m: any) => m.id)
      const clientIds = Array.from(new Set((missionsData || []).map((m: any) => m.client_id).filter(Boolean)))

      // Comptage des candidatures + profils clients en parallèle (indépendants).
      const [appsResult, profilesResult] = await Promise.all([
        missionIds.length > 0
          ? (supabase as any).from("mission_applications").select("mission_id").in("mission_id", missionIds)
          : Promise.resolve({ data: [] as any[] }),
        clientIds.length > 0
          ? (supabase as any)
              .from("user_profiles")
              .select("user_id, first_name, last_name, avatar_url, trust_tier, identity_verified")
              .in("user_id", clientIds)
          : Promise.resolve({ data: [] as any[] }),
      ])

      const countMap: Record<string, number> = {}
      ;(appsResult.data || []).forEach((app: any) => {
        countMap[app.mission_id] = (countMap[app.mission_id] || 0) + 1
      })

      const profileMap: Record<string, any> = {}
      ;(profilesResult.data || []).forEach((p: any) => {
        profileMap[p.user_id] = {
          full_name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || null,
          avatar_url: p.avatar_url,
          trust_tier: p.trust_tier,
          identity_verified: p.identity_verified,
        }
      })

      const formatted = (missionsData || []).map((m: any) => ({
        ...m,
        applications_count: countMap[m.id] || 0,
        client: profileMap[m.client_id] || null,
      }))

      setMissions(formatted)
    } catch (err: any) {
      console.error("[useMissions] Exception:", err)
      setError(err?.message || "Erreur de chargement des missions.")
    } finally {
      setLoading(false)
    }
  }, [supabase, tab, searchQuery])

  useEffect(() => {
    fetchMissions()
  }, [fetchMissions])

  return {
    missions,
    loading,
    error,
    currentUserId,
    refetch: fetchMissions,
  }
}

export function useMissionDetail(missionId: string) {
  const [mission, setMission] = useState<Mission | null>(null)
  const [applications, setApplications] = useState<MissionApplication[]>([])
  const [hasApplied, setHasApplied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchDetail = useCallback(async () => {
    if (!missionId) return

    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      setCurrentUserId(user?.id || null)

      // Mission + candidatures en parallèle (indépendantes, toutes deux ne
      // dépendent que de missionId déjà connu).
      // NOTE (correctif 2026-09-15) : ni missions.client_id ni
      // mission_applications.pro_id ne référencent user_profiles (les deux
      // référencent auth.users) — PostgREST ne peut pas les embarquer via
      // `client:client_id(...)`/`freelancer:freelancer_id(...)`. Les profils
      // sont récupérés séparément et fusionnés ci-dessous. Colonne réelle de
      // mission_applications : pro_id, pas freelancer_id (voir
      // sql/migrations/20260915_missions_engine_phase1.sql:124-133).
      const [{ data: mData, error: mError }, { data: appsRaw, error: appsError }] = await Promise.all([
        (supabase as any).from("missions").select("*").eq("id", missionId).single(),
        (supabase as any)
          .from("mission_applications")
          .select("*")
          .eq("mission_id", missionId)
          .order("created_at", { ascending: true }),
      ])

      if (mError) {
        setError("Mission introuvable ou indisponible.")
        return
      }

      if (appsError) {
        console.error("[useMissionDetail] Erreur lecture candidatures:", appsError)
      }

      const appsData = appsRaw || []
      const profileIds = Array.from(
        new Set([mData?.client_id, ...appsData.map((a: any) => a.pro_id)].filter(Boolean))
      )

      const { data: profiles } = profileIds.length > 0
        ? await (supabase as any)
            .from("user_profiles")
            .select("user_id, first_name, last_name, avatar_url, trust_tier, identity_verified")
            .in("user_id", profileIds)
        : { data: [] as any[] }

      const profileMap: Record<string, any> = {}
      ;(profiles || []).forEach((p: any) => {
        profileMap[p.user_id] = {
          full_name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || null,
          avatar_url: p.avatar_url,
          trust_tier: p.trust_tier,
          identity_verified: p.identity_verified,
        }
      })

      const apps = appsData.map((a: any) => ({
        ...a,
        freelancer_id: a.pro_id,
        freelancer: profileMap[a.pro_id] || null,
      })) as MissionApplication[]
      setApplications(apps)

      if (user) {
        const found = apps.some((a) => a.freelancer_id === user.id)
        setHasApplied(found)
      }

      setMission({
        ...mData,
        applications_count: apps.length,
        client: profileMap[mData?.client_id] || null,
      })
    } catch (err: any) {
      setError(err?.message || "Erreur de chargement.")
    } finally {
      setLoading(false)
    }
  }, [supabase, missionId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return {
    mission,
    applications,
    hasApplied,
    loading,
    error,
    currentUserId,
    isClient: currentUserId && mission ? currentUserId === mission.client_id : false,
    refetch: fetchDetail,
  }
}

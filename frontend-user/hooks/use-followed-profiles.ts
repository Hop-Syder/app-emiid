/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook de gestion des profils suivis (favoris, abonnés, notes et temps réel).
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { fetchWithAuth } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export interface PortfolioProfile {
  id?: string
  user_id?: string
  slug?: string
  name: string
  role?: string
  location?: string
  avatar_url?: string
  specialty?: string
  followers?: number
  followers_count?: number
  is_premium?: boolean
  is_verified?: boolean
  card_variant?: string
  notes?: string | null
  followed_at?: string | null
  last_active_at?: string | null
  last_active_label?: string | null
}

export function useFollowedProfiles() {
  const [followedProfiles, setFollowedProfiles] = useState<PortfolioProfile[]>([])
  const [followers, setFollowers] = useState<PortfolioProfile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<PortfolioProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "recent" | "followers">("recent")
  const [activeTab, setActiveTab] = useState("following")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const isMountedRef = useRef(true)

  const loadFollows = useCallback(async () => {
    try {
      const [followingRes, followersRes] = await Promise.all([
        fetchWithAuth("/api/users/follows"),
        fetchWithAuth("/api/users/followers")
      ])

      if (!isMountedRef.current) return

      if (followingRes.ok) {
        const data = await followingRes.json() as PortfolioProfile[]
        setFollowedProfiles(data)
      }

      if (followersRes.ok) {
        const data = await followersRes.json() as PortfolioProfile[]
        setFollowers(data)
      }
    } catch (error) {
      console.error("Load follows error:", error)
      if (isMountedRef.current) {
        toast.error("Erreur lors du chargement de votre portefeuille")
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  // Session & Realtime subscriptions
  useEffect(() => {
    isMountedRef.current = true
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (isMountedRef.current && user) {
        setCurrentUserId(user.id)
      }
    })

    loadFollows()

    return () => {
      isMountedRef.current = false
    }
  }, [supabase, loadFollows])

  useEffect(() => {
    if (!currentUserId) return

    const followingChannel = supabase
      .channel(`portfolio-following-${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_follows", filter: `follower_id=eq.${currentUserId}` },
        () => { void loadFollows() }
      )
      .subscribe()

    const followersChannel = supabase
      .channel(`portfolio-followers-${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_follows", filter: `following_id=eq.${currentUserId}` },
        () => { void loadFollows() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(followingChannel)
      supabase.removeChannel(followersChannel)
    }
  }, [currentUserId, supabase, loadFollows])

  // Filtering and Sorting
  useEffect(() => {
    const source = activeTab === "following" ? followedProfiles : followers
    let result = [...source]

    if (searchQuery) {
      result = result.filter(p =>
        (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.specialty || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    result.sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "")
      if (sortBy === "followers") return (b.followers_count || b.followers || 0) - (a.followers_count || a.followers || 0)
      return new Date(b.last_active_at || b.followed_at || Date.now()).getTime() - new Date(a.last_active_at || a.followed_at || Date.now()).getTime()
    })

    setFilteredProfiles(result)
  }, [searchQuery, followedProfiles, followers, sortBy, activeTab])

  const handleUnfollow = useCallback(async (profileId: string) => {
    if (unfollowingId) return
    setUnfollowingId(profileId)
    try {
      const res = await fetchWithAuth(`/api/users/follow/${profileId}`, {
        method: "POST"
      })
      if (res.ok) {
        setFollowedProfiles(prev => prev.filter(p => (p.user_id || p.id) !== profileId))
        toast.success("Vous ne suivez plus ce profil")
      } else {
        toast.error("Impossible de mettre à jour l'abonnement")
      }
    } catch {
      toast.error("Une erreur est survenue")
    } finally {
      setUnfollowingId(null)
    }
  }, [unfollowingId])

  const handleSaveNote = useCallback(async (profileId: string, note: string) => {
    try {
      const res = await fetchWithAuth(`/api/users/follow/${profileId}/note`, {
        method: "PUT",
        body: JSON.stringify({ note })
      })
      if (res.ok) {
        setFollowedProfiles(prev => prev.map(p =>
          (p.user_id || p.id) === profileId ? { ...p, notes: note } : p
        ))
        toast.success("Note enregistrée avec succès")
      } else {
        toast.error("Erreur lors de l'enregistrement de la note")
      }
    } catch {
      toast.error("Erreur de connexion")
    }
  }, [])

  return {
    followedProfiles,
    followers,
    filteredProfiles,
    loading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    currentUserId,
    unfollowingId,
    handleUnfollow,
    handleSaveNote,
  }
}

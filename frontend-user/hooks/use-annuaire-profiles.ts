/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook personnalisé pour charger, paginer, filtrer et synchroniser les profils de l'annuaire.
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchFollowedIds } from "@/lib/follows"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import type { PublicProfile } from "@/types"

interface FiltersState {
  search: string
  category: string
  country: string
  city: string
  tags: string
  status: string
  activity_domain: string
  lat?: string
  lng?: string
}

interface UseAnnuaireProfilesProps {
  filters?: FiltersState
  initialProfiles?: PublicProfile[]
  onlyPremium?: boolean
}

export function useAnnuaireProfiles({
  filters,
  initialProfiles = [],
  onlyPremium = false,
}: UseAnnuaireProfilesProps) {
  const router = useRouter()
  const { session } = useCurrentUserProfile()
  const [profiles, setProfiles] = useState<PublicProfile[]>(initialProfiles)
  const [loading, setLoading] = useState(false)
  const [isFirstRender, setIsFirstRender] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(initialProfiles.length)
  const limit = 30

  // Réinitialiser la page au changement de filtres
  useEffect(() => {
    setPage(1)
  }, [filters])

  // Hydrater le statut "Suivi" au premier montage client
  useEffect(() => {
    if (!session) return
    let active = true
    ;(async () => {
      try {
        const followedIds = await fetchFollowedIds()
        if (active && followedIds) {
          setProfiles((prev) =>
            prev.map((p) => ({
              ...p,
              isFollowed: followedIds.has(p.id),
            }))
          )
        }
      } catch (err) {
        console.error("Failed to load followed profiles at mount", err)
      }
    })()

    return () => {
      active = false
    }
  }, [session])

  // Charger les profils en fonction des filtres et de la pagination
  useEffect(() => {
    const isDefaultFilters =
      !filters ||
      (!filters.search &&
        (!filters.category || filters.category === "all") &&
        (!filters.activity_domain || filters.activity_domain === "all") &&
        (!filters.country || filters.country === "all") &&
        !filters.city &&
        !filters.tags)

    if (isFirstRender && isDefaultFilters && initialProfiles.length > 0 && page === 1) {
      setIsFirstRender(false)
      return
    }

    let active = true

    const loadProfiles = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.append("page", page.toString())
        params.append("limit", limit.toString())

        if (filters?.search) params.append("search", filters.search)
        if (filters?.category && filters.category !== "all") params.append("category", filters.category)
        if (filters?.activity_domain && filters.activity_domain !== "all") {
          params.append("activity_domain", filters.activity_domain)
        }
        if (filters?.country && filters.country !== "all") params.append("country", filters.country)
        if (filters?.city) params.append("city", filters.city)
        if (filters?.tags) params.append("tags", filters.tags)
        if (filters?.lat && filters?.lng) {
          params.append("lat", filters.lat)
          params.append("lng", filters.lng)
        }

        if (filters?.status === "premium" || onlyPremium) {
          params.append("onlyPremium", "true")
        }
        if (filters?.status === "verified") {
          params.append("onlyVerified", "true")
        }

        const res = await fetch(`/api/annuaire?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to fetch")

        const result = await res.json()
        const fetchedProfiles = result.profiles || []

        const followedIds = session ? await fetchFollowedIds() : null

        if (active) {
          const updatedProfiles = fetchedProfiles.map((p: PublicProfile) => ({
            ...p,
            isFollowed: !!followedIds?.has(p.id),
          }))
          setProfiles(updatedProfiles)
          setTotalCount(result.count || 0)
        }
      } catch (error) {
        console.error("Erreur chargement annuaire:", error)
      } finally {
        if (active) {
          setLoading(false)
          setIsFirstRender(false)
        }
      }
    }

    loadProfiles()

    return () => {
      active = false
    }
  }, [filters, page, onlyPremium, isFirstRender, initialProfiles.length])

  const totalPages = Math.ceil(totalCount / limit)

  const handleResetFilters = () => {
    router.push("/annuaire")
  }

  return {
    profiles,
    loading,
    page,
    setPage,
    totalPages,
    totalCount,
    handleResetFilters,
  }
}

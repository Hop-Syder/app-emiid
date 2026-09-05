/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook personnalisé pour charger, paginer, filtrer et synchroniser les profils de l'annuaire.
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchFollowedIds } from "@/lib/follows"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import type { PublicProfile } from "@/types"

interface FiltersState {
  search: string
  category: string
  country: string
  city: string
  /** Découpage administratif (Bénin) — identifiants, pas des libellés. */
  department: string
  commune: string
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

/**
 * Vrai quand aucun critère n'est posé : les profils rendus par le serveur
 * suffisent alors, et interroger l'API n'apporterait rien.
 */
function hasNoActiveFilter(filters?: FiltersState): boolean {
  return (
    !filters ||
    (!filters.search &&
      (!filters.category || filters.category === "all") &&
      (!filters.activity_domain || filters.activity_domain === "all") &&
      (!filters.country || filters.country === "all") &&
      !filters.city &&
      !filters.department &&
      !filters.commune &&
      !filters.tags)
  )
}

export function useAnnuaireProfiles({
  filters,
  initialProfiles = [],
  onlyPremium = false,
}: UseAnnuaireProfilesProps) {
  const router = useRouter()
  const { session } = useCurrentUserProfile()
  const [profiles, setProfiles] = useState<PublicProfile[]>(initialProfiles)
  // Une requête est due dès le montage si le serveur n'a pas déjà fourni la bonne
  // liste — typiquement une arrivée sur /annuaire?search=… . Démarrer à `false`
  // faisait afficher « Aucun résultat trouvé » pendant tout le temps du chargement,
  // exactement l'écran vide que voit l'utilisateur après une recherche vocale.
  const [loading, setLoading] = useState(
    () => !(hasNoActiveFilter(filters) && initialProfiles.length > 0)
  )
  // Un ref, pas un state : consommer le rendu serveur ne doit pas provoquer de
  // re-rendu, sous peine de relancer l'effet et de doubler les appels réseau.
  const isFirstRender = useRef(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(initialProfiles.length)
  // L'API le signale quand le classement par pertinence est indisponible et que
  // les résultats proviennent du repli lexical : l'écran doit le dire plutôt que
  // de faire passer une liste approximative pour un classement fiable.
  const [degraded, setDegraded] = useState(false)
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
    const isDefaultFilters = hasNoActiveFilter(filters)

    if (isFirstRender.current && isDefaultFilters && initialProfiles.length > 0 && page === 1) {
      isFirstRender.current = false
      return
    }

    let active = true
    // Chaque changement de filtre annule la requête précédente. Sans cela, trois
    // clics rapides lançaient trois requêtes concurrentes qui se disputaient les
    // six connexions du navigateur : la dernière — la seule qui compte — partait
    // en dernier et attendait que les autres se terminent.
    const controller = new AbortController()

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
        if (filters?.department) params.append("department", filters.department)
        if (filters?.commune) params.append("commune", filters.commune)
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

        // Les deux appels sont indépendants : les enchaîner ajoutait un
        // aller-retour complet AVANT le premier pixel. `fetchFollowedIds` est
        // servi par un cache, mais le premier appel de la session ne l'est pas —
        // et c'est justement le plus visible.
        const [res, followedIds] = await Promise.all([
          fetch(`/api/annuaire?${params.toString()}`, { signal: controller.signal }),
          session ? fetchFollowedIds().catch(() => null) : Promise.resolve(null),
        ])
        if (!res.ok) throw new Error("Failed to fetch")

        const result = await res.json()
        const fetchedProfiles = result.profiles || []

        if (active) {
          const updatedProfiles = fetchedProfiles.map((p: PublicProfile) => ({
            ...p,
            isFollowed: !!followedIds?.has(p.id),
          }))
          setProfiles(updatedProfiles)
          setTotalCount(result.count || 0)
          setDegraded(!!result.degraded)
        }
      } catch (error) {
        // Une requête annulée n'est pas une panne : c'est le comportement voulu.
        if ((error as Error)?.name === "AbortError") return
        console.error("Erreur chargement annuaire:", error)
      } finally {
        if (active) {
          setLoading(false)
          isFirstRender.current = false
        }
      }
    }

    loadProfiles()

    return () => {
      active = false
      controller.abort()
    }
    // Hors dépendances volontairement :
    //  • `initialProfiles` ne décrit que le rendu serveur initial ; le réintroduire
    //    relançait la requête sans raison ;
    //  • `session` ne sert qu'à teinter le bouton « Suivi » — l'effet dédié
    //    ci-dessus s'en charge déjà, sans recharger toute la grille.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, onlyPremium])

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
    degraded,
    handleResetFilters,
  }
}

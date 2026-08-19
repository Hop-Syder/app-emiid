/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook personnalisé pour encapsuler la gestion des actions (follow, redirection, message) sur les profils d'entrepreneurs.
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { fetchWithAuth } from "@/lib/apiClient"
import { fetchFollowedIds } from "@/lib/follows"
import { toast } from "sonner"
import type { PublicProfile } from "@/types"

export function useEntrepreneurActions(initialProfiles: PublicProfile[]) {
  const router = useRouter()
  const { session } = useCurrentUserProfile()
  const [profiles, setProfiles] = useState<PublicProfile[]>(initialProfiles)

  useEffect(() => {
    const initialIds = initialProfiles.map((p) => p.id).join(",")
    const currentIds = profiles.map((p) => p.id).join(",")
    if (initialIds !== currentIds) {
      setProfiles(initialProfiles)
    }
  }, [initialProfiles, profiles])

  // Synchronisation globale du follow temps-réel (depuis d'autres surfaces)
  useEffect(() => {
    const handler = (e: Event) => {
      const { userId, followed } = (e as CustomEvent).detail || {}
      if (!userId) return
      setProfiles((prev) =>
        prev.map((p) =>
          p.id !== userId || !!p.isFollowed === followed
            ? p
            : {
                ...p,
                isFollowed: followed,
                followers: followed ? p.followers + 1 : Math.max(0, p.followers - 1),
              }
        )
      )
    }

    window.addEventListener("emiid-follow-toggle", handler)
    return () => {
      window.removeEventListener("emiid-follow-toggle", handler)
    }
  }, [])

  // Hydrater l'état d'abonnement réel de l'utilisateur connecté au chargement
  useEffect(() => {
    if (!session) return
    let active = true
    ;(async () => {
      const followedIds = await fetchFollowedIds()
      if (!active || !followedIds) return
      setProfiles((prev) =>
        prev.map((p) => ({
          ...p,
          isFollowed: followedIds.has(p.id),
        }))
      )
    })()
    return () => {
      active = false
    }
  }, [session])

  const handleCardAction = async (
    type: "message" | "follow" | "view",
    entrepreneurId?: string,
    profileIdentifier?: string
  ) => {
    if (!entrepreneurId) return

    if (type === "view") {
      router.push(`/profil/${profileIdentifier || entrepreneurId}`)
      return
    }

    if (type === "message") {
      router.push(`/messages?contact=${entrepreneurId}`)
      return
    }

    if (type === "follow") {
      if (!session) {
        toast.info("Veuillez vous connecter pour interagir avec ce membre", {
          action: {
            label: "Connexion",
            onClick: () => router.push("/login"),
          },
        })
        return
      }

      try {
        const res = await fetchWithAuth(`/api/users/follow/${entrepreneurId}`, { method: "POST" })
        if (res.ok) {
          const data = await res.json()
          setProfiles((prev) =>
            prev.map((profile) => {
              if (profile.id !== entrepreneurId) {
                return profile
              }
              return {
                ...profile,
                isFollowed: data.followed,
                followers: data.followed ? profile.followers + 1 : Math.max(0, profile.followers - 1),
              }
            })
          )

          // Propage l'action vers les autres surfaces du DOM
          window.dispatchEvent(
            new CustomEvent("emiid-follow-toggle", {
              detail: { userId: entrepreneurId, followed: data.followed },
            })
          )

          toast.success(data.followed ? "Abonnement effectué" : "Désabonné avec succès")
        } else {
          toast.error("Impossible de suivre ce membre pour le moment")
        }
      } catch (error) {
        console.error("Follow error:", error)
        toast.error("Erreur de connexion")
      }
    }
  }

  const handleRedirectToAnnuaire = () => {
    router.push("/annuaire")
  }

  return {
    profiles,
    session,
    handleCardAction,
    handleRedirectToAnnuaire,
  }
}

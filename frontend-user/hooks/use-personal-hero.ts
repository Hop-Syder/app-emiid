/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook personnalisé encapsulant la logique d'état et d'interrogation Supabase du cockpit personnel (PersonalHero).
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { fetchWithAuth } from "@/lib/apiClient"
import { useImpactStats } from "@/hooks/use-impact-stats"

export const FIELD_LABELS = [
  { key: "avatar_url", label: "Ajoutez une photo", href: "/creer-profil" },
  { key: "bio", label: "Rédigez votre bio", href: "/creer-profil" },
  { key: "specialty", label: "Précisez votre spécialité", href: "/creer-profil" },
  { key: "city", label: "Indiquez votre ville", href: "/creer-profil" },
  { key: "phone", label: "Ajoutez un téléphone", href: "/parametres" },
  { key: "website", label: "Ajoutez un site web", href: "/creer-profil" },
  { key: "role", label: "Renseignez votre rôle", href: "/creer-profil" },
  { key: "category", label: "Choisissez une catégorie", href: "/creer-profil" },
]

export interface OwnProfile {
  avatar_url?: string | null
  bio?: string | null
  specialty?: string | null
  city?: string | null
  phone?: string | null
  website?: string | null
  role?: string | null
  category?: string | null
  is_premium?: boolean | null
}

export function usePersonalHero() {
  const supabase = createClient()
  const { stats } = useImpactStats()
  const [profile, setProfile] = useState<OwnProfile | null>(null)
  const [unreadMsgs, setUnreadMsgs] = useState(0)
  const [realisationsCount, setRealisationsCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) {
          if (active) setLoading(false)
          return
        }

        // Profil propre : lu via le backend (/api/users/me, service_role) plutôt
        // qu'en direct sur user_profiles — le rôle authenticated n'a plus accès
        // aux colonnes sensibles (phone, email…). La complétude « téléphone »
        // reste ainsi calculable sans exposer ces colonnes côté client.
        const profileReq = fetchWithAuth("/api/users/me")

        const msgReq = supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("type", "message")
          .eq("is_read", false)

        const realisationsReq = supabase
          .from("project_gallery")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        const [profileRes, msgRes, galleryRes] = await Promise.all([profileReq, msgReq, realisationsReq])

        if (msgRes.error) throw msgRes.error
        if (galleryRes.error) throw galleryRes.error

        let ownProfile: OwnProfile | null = null
        if (profileRes.ok) {
          const d = await profileRes.json()
          ownProfile = {
            avatar_url: d.avatar_url ?? null,
            bio: d.bio ?? null,
            specialty: d.specialty ?? null,
            city: d.city ?? null,
            phone: d.phone ?? null,
            website: d.website ?? null,
            role: d.role ?? null,
            category: d.category ?? null,
            is_premium: d.is_premium ?? null,
          }
        }

        if (active) {
          setProfile(ownProfile)
          setUnreadMsgs(msgRes.count ?? 0)
          setRealisationsCount(galleryRes.count ?? 0)
        }
      } catch (err) {
        console.error("Failed to load personal hero cockpit data", err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [supabase])

  const filled = FIELD_LABELS.filter((f) => {
    const v = profile?.[f.key as keyof OwnProfile]
    return typeof v === "string" ? v.trim().length > 0 : !!v
  })

  const completion = FIELD_LABELS.length > 0 ? Math.round((filled.length / FIELD_LABELS.length) * 100) : 0
  const missing = FIELD_LABELS.filter((f) => !filled.includes(f))
  const nextAction = missing[0] || null
  const isPremium = !!profile?.is_premium

  return {
    profile,
    unreadMsgs,
    realisationsCount,
    loading,
    completion,
    nextAction,
    isPremium,
    stats,
  }
}

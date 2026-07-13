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

        const profileReq = supabase
          .from("user_profiles")
          .select("avatar_url, bio, specialty, city, phone, website, role, category, is_premium")
          .eq("user_id", user.id)
          .maybeSingle()

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

        if (profileRes.error) throw profileRes.error
        if (msgRes.error) throw msgRes.error
        if (galleryRes.error) throw galleryRes.error

        if (active) {
          setProfile((profileRes.data as OwnProfile) || null)
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

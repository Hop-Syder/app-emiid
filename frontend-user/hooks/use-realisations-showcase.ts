/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook personnalisé pour charger et formater les réalisations approuvées dans le showcase du dashboard.
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface ShowcaseItem {
  id: string
  title: string | null
  description: string | null
  imageUrl: string
  authorName: string
  authorAvatar: string | null
  authorSlug: string | null
}

export function useRealisationsShowcase() {
  const supabase = createClient()
  const [items, setItems] = useState<ShowcaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ShowcaseItem | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        // Récupérer les 12 réalisations approuvées les plus récentes
        const { data: gallery, error: galleryError } = await supabase
          .from("project_gallery")
          .select("id, title, description, image_url, profile_id")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(12)

        if (galleryError) throw galleryError

        const rows = (gallery as { id: string; title: string | null; description: string | null; image_url: string; profile_id: string | null }[]) || []
        const profileIds = Array.from(new Set(rows.map((r) => r.profile_id).filter(Boolean))) as string[]

        // Charger les profils auteurs correspondants
        const authorMap = new Map<string, { name: string; avatar: string | null; slug: string | null }>()
        if (profileIds.length) {
          const { data: profs, error: profsError } = await supabase
            .from("public_profiles")
            .select("id, first_name, last_name, avatar_url, slug")
            .in("id", profileIds)

          if (profsError) throw profsError

          for (const p of (profs as { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null; slug: string | null }[]) || []) {
            authorMap.set(p.id, {
              name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Membre EmiID",
              avatar: p.avatar_url,
              slug: p.slug,
            })
          }
        }

        const mapped: ShowcaseItem[] = rows.map((r) => {
          const a = r.profile_id ? authorMap.get(r.profile_id) : undefined
          return {
            id: r.id,
            title: r.title,
            description: r.description,
            imageUrl: r.image_url,
            authorName: a?.name || "Membre EmiID",
            authorAvatar: a?.avatar || "/profil/avatar.jpg",
            authorSlug: a?.slug || null,
          }
        })

        if (active) {
          setItems(mapped)
        }
      } catch (err) {
        console.error("Failed to fetch realisations showcase", err)
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

  return {
    items,
    loading,
    selected,
    setSelected,
  }
}

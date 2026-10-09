/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Stories 24 h (« Chantiers du jour ») : lecture du fil, publication
 *              et suppression. Une story expire d'elle-même au bout de 24 h —
 *              la RLS cesse de la servir, rien à purger côté client.
 *
 *              Repli : tant que la migration 20261011 n'est pas appliquée, la
 *              table n'existe pas. On le détecte une fois et on se tait, plutôt
 *              que d'afficher une erreur sur l'accueil.
 * @created 2026-10-09
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { compressImage } from "@/lib/compress-image"

export interface Story {
  id: string
  imageUrl: string
  caption: string | null
  createdAt: string
  expiresAt: string
  authorUserId: string
  authorName: string
  authorAvatar: string | null
  authorSlug: string | null
  authorRole: string | null
  authorVerified: boolean
  /** Vue par son auteur seulement (RLS) ; 0 pour les autres. */
  viewsCount: number
  isMine: boolean
}

interface StoryRow {
  id: string
  user_id: string
  profile_id: string | null
  image_url: string
  caption: string | null
  created_at: string
  expires_at: string
}

interface AuthorRow {
  id: string
  user_id: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  slug: string | null
  role: string | null
  is_verified: boolean | null
}

/**
 * Accès aux tables créées par la migration 20261011. Les types Supabase sont
 * générés depuis la base : tant que la migration n'est pas appliquée puis
 * `npm run gen:types` relancé, `profile_stories` et `story_views` leur sont
 * inconnues. Ce contrat minimal décrit exactement les appels utilisés ici.
 */
interface PendingQuery extends PromiseLike<{ data: unknown; error: { code?: string } | null }> {
  select: (cols: string) => PendingQuery
  insert: (row: Record<string, unknown>) => PendingQuery
  upsert: (row: Record<string, unknown>, opts?: Record<string, unknown>) => PendingQuery
  delete: () => PendingQuery
  eq: (col: string, value: unknown) => PendingQuery
  in: (col: string, values: unknown[]) => PendingQuery
  gt: (col: string, value: unknown) => PendingQuery
  order: (col: string, opts: { ascending: boolean }) => PendingQuery
  limit: (n: number) => PendingQuery
}

type StoryClient = { from: (table: "profile_stories" | "story_views") => PendingQuery }

/** Une photo de chantier : large mais légère, à l'envoi (plan Supabase gratuit). */
const STORY_MAX_SIZE = 1440

export function useStories({ limit = 30 }: { limit?: number } = {}) {
  const supabase = useMemo(() => createClient(), [])
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [available, setAvailable] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user?.id ?? null
      setCurrentUserId(uid)

      const { data, error } = await (supabase as unknown as StoryClient)
        .from("profile_stories")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        // 42P01 : la table n'existe pas encore (migration non appliquée).
        if (error.code === "42P01") setAvailable(false)
        setStories([])
        return
      }

      const rows = (data as unknown as StoryRow[]) ?? []
      if (rows.length === 0) return setStories([])

      const profileIds = Array.from(new Set(rows.map((r) => r.profile_id).filter(Boolean))) as string[]
      const authors = new Map<string, AuthorRow>()
      if (profileIds.length > 0) {
        const { data: profs } = await supabase.from("public_profiles").select("*").in("id", profileIds)
        for (const p of ((profs as unknown as AuthorRow[]) ?? [])) authors.set(p.id, p)
      }

      // Compteur de vues : seules les stories de l'utilisateur remontent (RLS).
      const views = new Map<string, number>()
      if (uid) {
        const mine = rows.filter((r) => r.user_id === uid).map((r) => r.id)
        if (mine.length > 0) {
          const { data: vs } = await (supabase as unknown as StoryClient)
            .from("story_views")
            .select("story_id")
            .in("story_id", mine)
          for (const v of ((vs as unknown as { story_id: string }[]) ?? [])) {
            views.set(v.story_id, (views.get(v.story_id) ?? 0) + 1)
          }
        }
      }

      setStories(
        rows.map((r) => {
          const a = r.profile_id ? authors.get(r.profile_id) : undefined
          return {
            id: r.id,
            imageUrl: r.image_url,
            caption: r.caption,
            createdAt: r.created_at,
            expiresAt: r.expires_at,
            authorUserId: r.user_id,
            authorName: a ? `${a.first_name || ""} ${a.last_name || ""}`.trim() || "Membre EmiID" : "Membre EmiID",
            authorAvatar: a?.avatar_url ?? null,
            authorSlug: a?.slug ?? null,
            authorRole: a?.role ?? null,
            authorVerified: !!a?.is_verified,
            viewsCount: views.get(r.id) ?? 0,
            isMine: r.user_id === uid,
          }
        }),
      )
    } finally {
      setLoading(false)
    }
  }, [supabase, limit])

  useEffect(() => {
    void load()
  }, [load])

  /** Publie une photo du jour. Renvoie true si la story est en ligne. */
  const publish = useCallback(async (file: File, caption?: string): Promise<boolean> => {
    setPublishing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user?.id
      if (!uid) return false

      // profile_id : rattache la story au profil public (lecture par la RLS).
      const { data: prof } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle()

      const compressed = await compressImage(file, { maxSize: STORY_MAX_SIZE })
      const ext = compressed.name.split(".").pop() || "jpg"
      // Le chemin DOIT commencer par l'UID : la politique de stockage l'exige.
      const path = `${uid}/${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage.from("stories").upload(path, compressed, { upsert: false })
      if (upErr) return false

      const { data: { publicUrl } } = supabase.storage.from("stories").getPublicUrl(path)

      const { error: insErr } = await (supabase as unknown as StoryClient).from("profile_stories").insert({
        user_id: uid,
        profile_id: (prof as { id?: string } | null)?.id ?? null,
        image_url: publicUrl,
        caption: caption?.trim() || null,
      })
      if (insErr) return false

      await load()
      return true
    } finally {
      setPublishing(false)
    }
  }, [supabase, load])

  const remove = useCallback(async (storyId: string): Promise<boolean> => {
    const { error } = await (supabase as unknown as StoryClient).from("profile_stories").delete().eq("id", storyId)
    if (error) return false
    await load()
    return true
  }, [supabase, load])

  /** Enregistre la vue (silencieux : une vue perdue ne doit rien casser). */
  const markViewed = useCallback(async (storyId: string) => {
    if (!currentUserId) return
    await (supabase as unknown as StoryClient)
      .from("story_views")
      .upsert({ story_id: storyId, viewer_id: currentUserId }, { onConflict: "story_id,viewer_id" })
  }, [supabase, currentUserId])

  return { stories, loading, available, publishing, currentUserId, publish, remove, markViewed, reload: load }
}

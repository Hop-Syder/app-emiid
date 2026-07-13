/**
 * @description Source de vérité unique + CACHE de l'état Suivre/Abonné côté client.
 *
 * - 1re lecture : requête `user_follows` (RLS : le follower ne voit que ses lignes).
 * - Ensuite : servi depuis un cache mémoire + `sessionStorage` → réponses instantanées,
 *   zéro requête réseau à chaque page.
 * - Synchronisé en direct par l'événement global `emiid-follow-toggle` (suivre/désuivre
 *   depuis n'importe quelle carte met le cache à jour sans refetch).
 *
 * Signatures publiques inchangées : tous les appelants existants en bénéficient.
 */

import { createClient } from "@/lib/supabase/client"

const SS_KEY = "emiid_follows_v1"

let cachedIds: Set<string> | null = null
let cachedUserId: string | null = null
let inflight: Promise<Set<string> | null> | null = null
let listenerAttached = false

function persist() {
  if (typeof window === "undefined" || !cachedUserId || !cachedIds) return
  try {
    sessionStorage.setItem(SS_KEY, JSON.stringify({ userId: cachedUserId, ids: [...cachedIds] }))
  } catch { /* quota / mode privé : on ignore, le cache mémoire suffit */ }
}

function hydrateFromSession(userId: string) {
  if (typeof window === "undefined") return
  try {
    const raw = sessionStorage.getItem(SS_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as { userId: string; ids: string[] }
    if (parsed.userId === userId && Array.isArray(parsed.ids)) {
      cachedIds = new Set(parsed.ids)
      cachedUserId = userId
    }
  } catch { /* ignore */ }
}

/** Attache (une seule fois) l'écouteur qui garde le cache synchronisé. */
function attachListener() {
  if (listenerAttached || typeof window === "undefined") return
  listenerAttached = true
  window.addEventListener("emiid-follow-toggle", (e) => {
    const { userId, followed } = (e as CustomEvent).detail || {}
    if (!userId || !cachedIds) return
    if (followed) cachedIds.add(userId)
    else cachedIds.delete(userId)
    persist()
  })
}

/**
 * IDs (user_id) des profils suivis par l'utilisateur connecté.
 * Renvoie null si non connecté / erreur (l'appelant garde alors son état par défaut).
 * @param force  ignore le cache et relit la base.
 */
export async function fetchFollowedIds(force = false): Promise<Set<string> | null> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { cachedIds = null; cachedUserId = null; return null }
    const uid = session.user.id
    attachListener()

    if (!force) {
      if (cachedIds && cachedUserId === uid) return new Set(cachedIds)
      // Cache mémoire vide (ex. nouvelle navigation) → tente le sessionStorage.
      if (cachedUserId !== uid) hydrateFromSession(uid)
      if (cachedIds && cachedUserId === uid) return new Set(cachedIds)
    }

    // Dédoublonne les requêtes concurrentes (plusieurs cartes montent en même temps).
    if (!force && inflight) return inflight

    inflight = (async () => {
      try {
        const { data, error } = await supabase
          .from("user_follows")
          .select("following_id")
          .eq("follower_id", uid)
        if (error) return cachedIds ? new Set(cachedIds) : null
        cachedIds = new Set((data || []).map((f) => f.following_id as string))
        cachedUserId = uid
        persist()
        return new Set(cachedIds)
      } finally {
        inflight = null
      }
    })()
    return inflight
  } catch {
    return cachedIds ? new Set(cachedIds) : null
  }
}

/**
 * Vérifie si l'utilisateur connecté suit un profil donné (user_id).
 * Utilise le cache → plus de requête par profil.
 */
export async function isFollowingUser(targetUserId: string): Promise<boolean> {
  const ids = await fetchFollowedIds()
  return ids ? ids.has(targetUserId) : false
}

/** Réinitialise le cache (ex. à la déconnexion). */
export function clearFollowsCache() {
  cachedIds = null
  cachedUserId = null
  if (typeof window !== "undefined") {
    try { sessionStorage.removeItem(SS_KEY) } catch { /* ignore */ }
  }
}

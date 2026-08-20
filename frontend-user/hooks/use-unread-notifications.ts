/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook léger : compte les notifications non lues de l'utilisateur
 *              courant et se rafraîchit en temps réel (sans charger la liste).
 *
 *              Souscription Realtime PARTAGÉE (singleton + compteur de refs) :
 *              plusieurs composants consomment ce hook (dock, sidebar, CTA…),
 *              or le client @supabase/ssr est un singleton. Ouvrir un canal par
 *              consommateur sur le même topic provoquait l'erreur
 *              « cannot add postgres_changes callbacks after subscribe() ».
 *              On garantit donc UN seul canal pour tout le monde.
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

// ── État partagé (module-level) ────────────────────────────────────────────
let currentCount = 0
let channel: RealtimeChannel | null = null
let refCount = 0
let initializing = false
const listeners = new Set<(n: number) => void>()

function emit() {
  for (const listener of listeners) listener(currentCount)
}

/** Ouvre la souscription unique (idempotent : ne fait rien si déjà en place). */
async function ensureSubscription() {
  if (channel || initializing) return
  initializing = true

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Plus aucun abonné entre-temps, ou pas connecté → on annule proprement.
  if (!user || refCount <= 0) {
    initializing = false
    return
  }

  const refresh = async () => {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)
    currentCount = count ?? 0
    emit()
  }

  await refresh()

  // .on() AVANT .subscribe() (obligatoire pour postgres_changes).
  channel = supabase
    .channel(`unread-notifs-${user.id}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
      () => { void refresh() }
    )
    .subscribe()

  initializing = false
}

/** Ferme la souscription quand plus aucun composant ne l'utilise. */
function teardown() {
  if (channel) {
    const supabase = createClient()
    void supabase.removeChannel(channel)
    channel = null
  }
  currentCount = 0
}

export function useUnreadNotifications(): number {
  const [unreadCount, setUnreadCount] = useState(currentCount)

  useEffect(() => {
    listeners.add(setUnreadCount)
    setUnreadCount(currentCount) // aligne le nouvel abonné sur la valeur courante
    refCount += 1
    void ensureSubscription()

    return () => {
      listeners.delete(setUnreadCount)
      refCount -= 1
      if (refCount <= 0) {
        refCount = 0
        teardown()
      }
    }
  }, [])

  return unreadCount
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook léger : compte les notifications non lues de l'utilisateur
 *              courant et se rafraîchit en temps réel (sans charger la liste).
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function useUnreadNotifications(): number {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!isMounted || !user) return

      const refresh = async () => {
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false)
        if (isMounted) setUnreadCount(count ?? 0)
      }

      await refresh()

      channel = supabase
        .channel(`unread-notifs-${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          () => { void refresh() }
        )
        .subscribe()
    }

    void init()

    return () => {
      isMounted = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  return unreadCount
}

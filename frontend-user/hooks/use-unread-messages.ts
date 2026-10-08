/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Nombre de messages non lus (reçus, pas encore lus) dans toutes
 *              les discussions de l'utilisateur — badge de l'onglet Messagerie.
 *              La RLS de `messages` limite déjà la lecture aux conversations
 *              dont l'utilisateur est membre. Rafraîchi au retour sur l'onglet,
 *              au changement de page et toutes les 30 s.
 * @created 2026-10-09
 */

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const REFRESH_MS = 30_000

export function useUnreadMessages(): number {
  const supabase = useMemo(() => createClient(), [])
  const pathname = usePathname()
  const [count, setCount] = useState(0)

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const uid = session?.user?.id
    if (!uid) return setCount(0)
    const { count: n, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .neq("sender_id", uid)
      .eq("is_read", false)
    if (!error) setCount(n ?? 0)
  }, [supabase])

  useEffect(() => {
    void refresh()
  }, [refresh, pathname])

  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && void refresh()
    document.addEventListener("visibilitychange", onVisible)
    const timer = setInterval(() => void refresh(), REFRESH_MS)
    return () => {
      document.removeEventListener("visibilitychange", onVisible)
      clearInterval(timer)
    }
  }, [refresh])

  return count
}

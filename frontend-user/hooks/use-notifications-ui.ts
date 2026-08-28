/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook personnalisé pour piloter la logique de l'UI du centre de notifications (filtres, infinite scroll, tris).
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/hooks/use-notifications"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export type FilterType = "all" | "message" | "follow" | "view" | "system"

export function useNotificationsUI() {
  const router = useRouter()
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
  } = useNotifications()

  const [activeTab, setActiveTab] = useState<FilterType>("all")
  const [userChecked, setUserChecked] = useState(false)
  const supabase = useMemo(() => createClient(), [])
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Synchronisation de l'onglet actif avec les paramètres d'URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get("tab") as FilterType | null
      if (tabParam && ["all", "message", "follow", "view", "system"].includes(tabParam)) {
        setActiveTab(tabParam)
      }
    }
  }, [])

  const handleTabChange = useCallback((val: string) => {
    const newTab = val as FilterType
    setActiveTab(newTab)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (newTab === "all") {
        url.searchParams.delete("tab")
      } else {
        url.searchParams.set("tab", newTab)
      }
      window.history.replaceState({}, "", url.toString())
    }
  }, [])

  // Vérification de session utilisateur
  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return
      if (!user) {
        toast.error("Veuillez vous connecter pour accéder à vos notifications.")
        router.push("/login")
      } else {
        setUserChecked(true)
      }
    }).catch(() => {
      if (active) {
        router.push("/login")
      }
    })
    return () => {
      active = false
    }
  }, [supabase, router])

  useEffect(() => {
    if (error) {
      toast.error("Impossible de charger les notifications.")
    }
  }, [error])

  // Observer pour l'infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries
    if (target.isIntersecting && hasMore && !isLoadingMore && activeTab === "all") {
      loadMore()
    }
  }, [hasMore, isLoadingMore, loadMore, activeTab])

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [handleObserver])

  // Filtrage des notifications selon l'onglet actif
  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return notifications
    return notifications.filter((notif) => {
      if (activeTab === "system") {
        return notif.type === "system" || notif.type === "security"
      }
      return notif.type === activeTab
    })
  }, [notifications, activeTab])

  // Groupement des notifications par période (Aujourd'hui, Hier, Plus ancien)
  const groupedNotifications = useMemo(() => {
    const today: typeof notifications = []
    const yesterday: typeof notifications = []
    const older: typeof notifications = []

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000

    filteredNotifications.forEach((notif) => {
      const notifTime = new Date(notif.created_at).getTime()
      if (notifTime >= todayStart) {
        today.push(notif)
      } else if (notifTime >= yesterdayStart) {
        yesterday.push(notif)
      } else {
        older.push(notif)
      }
    })

    return { today, yesterday, older }
  }, [filteredNotifications])

  const handleMarkAllAsRead = useCallback(async () => {
    if (unreadCount === 0) {
      toast.info("Toutes les notifications sont déjà lues.")
      return
    }
    try {
      await markAllAsRead()
      toast.success("Toutes les notifications ont été marquées comme lues.")
    } catch {
      toast.error("Erreur lors de la mise à jour des notifications.")
    }
  }, [unreadCount, markAllAsRead])

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await markAsRead(id)
    } catch {
      toast.error("Impossible de marquer cette notification comme lue.")
    }
  }, [markAsRead])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteNotification(id)
      toast.success("Notification supprimée.")
    } catch {
      toast.error("Impossible de supprimer la notification.")
    }
  }, [deleteNotification])

  return {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    activeTab,
    userChecked,
    loadMoreRef,
    filteredNotifications,
    groupedNotifications,
    handleTabChange,
    handleMarkAllAsRead,
    handleMarkAsRead,
    handleDelete,
  }
}

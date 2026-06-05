/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de centre de notifications intelligent avec Bento Grid, Realtime et Infinite Scroll
 * @created 2026-06-02
 * @updated 2026-06-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationItem } from "@/components/notifications/notification-item"
import { NotificationSettings } from "@/components/notifications/notification-settings"
import { Bell, CheckCheck, Inbox, Loader2 } from "lucide-react"
import { Preloader } from "@/components/Preloader"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

type FilterType = "all" | "message" | "follow" | "view" | "system"

export default function NotificationsPage() {
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
  
  // Ref pour l'infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Vérification de session utilisateur
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        toast.error("Veuillez vous connecter pour accéder à vos notifications.")
        window.location.href = "/login"
      } else {
        setUserChecked(true)
      }
    })
  }, [supabase])

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

  // Groupement des notifications par période (Aujourd&apos;hui, Hier, Plus ancien)
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

  const handleMarkAllAsRead = async () => {
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
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id)
    } catch {
      toast.error("Impossible de marquer cette notification comme lue.")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      toast.success("Notification supprimée.")
    } catch {
      toast.error("Impossible de supprimer la notification.")
    }
  }

  if (isLoading || !userChecked) {
    return (
      <Preloader 
        text="Chargement de vos alertes..." 
        subtext="Synchronisation avec le flux de notifications EmiID"
        minHeight="min-h-[70vh]" 
      />
    )
  }

  const totalFilteredCount = filteredNotifications.length

  return (
    <div className="flex-1 w-full min-h-screen bg-slate-50/50 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        
        {/* HEADER BENTO */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-slate-200/60 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="p-4 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[1.75rem] text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2 md:gap-3">
                Centre d&apos;Alertes
                {unreadCount > 0 && (
                  <span className="text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 border border-blue-200/50 whitespace-nowrap">
                    {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                  </span>
                )}
              </h1>
              <p className="text-slate-500 text-xs md:text-sm font-medium mt-1 leading-relaxed max-w-lg">
                Gérez vos notifications système, messages et l&apos;activité de votre réseau en temps réel.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="w-full md:w-auto flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-700 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <CheckCheck className="w-4 h-4 text-blue-500" />
            Tout marquer comme lu
          </button>
        </div>

        {/* TABS / FILTRES */}
        <div className="flex justify-start md:justify-center -mx-4 md:mx-0">
          <Tabs 
            value={activeTab} 
            onValueChange={(val) => setActiveTab(val as FilterType)}
            className="w-full md:w-auto"
          >
            <TabsList className="h-auto md:h-14 p-1.5 px-4 md:px-1.5 bg-white/80 md:bg-white/80 backdrop-blur-md rounded-2xl md:border md:border-slate-200/50 w-full md:w-auto flex overflow-x-auto gap-2 no-scrollbar bg-transparent border-0 snap-x">
              <TabsTrigger 
                value="all" 
                className="flex-shrink-0 px-4 md:px-5 py-2.5 md:py-0 rounded-xl font-bold text-slate-500 hover:text-slate-900 text-[11px] md:text-xs capitalize data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all duration-300 md:h-10 border border-slate-200/50 md:border-0 snap-start bg-white md:bg-transparent"
              >
                Tout ({notifications.length})
              </TabsTrigger>
              <TabsTrigger 
                value="message" 
                className="flex-shrink-0 px-4 md:px-5 py-2.5 md:py-0 rounded-xl font-bold text-slate-500 hover:text-slate-900 text-[11px] md:text-xs capitalize data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all duration-300 md:h-10 border border-slate-200/50 md:border-0 snap-start bg-white md:bg-transparent"
              >
                Messages ({notifications.filter(n => n.type === "message").length})
              </TabsTrigger>
              <TabsTrigger 
                value="follow" 
                className="flex-shrink-0 px-4 md:px-5 py-2.5 md:py-0 rounded-xl font-bold text-slate-500 hover:text-slate-900 text-[11px] md:text-xs capitalize data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all duration-300 md:h-10 border border-slate-200/50 md:border-0 snap-start bg-white md:bg-transparent"
              >
                Suivis ({notifications.filter(n => n.type === "follow").length})
              </TabsTrigger>
              <TabsTrigger 
                value="view" 
                className="flex-shrink-0 px-4 md:px-5 py-2.5 md:py-0 rounded-xl font-bold text-slate-500 hover:text-slate-900 text-[11px] md:text-xs capitalize data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all duration-300 md:h-10 border border-slate-200/50 md:border-0 snap-start bg-white md:bg-transparent"
              >
                Visites ({notifications.filter(n => n.type === "view").length})
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className="flex-shrink-0 px-4 md:px-5 py-2.5 md:py-0 rounded-xl font-bold text-slate-500 hover:text-slate-900 text-[11px] md:text-xs capitalize data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all duration-300 md:h-10 border border-slate-200/50 md:border-0 snap-start bg-white md:bg-transparent"
              >
                Système ({notifications.filter(n => n.type === "system" || n.type === "security").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* BENTO GRID (ASYNCHRONE) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLONNE GAUCHE : ALERTES (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {totalFilteredCount > 0 ? (
              <div className="space-y-8">
                {/* Aujourd&apos;hui */}
                {groupedNotifications.today.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-2">Aujourd&apos;hui</h3>
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {groupedNotifications.today.map((notif) => (
                          <NotificationItem
                            key={notif.id}
                            notification={notif}
                            onMarkAsRead={handleMarkAsRead}
                            onDelete={handleDelete}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Hier */}
                {groupedNotifications.yesterday.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-2">Hier</h3>
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {groupedNotifications.yesterday.map((notif) => (
                          <NotificationItem
                            key={notif.id}
                            notification={notif}
                            onMarkAsRead={handleMarkAsRead}
                            onDelete={handleDelete}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Plus ancien */}
                {groupedNotifications.older.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-2">Plus ancien</h3>
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {groupedNotifications.older.map((notif) => (
                          <NotificationItem
                            key={notif.id}
                            notification={notif}
                            onMarkAsRead={handleMarkAsRead}
                            onDelete={handleDelete}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Trigger pour infinite scroll */}
                {activeTab === "all" && (
                  <div ref={loadMoreRef} className="py-4 flex justify-center">
                    {isLoadingMore && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-medium">Chargement...</span>
                      </div>
                    )}
                    {!hasMore && notifications.length > 0 && (
                      <p className="text-xs text-slate-400 font-medium">
                        {"Vous avez tout vu !"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm text-center"
              >
                <div className="p-6 rounded-full bg-slate-100 text-slate-400 mb-6">
                  <Inbox className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">
                  Aucune alerte
                </h3>
                <p className="text-slate-500 text-sm font-medium max-w-sm">
                  {activeTab === "all" 
                    ? "Vous n'avez reçu aucune notification pour le moment." 
                    : `Aucune notification de type "${activeTab}" disponible.`}
                </p>
              </motion.div>
            )}
          </div>

          {/* COLONNE DROITE : PRÉFÉRENCES (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <NotificationSettings />
          </div>

        </div>

      </div>
    </div>
  )
}

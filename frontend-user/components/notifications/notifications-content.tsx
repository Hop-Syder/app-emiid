/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Centre de notifications intelligent, épuré de sa logique d'état et d'effets.
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useNotificationsUI } from "@/hooks/use-notifications-ui"
import { NotificationItem } from "@/components/notifications/notification-item"
import { NotificationSettings } from "@/components/notifications/notification-settings"
import { Bell, CheckCheck, Inbox, Loader2 } from "lucide-react"
import { Preloader } from "@/components/Preloader"
import { motion, AnimatePresence } from "framer-motion"

export function NotificationsContent() {
  const {
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
  } = useNotificationsUI()

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
    <div className="flex-1 w-full min-h-screen bg-muted/50 pb-24 md:pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        
        {/* HEADER BENTO */}
        <div className="bg-card/80 backdrop-blur-md rounded-[2.5rem] border border-border/60 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="p-4 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[1.75rem] text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-foreground tracking-tight flex flex-wrap items-center gap-2 md:gap-3">
                Centre d&apos;Alertes
                {unreadCount > 0 && (
                  <span className="text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 border border-blue-200/50 dark:border-blue-800/50 whitespace-nowrap">
                    {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm font-medium mt-1 leading-relaxed max-w-lg">
                Gérez vos notifications système, messages et l&apos;activité de votre réseau en temps réel.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="w-full md:w-auto flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-card border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <CheckCheck className="w-4 h-4 text-blue-500" />
            Tout marquer comme lu
          </button>
        </div>

        {/* TABS / FILTRES */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max md:min-w-0 md:flex-wrap md:justify-center">
            {([
              { value: "all",     label: `Tout (${notifications.length})` },
              { value: "message", label: `Messages (${notifications.filter(n => n.type === "message").length})` },
              { value: "follow",  label: `Suivis (${notifications.filter(n => n.type === "follow").length})` },
              { value: "view",    label: `Visites (${notifications.filter(n => n.type === "view").length})` },
              { value: "system",  label: `Système (${notifications.filter(n => n.type === "system" || n.type === "security").length})` },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleTabChange(value)}
                className={`flex-shrink-0 h-10 px-5 rounded-xl font-bold text-xs transition-all whitespace-nowrap border ${
                  activeTab === value
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* BENTO GRID (ASYNCHRONE) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLONNE GAUCHE : ALERTES (8 cols) */}
          <div className="lg:col-span-8 min-w-0 space-y-8">
            {totalFilteredCount > 0 ? (
              <div className="space-y-8">
                {/* Aujourd'hui */}
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
                      <div className="flex items-center gap-2 text-muted-foreground">
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
                className="flex flex-col items-center justify-center py-20 bg-card/80 backdrop-blur-md rounded-[2.5rem] border border-border/60 p-8 shadow-sm text-center"
              >
                <div className="p-6 rounded-full bg-muted text-slate-400 mb-6">
                  <Inbox className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
                  Aucune alerte
                </h3>
                <p className="text-muted-foreground text-sm font-medium max-w-sm">
                  {activeTab === "all" 
                    ? "Vous n'avez reçu aucune notification pour le moment." 
                    : `Aucune notification de type "${activeTab}" disponible.`}
                </p>
              </motion.div>
            )}
          </div>

          {/* COLONNE DROITE : PRÉFÉRENCES (4 cols) */}
          <div className="lg:col-span-4 min-w-0 space-y-6">
            <NotificationSettings />
          </div>

        </div>

      </div>
    </div>
  )
}

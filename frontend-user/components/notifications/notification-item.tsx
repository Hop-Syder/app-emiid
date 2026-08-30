/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Rendu d'une alerte avec avatar sender, lien profil et actions contextuelles
 * @created 2026-06-02
 * @updated 2026-06-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion } from "framer-motion"
import { Eye, UserPlus, MessageSquare, ShieldAlert, Check, Trash2, Bell, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface NotificationSender {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  slug: string | null
}

export interface NotificationData {
  id: string
  type: string // 'message' | 'view' | 'follow' | 'system' | 'security'
  title: string
  content: string
  link?: string | null
  is_read: boolean
  created_at: string
  sender_id?: string | null
  sender?: NotificationSender | null
}

interface NotificationItemProps {
  notification: NotificationData
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  
  // Associer un style graphique et une icône à chaque type de notification
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "view":
        return {
          icon: Eye,
          color: "text-blue-500",
          bg: "bg-blue-100/70 border-blue-200/50",
          glow: "group-hover:shadow-blue-500/10",
        }
      case "follow":
        return {
          icon: UserPlus,
          color: "text-emerald-500",
          bg: "bg-emerald-100/70 border-emerald-200/50",
          glow: "group-hover:shadow-emerald-500/10",
        }
      case "message":
        return {
          icon: MessageSquare,
          color: "text-purple-500",
          bg: "bg-purple-100/70 border-purple-200/50",
          glow: "group-hover:shadow-purple-500/10",
        }
      case "security":
      case "system":
        return {
          icon: ShieldAlert,
          color: "text-rose-500",
          bg: "bg-rose-100/70 border-rose-200/50",
          glow: "group-hover:shadow-rose-500/10",
        }
      default:
        return {
          icon: Bell,
          color: "text-muted-foreground",
          bg: "bg-muted/70 border-border/50",
          glow: "group-hover:shadow-slate-500/10",
        }
    }
  }

  const config = getTypeConfig(notification.type)
  const Icon = config.icon

  // Formater la date en relatif (ex: "il y a 2 heures")
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: fr,
  })

  // Générer le nom complet du sender
  const senderName = notification.sender 
    ? `${notification.sender.first_name || ''} ${notification.sender.last_name || ''}`.trim() 
    : null

  // URL du profil sender
  const senderProfileUrl = notification.sender?.slug 
    ? `/u/${notification.sender.slug}` 
    : null

  // Avatar du sender ou fallback vers icône
  const hasSenderAvatar = notification.sender?.avatar_url

  // Élément interactif (Lien ou Div)
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (notification.link) {
      return (
        <Link 
          href={notification.link}
          className="block focus:outline-none"
        >
          {children}
        </Link>
      )
    }
    return <div className="block">{children}</div>
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "group relative rounded-[2rem] border p-5 md:p-6 transition-all duration-300 flex items-start gap-4 shadow-sm",
        notification.is_read 
          ? "bg-card/40 border-slate-150/70 text-muted-foreground" 
          : "bg-card/90 border-border shadow-md shadow-slate-100/40 text-foreground",
        config.glow
      )}
    >
      {/* Badge indicateur non-lu */}
      {!notification.is_read && (
        <div className="absolute top-6 right-6 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </div>
      )}

      {/* Avatar sender ou Icône de type */}
      {hasSenderAvatar ? (
        <div className="relative shrink-0">
          {senderProfileUrl ? (
            <Link href={senderProfileUrl} className="block" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={notification.sender!.avatar_url!}
                  alt={senderName || "Avatar"}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Badge du type en overlay */}
              <div className={cn("absolute -bottom-1 -right-1 p-1.5 rounded-xl border shadow-sm", config.bg)}>
                <Icon className={cn("w-3 h-3", config.color)} />
              </div>
            </Link>
          ) : (
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md">
              <Image
                src={notification.sender!.avatar_url!}
                alt={senderName || "Avatar"}
                fill
                className="object-cover"
              />
              <div className={cn("absolute -bottom-1 -right-1 p-1.5 rounded-xl border shadow-sm", config.bg)}>
                <Icon className={cn("w-3 h-3", config.color)} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={cn("p-3 rounded-2xl border shrink-0 transition-transform duration-300 group-hover:scale-105", config.bg)}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
      )}

      {/* Contenu principal de la notification */}
      <div className="flex-1 min-w-0 pr-4">
        <CardWrapper>
          <div className="flex items-center gap-1.5 cursor-pointer">
            <h4 className={cn("font-bold text-sm sm:text-base leading-snug truncate", !notification.is_read && "text-foreground")}>
              {notification.title}
            </h4>
            {notification.link && (
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1 whitespace-pre-line">
            {notification.content}
          </p>
        </CardWrapper>
        
        {/* Sender name avec lien + temps */}
        <div className="flex items-center gap-2 mt-3">
          {senderName && senderProfileUrl ? (
            <Link 
              href={senderProfileUrl}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              {senderName}
            </Link>
          ) : senderName ? (
            <span className="text-[11px] font-bold text-muted-foreground">{senderName}</span>
          ) : null}
          {senderName && <span className="text-slate-300">{"•"}</span>}
          <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            {timeAgo}
          </span>
        </div>
      </div>

      {/* Boutons d'action rapides */}
      <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0 pt-0.5">
        {!notification.is_read && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMarkAsRead(notification.id)
            }}
            title="Marquer comme lu"
            className="p-2 rounded-xl bg-muted text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors border border-border shadow-sm active:scale-95"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(notification.id)
          }}
          title="Supprimer"
          className="p-2 rounded-xl bg-muted text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-colors border border-border shadow-sm active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

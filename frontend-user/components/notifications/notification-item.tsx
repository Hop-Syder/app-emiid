/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Rendu d'une alerte avec style Glassmorphic, boutons d'action et redirection contextuelle
 * @created 2026-06-02
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion } from "framer-motion"
import { Eye, UserPlus, MessageSquare, ShieldAlert, Check, Trash2, Bell, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface NotificationData {
  id: string
  type: string // 'message' | 'view' | 'follow' | 'system' | 'security'
  title: string
  content: string
  link?: string
  is_read: boolean
  created_at: string
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
          color: "text-slate-500",
          bg: "bg-slate-100/70 border-slate-200/50",
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
          ? "bg-white/40 border-slate-150/70 text-slate-600" 
          : "bg-white/90 border-slate-200 shadow-md shadow-slate-100/40 text-slate-800",
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

      {/* Icône de gauche */}
      <div className={cn("p-3 rounded-2xl border shrink-0 transition-transform duration-300 group-hover:scale-105", config.bg)}>
        <Icon className={cn("w-5 h-5", config.color)} />
      </div>

      {/* Contenu principal de la notification */}
      <div className="flex-1 min-w-0 pr-4">
        <CardWrapper>
          <div className="flex items-center gap-1.5 cursor-pointer">
            <h4 className={cn("font-bold text-sm sm:text-base leading-snug truncate", !notification.is_read && "text-slate-900")}>
              {notification.title}
            </h4>
            {notification.link && (
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-1 whitespace-pre-line">
            {notification.content}
          </p>
        </CardWrapper>
        
        <span className="text-[11px] font-semibold tracking-wide text-slate-450 uppercase mt-3 inline-block">
          {timeAgo}
        </span>
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
            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors border border-slate-100 shadow-sm active:scale-95"
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
          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-colors border border-slate-100 shadow-sm active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

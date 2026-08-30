"use client"

import { useNotifications, type Notification } from "@/hooks/use-notifications"
import Link from "next/link"
import Image from "next/image"
import { Bell, UserPlus, MessageCircle, Eye, CheckCircle, ArrowRight, Loader2 } from "lucide-react"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

function notifIcon(type: string) {
  switch (type) {
    case "follow": return UserPlus
    case "message": return MessageCircle
    case "profile_view": return Eye
    case "gallery_approved": return CheckCircle
    default: return Bell
  }
}

function notifColors(type: string) {
  switch (type) {
    case "follow": return { icon: "text-[#013ff4]", bg: "bg-[#013ff4]/10", ring: "ring-[#013ff4]/20" }
    case "message": return { icon: "text-[#03b3f8]", bg: "bg-[#03b3f8]/10", ring: "ring-[#03b3f8]/20" }
    case "profile_view": return { icon: "text-emerald-500", bg: "bg-emerald-50", ring: "ring-emerald-100" }
    case "gallery_approved": return { icon: "text-amber-500", bg: "bg-amber-50", ring: "ring-amber-100" }
    default: return { icon: "text-slate-500", bg: "bg-slate-100", ring: "ring-slate-200" }
  }
}

function NotifRow({ notif }: { notif: Notification }) {
  const Icon = notifIcon(notif.type)
  const colors = notifColors(notif.type)
  const senderName = notif.sender
    ? `${notif.sender.first_name || ""} ${notif.sender.last_name || ""}`.trim()
    : null

  const inner = (
    <div className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl transition-colors hover:bg-slate-50 cursor-pointer ${!notif.is_read ? "bg-[#013ff4]/[0.05]" : ""}`}>
      <div className="relative shrink-0">
        {notif.sender?.avatar_url ? (
          <>
            <Image
              src={notif.sender.avatar_url}
              alt={senderName || "Membre"}
              width={40}
              height={40}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center ${colors.bg} ring-2 ring-white`}>
              <Icon className={`w-2.5 h-2.5 ${colors.icon}`} />
            </div>
          </>
        ) : (
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm ${colors.bg} ring-1 ${colors.ring}`}>
            <Icon className={`w-4 h-4 ${colors.icon}`} />
          </div>
        )}
        {!notif.is_read && (
          <span className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 bg-[#013ff4] rounded-full ring-2 ring-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{notif.title}</p>
        <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">{notif.content}</p>
      </div>

      <span className="text-[10px] sm:text-xs font-medium text-slate-400 shrink-0 tabular-nums">{timeAgo(notif.created_at)}</span>
    </div>
  )

  if (notif.link) return <Link href={notif.link}>{inner}</Link>
  return inner
}

export function InlineActivityFeed() {
  const { notifications, isLoading, unreadCount } = useNotifications()
  const recent = notifications.slice(0, 2)

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgb(15,23,42,0.05)] overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/20 shrink-0">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-tight truncate">Activité Récente</h3>
            {unreadCount > 0 && (
              <p className="text-[11px] sm:text-xs text-emerald-600 font-semibold leading-tight">
                {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <Link
          href="/notifications"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 group transition-colors shrink-0"
        >
          Tout voir
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Chargement...</span>
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-1">
            <Bell className="w-6 h-6 opacity-30" />
            <p className="text-sm font-medium">Aucune activité récente</p>
          </div>
        ) : (
          recent.map((notif) => (
            <NotifRow key={notif.id} notif={notif} />
          ))
        )}
      </div>
    </div>
  )
}

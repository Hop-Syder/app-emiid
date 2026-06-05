/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant d'affichage d'une conversation dans la liste latérale
 * @created 2026-05-11
 * @updated 2026-06-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Conversation } from './types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { CheckCheck, MoreVertical, Pin, Archive, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: (conv: Conversation) => void
  isOnline?: boolean
  onPin?: (convId: string) => void
  onArchive?: (convId: string) => void
  onDelete?: (convId: string) => void
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
  isOnline = false,
  onPin,
  onArchive,
  onDelete,
}) => {
  const [formattedDate, setFormattedDate] = React.useState<string>("")

  React.useEffect(() => {
    if (conversation.last_message_at) {
      const date = new Date(conversation.last_message_at)
      const isToday = new Date().toDateString() === date.toDateString()
      setFormattedDate(isToday ? format(date, 'HH:mm', { locale: fr }) : format(date, 'dd/MM', { locale: fr }))
    }
  }, [conversation.last_message_at])

  const p = conversation.other_participant
  const fullName = `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || 'Utilisateur'
  const initials = fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  const hasUnread = conversation.unread_count > 0

  return (
    <div className="relative group/conv w-full">
      <button
        onClick={() => onClick(conversation)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 pr-10 transition-all duration-200 rounded-xl border relative overflow-hidden group",
          isActive
            ? "bg-primary/8 border-primary/15 shadow-sm ring-1 ring-primary/10"
            : "bg-transparent border-transparent hover:bg-slate-50/80 hover:border-slate-100"
        )}
      >
        {/* Active accent bar */}
        {isActive && (
          <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-full" />
        )}

        {/* Avatar avec indicateur en ligne */}
        <div className="relative shrink-0">
          <Avatar className={cn(
            "h-11 w-11 border-2 transition-all duration-200",
            isActive ? "border-primary/20 shadow-sm" : "border-white shadow-sm group-hover:border-slate-200"
          )}>
            <AvatarImage src={p?.avatar_url || ''} alt={fullName} />
            <AvatarFallback className={cn(
              "font-bold text-sm",
              isActive
                ? "bg-primary/15 text-primary"
                : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600"
            )}>
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Indicateur online/offline */}
          <span className={cn(
            "absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full shadow-sm transition-colors",
            isOnline ? "bg-emerald-500" : "bg-slate-300"
          )} />
        </div>

        {/* Texte */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex justify-between items-baseline mb-0.5">
            <h3 className={cn(
              "text-sm truncate leading-snug",
              hasUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"
            )}>
              {fullName}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {conversation.isPinned && (
                <Pin className="h-3.5 w-3.5 text-primary rotate-45 shrink-0" />
              )}
              {formattedDate && (
                <span className={cn(
                  "text-[10px] shrink-0",
                  hasUnread ? "text-primary font-semibold" : "text-slate-400"
                )}>
                  {formattedDate}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <p className={cn(
              "text-xs truncate flex items-center gap-1",
              hasUnread ? "text-slate-700 font-medium" : "text-slate-400 font-normal"
            )}>
              {!hasUnread && <CheckCheck className="h-3 w-3 text-primary/60 shrink-0" />}
              {conversation.last_message || "Démarrer la discussion..."}
            </p>
            {hasUnread && (
              <span className={cn(
                "shrink-0 min-w-[18px] h-[18px] flex items-center justify-center",
                "bg-primary text-white text-[10px] font-bold rounded-full px-1 shadow-sm",
                "animate-in zoom-in duration-200"
              )}>
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Menu Kebab Optionnel */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/conv:opacity-100 focus-within:opacity-100 transition-opacity z-30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/50"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl border-slate-100">
            <DropdownMenuItem
              className="text-slate-700 focus:text-primary rounded-lg flex items-center gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onPin?.(conversation.id)
              }}
            >
              <Pin className="h-3.5 w-3.5 rotate-45 text-slate-500" />
              {conversation.isPinned ? "Désépingler" : "Épingler"}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              className="text-slate-700 focus:text-primary rounded-lg flex items-center gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onArchive?.(conversation.id)
              }}
            >
              <Archive className="h-3.5 w-3.5 text-slate-500" />
              {conversation.isArchived ? "Désarchiver" : "Archiver"}
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(conversation.id)
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

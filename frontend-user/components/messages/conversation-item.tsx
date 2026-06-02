/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant d'affichage d'une conversation dans la liste latérale
 * @created 2026-05-11
 * @updated 2026-06-02
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Conversation } from './types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { CheckCheck } from 'lucide-react'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: (conv: Conversation) => void
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
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
    <button
      onClick={() => onClick(conversation)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 rounded-xl border relative overflow-hidden group",
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
        {/* Indicateur online */}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
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
          {formattedDate && (
            <span className={cn(
              "text-[10px] ml-2 shrink-0",
              hasUnread ? "text-primary font-semibold" : "text-slate-400"
            )}>
              {formattedDate}
            </span>
          )}
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
  )
}

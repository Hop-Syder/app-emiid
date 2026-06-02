/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant d'affichage d'une conversation dans la liste latérale
 * @created 2026-05-11
*/

import React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Conversation } from './types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
  const initials = fullName.substring(0, 2).toUpperCase()

  return (
    <button
      onClick={() => onClick(conversation)}
      className={cn(
        "w-full flex items-center gap-3 p-3.5 transition-all duration-300 rounded-2xl border mb-1",
        isActive 
          ? "bg-white shadow-md border-primary/20 ring-1 ring-primary/10" 
          : "bg-transparent border-transparent hover:bg-white/60 hover:shadow-sm hover:border-white/50"
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-2 ring-transparent transition-all group-hover:ring-primary/20">
          <AvatarImage src={p?.avatar_url || ''} alt={fullName} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {conversation.unread_count > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-br from-red-500 to-rose-600 text-white border-2 border-white shadow-sm animate-in zoom-in">
            {conversation.unread_count}
          </Badge>
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className={cn(
            "text-sm font-semibold truncate",
            conversation.unread_count > 0 ? "text-slate-900" : "text-slate-700"
          )}>
            {fullName}
          </h3>
          {formattedDate && (
            <span className="text-[10px] text-slate-400">
              {formattedDate}
            </span>
          )}
        </div>
        <p className={cn(
          "text-xs truncate",
          conversation.unread_count > 0 ? "text-primary font-semibold" : "text-slate-500 font-medium"
        )}>
          {conversation.last_message || "Démarrer la discussion..."}
        </p>
      </div>
    </button>
  )
}

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
  const p = conversation.other_participant
  const fullName = `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || 'Utilisateur'
  const initials = fullName.substring(0, 2).toUpperCase()

  return (
    <button
      onClick={() => onClick(conversation)}
      className={cn(
        "w-full flex items-center gap-3 p-4 transition-all hover:bg-slate-50 border-l-4",
        isActive ? "bg-indigo-50/50 border-indigo-600" : "border-transparent"
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
          <AvatarImage src={p?.avatar_url || ''} alt={fullName} />
          <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {conversation.unread_count > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 border-2 border-white">
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
          {conversation.last_message_at && (
            <span className="text-[10px] text-slate-400">
              {format(new Date(conversation.last_message_at), 'HH:mm', { locale: fr })}
            </span>
          )}
        </div>
        <p className={cn(
          "text-xs truncate",
          conversation.unread_count > 0 ? "text-indigo-600 font-medium" : "text-slate-500"
        )}>
          {conversation.last_message || "Démarrer la discussion..."}
        </p>
      </div>
    </button>
  )
}

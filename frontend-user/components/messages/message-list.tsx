/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composants pour l'affichage des messages (Bulles et Liste)
 * @created 2026-05-11
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Message } from './types'
import { cn } from '@/lib/utils'
import { parseMessageContent } from '@/features/messages/messageContent'
import { FileText } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const parsed = parseMessageContent(message.content)
  const [formattedTime, setFormattedTime] = React.useState<string>("")

  React.useEffect(() => {
    const date = new Date(message.created_at)
    const isToday = new Date().toDateString() === date.toDateString()
    const timeStr = format(date, 'HH:mm', { locale: fr })
    const dateStr = format(date, 'dd MMM', { locale: fr })
    
    setFormattedTime(isToday ? timeStr : `${dateStr}, ${timeStr}`)
  }, [message.created_at])

  if (parsed.kind === "mediation") {
    return (
      <div className="flex justify-center my-6 px-4">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] px-4 py-2 rounded-full shadow-sm flex items-center gap-2 font-bold uppercase tracking-wider">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          {parsed.text}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex w-full mb-4 px-4", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[80%] md:max-w-[70%] rounded-2xl p-3 shadow-sm relative group transition-all",
        isOwn 
          ? "bg-indigo-600 text-white rounded-tr-none" 
          : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
      )}>
        {parsed.kind === "text" && (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {parsed.text}
          </p>
        )}

        {parsed.kind === "image" && (
          <div className="rounded-lg overflow-hidden border border-white/20">
            <img 
              src={parsed.url} 
              alt="Image partagée" 
              loading="lazy"
              className="max-w-full h-auto object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" 
            />
          </div>
        )}

        {parsed.kind === "file" && (
          <a 
            href={parsed.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all",
              isOwn ? "bg-white/10 border-white/20 hover:bg-white/20" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            )}
          >
            <div className={cn("p-2 rounded-lg", isOwn ? "bg-white/20" : "bg-indigo-100")}>
              <FileText className={cn("h-5 w-5", isOwn ? "text-white" : "text-indigo-600")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{parsed.name}</p>
              <p className="text-[10px] opacity-60 uppercase">Ouvrir le fichier</p>
            </div>
          </a>
        )}

        <div className={cn(
          "flex items-center gap-1 mt-1 text-[9px] font-medium opacity-70",
          isOwn ? "justify-end" : "justify-start"
        )}>
          {formattedTime || "--:--"}
          {isOwn && (
            <span className={cn("ml-1", message.is_read ? "text-blue-200" : "text-white/50")}>
              {message.is_read ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  scrollRef: React.RefObject<HTMLDivElement | null>
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, scrollRef }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 py-6 custom-scrollbar">
      {messages.length > 0 ? (
        messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            isOwn={msg.sender_id === currentUserId} 
          />
        ))
      ) : (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
          Aucun message dans cette discussion.
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  )
}

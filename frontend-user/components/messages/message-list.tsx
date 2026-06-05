/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composants pour l'affichage des messages (Bulles et Liste)
 * @created 2026-05-11
 * @updated 2026-06-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import React from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Message } from './types'
import { parseMessageContent } from '@/features/messages/messageContent'
import { FileText, Check, CheckCheck, Clock, AlertCircle, ArrowDown, MoreHorizontal, Edit2, Trash2, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

// Assistant pour obtenir le séparateur de date
const getDateSeparator = (date: Date): string => {
  if (isToday(date)) return "Aujourd'hui"
  if (isYesterday(date)) return "Hier"
  return format(date, 'd MMMM yyyy', { locale: fr })
}

// === COMPOSANTS DE PRÉSENTATION (BULLES) ===
interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  isGroupStart: boolean
  isGroupEnd: boolean
  onEdit?: (message: Message) => void
  onDelete?: (messageId: string) => void
  onResend?: (message: Message) => void
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn,
  isGroupStart,
  isGroupEnd,
  onEdit,
  onDelete,
  onResend,
}) => {
  const parsed = parseMessageContent(message.content)
  const [formattedTime, setFormattedTime] = React.useState<string>("")

  React.useEffect(() => {
    const date = new Date(message.created_at)
    setFormattedTime(format(date, 'HH:mm', { locale: fr }))
  }, [message.created_at])

  if (parsed.kind === "mediation") {
    return (
      <div className="flex justify-center my-6 px-4">
        <div className="bg-amber-50/90 border border-amber-200/60 text-amber-800 text-[11px] px-4 py-2 rounded-full shadow-sm flex items-center gap-2 font-bold uppercase tracking-wider backdrop-blur-md">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          {parsed.text}
        </div>
      </div>
    )
  }

  // Calcul dynamique des coins (Border Radius) pour le clustering style iMessage / WhatsApp
  const borderRadiusClass = isOwn
    ? cn(
        "rounded-2xl",
        isGroupStart && isGroupEnd && "rounded-tr-sm",
        isGroupStart && !isGroupEnd && "rounded-tr-sm rounded-br-md",
        !isGroupStart && !isGroupEnd && "rounded-r-md",
        !isGroupStart && isGroupEnd && "rounded-tr-md rounded-br-sm"
      )
    : cn(
        "rounded-2xl",
        isGroupStart && isGroupEnd && "rounded-tl-sm",
        isGroupStart && !isGroupEnd && "rounded-tl-sm rounded-bl-md",
        !isGroupStart && !isGroupEnd && "rounded-l-md",
        !isGroupStart && isGroupEnd && "rounded-tl-md rounded-bl-sm"
      )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex w-full px-4 group/bubble-container items-center",
        isOwn ? "justify-end" : "justify-start",
        isGroupEnd ? "mb-3" : "mb-1"
      )}
    >
      {/* Menu Kebab pour nos propres messages (seulement s'il n'y a pas d'erreur ou d'envoi en cours) */}
      {isOwn && (!message.status || message.status === 'sent') && (
        <div className="opacity-100 md:opacity-0 md:group-hover/bubble-container:opacity-100 focus-within:opacity-100 transition-opacity duration-200 mr-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 rounded-xl shadow-xl border-slate-100">
              {parsed.kind === "text" && (
                <DropdownMenuItem
                  className="text-slate-700 focus:text-primary rounded-lg flex items-center gap-2 cursor-pointer"
                  onClick={() => onEdit?.(message)}
                >
                  <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                  Modifier
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer"
                onClick={() => onDelete?.(message.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Bulle de message */}
      <div className={cn(
        "max-w-[85%] md:max-w-[70%] p-3 shadow-sm relative group transition-all",
        borderRadiusClass,
        isOwn 
          ? "bg-gradient-to-br from-primary to-indigo-600 text-white shadow-primary/10" 
          : "bg-white/90 backdrop-blur-sm border border-white/60 text-slate-800 shadow-slate-200/50"
      )}>
        {parsed.kind === "text" && (
          <p className="text-[14.5px] whitespace-pre-wrap break-words leading-relaxed font-medium">
            {parsed.text}
          </p>
        )}

        {parsed.kind === "image" && (
          <div className="rounded-lg overflow-hidden border border-white/20 -mx-1 -mt-1 mb-1 bg-slate-100">
            <img 
              src={parsed.url} 
              alt="Image partagée" 
              loading="lazy"
              className="max-w-full max-h-[300px] w-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" 
            />
          </div>
        )}

        {parsed.kind === "file" && (
          <a 
            href={parsed.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-xl border transition-all mb-1",
              isOwn ? "bg-white/10 border-white/20 hover:bg-white/20" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            )}
          >
            <div className={cn("p-2 rounded-lg shrink-0", isOwn ? "bg-white/20" : "bg-indigo-50")}>
              <FileText className={cn("h-5 w-5", isOwn ? "text-white" : "text-indigo-600")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{parsed.name}</p>
              <p className="text-[9px] opacity-60 uppercase tracking-wider font-semibold">Ouvrir le fichier</p>
            </div>
          </a>
        )}

        <div className={cn(
          "flex items-center gap-1.5 mt-1 text-[10px] font-medium opacity-70 justify-end",
          isOwn ? "text-indigo-100/90" : "text-slate-500"
        )}>
          {message.is_edited && (
            <span className="text-[9px] italic opacity-80 shrink-0">(Modifié)</span>
          )}
          <span>{formattedTime || "--:--"}</span>
          
          {isOwn && (
            <span className="shrink-0 flex items-center gap-1">
              {message.status === 'pending' && (
                <Clock className="h-3 w-3 animate-pulse opacity-80" />
              )}
              {message.status === 'error' && (
                <button
                  onClick={() => onResend?.(message)}
                  className="p-0.5 hover:bg-white/10 rounded text-red-200 transition-colors"
                  title="Renvoyer le message"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              {(!message.status || message.status === 'sent') && (
                message.is_read ? (
                  <span title="Lu" className="inline-flex">
                    <CheckCheck className="h-3.5 w-3.5 text-sky-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />
                  </span>
                ) : (
                  <span title="Envoyé" className="inline-flex">
                    <Check className="h-3.5 w-3.5 text-indigo-200/60" />
                  </span>
                )
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  onEditMessage?: (message: Message) => void
  onDeleteMessage?: (messageId: string) => void
  onResendMessage?: (message: Message) => void
}

// === LISTE DES MESSAGES (SCROLL ET RENDU) ===
export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onEditMessage,
  onDeleteMessage,
  onResendMessage,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = React.useState(false)
  const lastMessagesLength = React.useRef(messages.length)
  
  // Gérer la visibilité du bouton flottant lors du scroll
  const handleScroll = () => {
    const container = containerRef.current
    if (!container) return
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 250
    setShowScrollButton(!isNearBottom)
  }

  // Faire défiler vers le bas
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    setTimeout(() => {
      const container = containerRef.current
      if (!container) return
      
      if (behavior === 'smooth') {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        })
      } else {
        container.scrollTop = container.scrollHeight
      }
    }, 50)
  }

  // Gérer le clic sur le bouton flottant
  const handleScrollToBottomClick = () => {
    scrollToBottom('smooth')
    setShowScrollButton(false)
  }

  // Enrichir les messages avec les séparateurs de date et les infos de clustering
  const enrichedMessages = React.useMemo(() => {
    return messages.map((msg, index) => {
      const prevMsg = messages[index - 1]
      const nextMsg = messages[index + 1]
      
      const isOwn = msg.sender_id === currentUserId
      
      // Clustering (regroupement par expéditeur sous 5 minutes)
      const isSameAsPrev = prevMsg && 
          prevMsg.sender_id === msg.sender_id && 
          !prevMsg.is_mediation && 
          !msg.is_mediation &&
          (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) < 5 * 60 * 1000
  
      const isSameAsNext = nextMsg && 
          nextMsg.sender_id === msg.sender_id && 
          !nextMsg.is_mediation && 
          !msg.is_mediation &&
          (new Date(nextMsg.created_at).getTime() - new Date(msg.created_at).getTime()) < 5 * 60 * 1000
  
      const isGroupStart = !isSameAsPrev
      const isGroupEnd = !isSameAsNext

      // Séparateurs de date
      let dateSeparator: string | null = null
      const currentDate = new Date(msg.created_at)
      
      if (!prevMsg) {
        dateSeparator = getDateSeparator(currentDate)
      } else {
        const prevDate = new Date(prevMsg.created_at)
        if (currentDate.toDateString() !== prevDate.toDateString()) {
          dateSeparator = getDateSeparator(currentDate)
        }
      }

      return {
        ...msg,
        isGroupStart,
        isGroupEnd,
        dateSeparator
      }
    })
  }, [messages, currentUserId])

  // Déclencher le scroll lors de l'arrivée de messages
  React.useEffect(() => {
    const container = containerRef.current
    if (!container || messages.length === 0) return

    const isNewMessage = messages.length > lastMessagesLength.current
    lastMessagesLength.current = messages.length

    if (isNewMessage) {
      const lastMsg = messages[messages.length - 1]
      const isOwn = lastMsg.sender_id === currentUserId
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 250

      if (isOwn || isNearBottom) {
        scrollToBottom('smooth')
      } else {
        setShowScrollButton(true)
      }
    } else {
      // Premier chargement ou changement de discussion -> auto
      scrollToBottom('auto')
    }
  }, [messages, currentUserId])

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col h-full">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #f0f4ff 0%, #f8faff 30%, #fff 60%, #f5f8ff 100%)'
        }}
      >
        {enrichedMessages.length > 0 ? (
          enrichedMessages.map((msg) => (
            <React.Fragment key={msg.id}>
              {msg.dateSeparator && (
                <div className="flex justify-center my-4">
                  <span className="bg-white/70 backdrop-blur-md text-slate-500 text-[11px] font-semibold px-4 py-1.5 rounded-full shadow-sm border border-slate-100/80">
                    {msg.dateSeparator}
                  </span>
                </div>
              )}
              <MessageBubble 
                message={msg} 
                isOwn={msg.sender_id === currentUserId} 
                isGroupStart={msg.isGroupStart}
                isGroupEnd={msg.isGroupEnd}
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
                onResend={onResendMessage}
              />
            </React.Fragment>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 shrink-0 my-auto py-12">
            <Clock className="h-8 w-8 stroke-[1.5] text-slate-300" />
            <span className="text-sm italic">Aucun message dans cette discussion.</span>
          </div>
        )}
        <div ref={bottomRef} className="h-2 shrink-0" />
      </div>

      {showScrollButton && (
        <button
          onClick={handleScrollToBottomClick}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary/90 hover:bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 animate-bounce flex items-center gap-1.5 border border-white/20 z-30"
        >
          <span>Nouveaux messages</span>
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

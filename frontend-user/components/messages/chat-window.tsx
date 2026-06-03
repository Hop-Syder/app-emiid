"use client"

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Send, ArrowLeft, Image as ImageIcon, Smile, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Message, Conversation } from '@/hooks/use-chat'
import Image from 'next/image'

import { Connection } from '@/hooks/use-chat'
import { UserPlus, Clock, Check, X, ShieldAlert } from 'lucide-react'

interface ChatWindowProps {
  conversation: Conversation | null
  messages: Message[]
  currentUserId: string | null
  loading: boolean
  onSendMessage: (content: string) => void
  onBack: () => void
  activeConnection: Connection | null | undefined
  onSendConnectionRequest: (receiverId: string) => void
  onRespondConnection: (connectionId: string, status: 'accepted' | 'declined') => void
  className?: string
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  loading,
  onSendMessage,
  onBack,
  activeConnection,
  onSendConnectionRequest,
  onRespondConnection,
  className
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSendMessage(inputValue)
      setInputValue('')
    }
  }

  if (!conversation) {
    return (
      <div className={cn("hidden md:flex flex-col items-center justify-center flex-1 bg-slate-50/50", className)}>
        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
          <Send className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Vos messages</h3>
        <p className="text-slate-500 text-sm max-w-sm text-center">
          Sélectionnez une conversation dans le menu de gauche ou démarrez une nouvelle discussion depuis l'annuaire.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col flex-1 h-full bg-white relative", className)}>
      {/* Header */}
      <header className="h-16 md:h-20 border-b border-slate-100 px-4 md:px-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 relative">
              {conversation.other_participant?.avatar_url ? (
                <Image src={conversation.other_participant.avatar_url} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                  {conversation.other_participant?.first_name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base md:text-lg">
                {conversation.other_participant ? `${conversation.other_participant.first_name} ${conversation.other_participant.last_name}` : 'Utilisateur inconnu'}
              </h3>
              <p className="text-xs text-slate-500">{conversation.other_participant?.professional_title || 'Membre Emiid'}</p>
            </div>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
            <p>Démarrez la conversation !</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg, index) => {
              const isMine = msg.sender_id === currentUserId
              const showTime = index === 0 || new Date(msg.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 5 * 60 * 1000

              return (
                <div key={msg.id} className={cn("flex flex-col max-w-[85%] md:max-w-[70%]", isMine ? "self-end items-end" : "self-start items-start")}>
                  {showTime && (
                    <span className="text-[10px] text-slate-400 font-medium mb-1.5 px-1">
                      {format(new Date(msg.created_at), "HH:mm", { locale: fr })}
                    </span>
                  )}
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                      isMine 
                        ? "bg-blue-600 text-white rounded-br-sm shadow-sm" 
                        : "bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm"
                    )}
                  >
                    {msg.content}
                  </motion.div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Connection restrictions / Input Area */}
      <div className="p-3 md:p-4 bg-white border-t border-slate-100 shrink-0">
        {activeConnection === undefined ? (
          <div className="flex items-center justify-center py-4 text-slate-400 text-xs font-semibold">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400 mr-2"></div>
            Vérification de la connexion...
          </div>
        ) : activeConnection === null || activeConnection.status === 'declined' ? (
          // Cas 1 : Aucune connexion établie
          <div className="max-w-xl mx-auto p-4 md:p-6 bg-slate-50 border border-slate-200/60 rounded-3xl text-center space-y-4 shadow-sm animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Pas encore connecté(e)</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Vous devez faire partie du réseau professionnel de <strong className="text-slate-800">{conversation.other_participant ? `${conversation.other_participant.first_name} ${conversation.other_participant.last_name}` : 'ce membre'}</strong> pour pouvoir échanger des messages.
              </p>
            </div>
            <button
              onClick={() => {
                const otherId = conversation.participant1_id === currentUserId 
                  ? conversation.participant2_id 
                  : conversation.participant1_id
                onSendConnectionRequest(otherId)
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Envoyer une demande de connexion
            </button>
          </div>
        ) : activeConnection.status === 'pending' && activeConnection.sender_id === currentUserId ? (
          // Cas 2 : Demande envoyée par nous
          <div className="max-w-xl mx-auto p-4 md:p-5 bg-slate-50 border border-slate-200/40 rounded-3xl text-center space-y-3 shadow-sm animate-in fade-in duration-300">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Demande de connexion envoyée</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Dès que {conversation.other_participant?.first_name || 'ce membre'} aura accepté votre invitation, vous pourrez lui envoyer des messages.
              </p>
            </div>
          </div>
        ) : activeConnection.status === 'pending' && activeConnection.receiver_id === currentUserId ? (
          // Cas 3 : Demande reçue par nous
          <div className="max-w-xl mx-auto p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">Demande de connexion reçue</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {conversation.other_participant ? `${conversation.other_participant.first_name} ${conversation.other_participant.last_name}` : 'Ce membre'} souhaite rejoindre votre réseau de contacts professionnels.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onRespondConnection(activeConnection.id, 'accepted')}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all"
              >
                <Check className="w-4 h-4" /> Accepter
              </button>
              <button
                onClick={() => onRespondConnection(activeConnection.id, 'declined')}
                className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" /> Ignorer
              </button>
            </div>
          </div>
        ) : (
          // Cas 4 : Connectés (accepted)
          <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-2xl px-3 py-2 border border-slate-200/50 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100/50 transition-all">
              <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-400 text-sm py-1.5"
              />
              <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="p-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

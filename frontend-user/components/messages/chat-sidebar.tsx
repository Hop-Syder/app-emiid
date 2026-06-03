"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Check, X, UserPlus, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Conversation, Connection } from '@/hooks/use-chat'
import Image from 'next/image'

interface ChatSidebarProps {
  conversations: Conversation[]
  connections: Connection[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onRespondConnection: (id: string, status: 'accepted' | 'declined') => void
  className?: string
}

export function ChatSidebar({
  conversations,
  connections,
  activeConversationId,
  onSelectConversation,
  onRespondConnection,
  className
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages')

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-slate-200 shadow-sm z-10 w-full md:w-80 lg:w-96 shrink-0", className)}>
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col gap-4">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Messagerie</h2>
        
        {/* Toggle Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('messages')}
            className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'messages' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            <MessageCircle className="w-4 h-4" />
            Discussions
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all relative", activeTab === 'requests' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            <UserPlus className="w-4 h-4" />
            Demandes
            {connections.length > 0 && (
              <span className="absolute top-1.5 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-2">
        <AnimatePresence mode="wait">
          {activeTab === 'messages' ? (
            <motion.div key="messages" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-1">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm mt-10">
                  <MessageCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>Aucune conversation active. Allez dans l'annuaire pour vous connecter à d'autres membres.</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl transition-all text-left w-full",
                      activeConversationId === conv.id ? "bg-blue-50/80 shadow-sm border border-blue-100/50" : "hover:bg-slate-50 border border-transparent"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center relative">
                      {conv.other_participant?.avatar_url ? (
                        <Image src={conv.other_participant.avatar_url} alt="Avatar" fill className="object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="font-bold text-slate-900 text-sm truncate pr-2">
                          {conv.other_participant ? `${conv.other_participant.first_name} ${conv.other_participant.last_name}` : 'Utilisateur inconnu'}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                          {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { locale: fr }) : ''}
                        </span>
                      </div>
                      <p className={cn("text-xs truncate", activeConversationId === conv.id ? "text-blue-600 font-medium" : "text-slate-500")}>
                        {conv.last_message_content || 'Nouvelle conversation'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div key="requests" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-2 p-2">
              {connections.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm mt-10">
                  <UserPlus className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>Vous n'avez aucune demande de connexion en attente.</p>
                </div>
              ) : (
                connections.map(conn => (
                  <div key={conn.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center relative">
                        {conn.profile?.avatar_url ? (
                          <Image src={conn.profile.avatar_url} alt="Avatar" fill className="object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {conn.profile ? `${conn.profile.first_name} ${conn.profile.last_name}` : 'Utilisateur'}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">{conn.profile?.professional_title || 'Membre Emiid'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onRespondConnection(conn.id, 'accepted')} className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition-colors">
                        <Check className="w-3.5 h-3.5" /> Accepter
                      </button>
                      <button onClick={() => onRespondConnection(conn.id, 'declined')} className="flex-1 bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-500 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition-colors">
                        <X className="w-3.5 h-3.5" /> Ignorer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

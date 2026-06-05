/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant Sidebar pour la liste des conversations
 * @created 2026-05-11
 * @updated 2026-06-02
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import React, { useMemo } from 'react'
import { Search, Plus, MessageSquareDot } from 'lucide-react'
import { Conversation } from './types'
import { ConversationItem } from './conversation-item'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// === INTERFACES ===
interface ChatSidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (conv: Conversation) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading: boolean
  onlineUserIds?: Set<string>
}

// === COMPOSANT SIDEBAR ===
export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  searchQuery,
  onSearchChange,
  isLoading,
  onlineUserIds = new Set(),
}) => {
  const router = useRouter()

  const totalUnread = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0),
    [conversations]
  )

  // === RENDU DU COMPOSANT ===
  return (
    <div className="flex flex-col h-full border-r border-white/50 bg-white/50 backdrop-blur-xl w-full z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.08)]">
      
      {/* === EN-TÊTE === */}
      <div className="px-4 pt-5 pb-3 border-b border-slate-100/80 bg-white/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Messages</h2>
            {totalUnread > 0 && (
              <span className={cn(
                "min-w-[20px] h-5 flex items-center justify-center",
                "bg-primary text-white text-[10px] font-bold rounded-full px-1.5 shadow-sm",
                "animate-in zoom-in duration-300"
              )}>
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-xl h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/8 transition-colors"
            onClick={() => router.push('/annuaire')}
            title="Démarrer une nouvelle discussion"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Recherche */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
          <Input 
            id="chat-search-input"
            name="chat_search"
            autoComplete="off"
            placeholder="Rechercher une conversation..." 
            className="pl-9 h-9 text-sm bg-slate-50/80 border-slate-200/60 focus-visible:ring-primary/20 rounded-xl transition-all focus-visible:bg-white shadow-none"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* === LISTE DES CONVERSATIONS === */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
                <div className="h-11 w-11 rounded-full bg-slate-200/80 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200/80 rounded-full w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length > 0 ? (
          <div className="flex flex-col gap-0.5 p-2">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeId === conv.id}
                onClick={onSelect}
                isOnline={onlineUserIds.has(conv.other_participant.user_id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <MessageSquareDot className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {searchQuery ? 'Aucun résultat trouvé.' : 'Aucune conversation pour le moment.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/annuaire')}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Démarrer une discussion →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

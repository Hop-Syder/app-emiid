/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant Sidebar pour la liste des conversations
 * @created 2026-05-11
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import React from 'react'
import { Search, Plus } from 'lucide-react'
import { Conversation } from './types'
import { ConversationItem } from './conversation-item'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

// === INTERFACES ===
interface ChatSidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (conv: Conversation) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading: boolean
}

// === COMPOSANT SIDEBAR ===
export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  searchQuery,
  onSearchChange,
  isLoading,
}) => {
  const router = useRouter()
  // === RENDU DU COMPOSANT ===
  return (
    <div className="flex flex-col h-full border-r border-white/50 bg-white/40 backdrop-blur-md w-full z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
      
      {/* === EN-TÊTE ET RECHERCHE === */}
      <div className="p-5 border-b border-white/50 space-y-5 bg-white/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Messages</h2>
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full text-indigo-600 hover:bg-indigo-50"
            onClick={() => router.push('/annuaire')}
            title="Démarrer une nouvelle discussion"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            id="chat-search-input"
            name="chat_search"
            autoComplete="off"
            placeholder="Rechercher..." 
            className="pl-10 bg-white/60 border-white shadow-sm focus-visible:ring-primary/20 rounded-xl h-11 transition-all"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* === LISTE DES CONVERSATIONS === */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-8 text-center space-y-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-slate-500 font-medium">Chargement...</p>
          </div>
        ) : conversations.length > 0 ? (
          <div className="flex flex-col gap-1 p-2">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeId === conv.id}
                onClick={onSelect}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-400">Aucune conversation trouvée.</p>
          </div>
        )}
      </div>
    </div>
  )
}

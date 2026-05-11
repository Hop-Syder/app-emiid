/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant Sidebar pour la liste des conversations
 * @created 2026-05-11
*/

import React from 'react'
import { Search, Plus } from 'lucide-react'
import { Conversation } from './types'
import { ConversationItem } from './conversation-item'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ChatSidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (conv: Conversation) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading: boolean
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  searchQuery,
  onSearchChange,
  isLoading,
}) => {
  const router = useRouter()
  return (
    <div className="flex flex-col h-full border-r bg-white w-full md:w-80 lg:w-96">
      <div className="p-4 border-b space-y-4">
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
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Rechercher une discussion..." 
            className="pl-9 bg-slate-50 border-none focus-visible:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center space-y-4">
            <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-slate-500">Chargement des conversations...</p>
          </div>
        ) : conversations.length > 0 ? (
          <div className="divide-y divide-slate-50">
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

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant Sidebar pour la liste des conversations
 * @created 2026-05-11
 * @updated 2026-06-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import React, { useMemo } from 'react'
import { Search, Plus, MessageSquareDot, ArrowLeft, Archive, WifiOff } from 'lucide-react'
import { Conversation } from './types'
import { ConversationItem } from './conversation-item'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// === INTERFACES ===
interface ChatSidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (conv: Conversation) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading: boolean
  hasError?: boolean
  onlineUserIds?: Set<string>
  onPin?: (convId: string) => void
  onArchive?: (convId: string) => void
  onDelete?: (convId: string) => void
}

// === COMPOSANT SIDEBAR ===
export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  searchQuery,
  onSearchChange,
  isLoading,
  hasError = false,
  onlineUserIds = new Set(),
  onPin,
  onArchive,
  onDelete,
}) => {
  const router = useRouter()
  const [showArchived, setShowArchived] = React.useState(false)

  // Séparer les archivées des actives
  const archivedConversations = useMemo(() => {
    return conversations.filter(c => c.isArchived)
  }, [conversations])

  const activeConversations = useMemo(() => {
    return conversations.filter(c => !c.isArchived)
  }, [conversations])

  // Conversations à afficher (filtrées et triées)
  const displayConversations = useMemo(() => {
    const list = showArchived ? archivedConversations : activeConversations
    return [...list].sort((a, b) => {
      // Épinglées en premier
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      // Puis par date de dernier message (ou mise à jour) décroissante
      const dateA = new Date(a.last_message_at || a.updated_at).getTime()
      const dateB = new Date(b.last_message_at || b.updated_at).getTime()
      return dateB - dateA
    })
  }, [showArchived, archivedConversations, activeConversations])

  const totalUnread = useMemo(
    () => activeConversations.reduce((acc, c) => acc + (c.unread_count || 0), 0),
    [activeConversations]
  )

  // === RENDU DU COMPOSANT ===
  return (
    <div className="flex flex-col h-full border-r border-white/50 dark:border-white/10 bg-card/50 backdrop-blur-xl w-full z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.08)]">
      
      {/* === EN-TÊTE === */}
      <div className="px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] lg:pt-5 pb-3 border-b border-border/80 bg-background lg:bg-card/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {showArchived ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 lg:h-8 lg:w-8 rounded-full lg:rounded-lg text-muted-foreground hover:text-foreground mr-0.5"
                aria-label="Retour aux messages"
                onClick={() => setShowArchived(false)}
                title="Retour aux messages"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:inline-flex h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground mr-0.5"
                onClick={() => router.push('/annuaire')}
                title="Retour à l'annuaire"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-xl lg:text-lg font-black lg:font-bold text-foreground tracking-tight">
              {showArchived ? "Archivées" : "Messagerie"}
            </h2>
            {totalUnread > 0 && !showArchived && (
              <span className={cn(
                "min-w-[20px] h-5 flex items-center justify-center",
                "bg-[#25D366] lg:bg-primary text-white text-[10px] font-bold rounded-full px-1.5 shadow-sm",
                "animate-in zoom-in duration-300"
              )}>
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          {!showArchived && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full lg:rounded-xl h-11 w-11 lg:h-8 lg:w-8 text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
              aria-label="Démarrer une nouvelle discussion"
              onClick={() => router.push('/annuaire')}
              title="Démarrer une nouvelle discussion"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Recherche */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
          <Input 
            id="chat-search-input"
            name="chat_search"
            autoComplete="off"
            placeholder="Rechercher une conversation..." 
            className="pl-9 h-11 lg:h-9 text-base lg:text-sm bg-muted/80 border-transparent lg:border-border/60 focus-visible:ring-primary/20 rounded-full lg:rounded-xl transition-all focus-visible:bg-card shadow-none"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* === LISTE DES CONVERSATIONS === */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Affichage des archives (si existantes et non en cours de visualisation) */}
        {archivedConversations.length > 0 && !showArchived && (
          <button
            onClick={() => setShowArchived(true)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-b border-border text-muted-foreground hover:text-foreground group"
          >
            <Archive className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="text-xs font-semibold flex-1 text-left">Discussions archivées</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-bold text-muted-foreground">
              {archivedConversations.length}
            </span>
          </button>
        )}

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
                <div className="h-11 w-11 rounded-full bg-muted/80 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted/80 rounded-full w-3/4" />
                  <div className="h-2.5 bg-muted rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayConversations.length > 0 ? (
          <motion.div layout className="flex flex-col lg:gap-0.5 lg:p-2">
            <AnimatePresence initial={false}>
              {displayConversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                >
                  <ConversationItem
                    conversation={conv}
                    isActive={activeId === conv.id}
                    onClick={onSelect}
                    isOnline={onlineUserIds.has(conv.other_participant.user_id)}
                    onPin={onPin}
                    onArchive={onArchive}
                    onDelete={onDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
              <WifiOff className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-sm text-slate-400 font-medium">
              Impossible de charger vos conversations.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <MessageSquareDot className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {searchQuery ? 'Aucun résultat trouvé.' : showArchived ? 'Aucune conversation archivée.' : 'Aucune conversation pour le moment.'}
            </p>
            {!searchQuery && !showArchived && (
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

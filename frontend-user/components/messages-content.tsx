/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contenu principal de messagerie en temps réel
 * @created 2026-06-05
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, MoreHorizontal, Gavel, Trash2, MessageSquare, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { captureError } from "@/lib/observability"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ChatSidebar } from "./messages/chat-sidebar"
import { MessageList } from "./messages/message-list"
import { MessageInput } from "./messages/message-input"
import { MediationDialog } from "./messages/mediation-dialog"
import { Conversation, Message } from "./messages/types"

import {
  fetchConversations,
  fetchConversationMessages,
  requestMediation,
  deleteConversation,
} from "@/features/messages/messagesApi"
import { useCurrentUserId } from "@/features/messages/useCurrentUserId"
import { useMessagesRealtime } from "@/features/messages/useMessagesRealtime"
import { useConversationActions } from "@/hooks/use-conversation-actions"

export function MessagesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const contactId = searchParams.get("contact") || searchParams.get("user")

  const supabase = useMemo(() => createClient(), [])
  const currentUserId = useCurrentUserId()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConv, setLoadingConv] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showChatMobile, setShowChatMobile] = useState(false)
  const [isMediationOpen, setIsMediationOpen] = useState(false)
  const [isMediationLoading, setIsMediationLoading] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set())
  const [inChatSearchOpen, setInChatSearchOpen] = useState(false)
  const [inChatQuery, setInChatQuery] = useState("")
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  const [archivedIds, setArchivedIds] = useState<string[]>([])
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [convIdToDelete, setConvIdToDelete] = useState<string | null>(null)

  const displayedMessages = useMemo(() => {
    const q = inChatQuery.trim().toLowerCase()
    if (!inChatSearchOpen || !q) return messages
    return messages.filter((m) => (m.content || "").toLowerCase().includes(q))
  }, [messages, inChatSearchOpen, inChatQuery])

  useEffect(() => {
    setInChatSearchOpen(false)
    setInChatQuery("")
  }, [selectedConv?.id])

  // Load pin/archive state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const pinned = localStorage.getItem("local_pinned_conversations")
      const archived = localStorage.getItem("local_archived_conversations")
      if (pinned) setPinnedIds(JSON.parse(pinned))
      if (archived) setArchivedIds(JSON.parse(archived))
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleTogglePin = useCallback((conversationId: string) => {
    setPinnedIds((prev) => {
      const next = prev.includes(conversationId) ? prev.filter((id) => id !== conversationId) : [...prev, conversationId]
      localStorage.setItem("local_pinned_conversations", JSON.stringify(next))
      return next
    })
  }, [])

  const handleToggleArchive = useCallback((conversationId: string) => {
    setArchivedIds((prev) => {
      const next = prev.includes(conversationId) ? prev.filter((id) => id !== conversationId) : [...prev, conversationId]
      localStorage.setItem("local_archived_conversations", JSON.stringify(next))
      return next
    })
    setSelectedConv((prev) => {
      if (prev && prev.id === conversationId) {
        setShowChatMobile(false)
        router.push("/messages", { scroll: false })
        return null
      }
      return prev
    })
  }, [router])

  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!currentUserId || conversationId.startsWith("new-")) return
    try {
      await supabase.from("messages").update({ is_read: true }).eq("conversation_id", conversationId).neq("sender_id", currentUserId)
      setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c)))
    } catch (err) {
      console.error("Error marking read", err)
    }
  }, [currentUserId, supabase])

  // Conversation actions hook
  const { handleSendMessage, handleEditMessage, handleDeleteMessage, handleResendMessage } =
    useConversationActions({ currentUserId, supabase, selectedConv, setMessages, setConversations, setSelectedConv })

  const onStartEdit = useCallback((message: Message) => {
    setEditingMessage(message)
  }, [])

  // Load Conversations
  useEffect(() => {
    const load = async () => {
      if (!currentUserId) return
      setLoadingConv(true)
      try {
        const data = await fetchConversations()
        setConversations(data)

        if (contactId) {
          const { data: profileData } = await supabase
            .from("public_profiles")
            .select("user_id, first_name, last_name, avatar_url")
            .or(`id.eq.${contactId},user_id.eq.${contactId}`)
            .maybeSingle()

          const resolvedUserId = profileData?.user_id || contactId
          const existing = data.find(
            (c: Conversation) => c.other_participant.user_id === resolvedUserId || c.other_participant.id === contactId
          )

          if (existing) {
            setSelectedConv(existing)
            setShowChatMobile(true)
          } else {
            setSelectedConv({
              id: `new-${resolvedUserId}`,
              participant1_id: currentUserId,
              participant2_id: resolvedUserId,
              unread_count: 0,
              updated_at: new Date().toISOString(),
              other_participant: {
                id: resolvedUserId,
                user_id: resolvedUserId,
                first_name: profileData?.first_name || "Nouveau",
                last_name: profileData?.last_name || "Contact",
                avatar_url: profileData?.avatar_url || "",
              },
            })
            setShowChatMobile(true)
          }
        }
      } catch (err) {
        captureError(err, { scope: "messages", action: "fetchConversations" })
      } finally {
        setLoadingConv(false)
      }
    }
    load()
  }, [currentUserId, contactId, supabase])

  // Load Messages
  useEffect(() => {
    const convId = selectedConv?.id
    if (!convId || convId.startsWith("new-")) { setMessages([]); return }
    const load = async () => {
      setLoadingMsgs(true)
      try {
        const data = await fetchConversationMessages(convId)
        setMessages(data)
        markMessagesAsRead(convId)
      } catch (err) {
        captureError(err, { scope: "messages", action: "fetchMessages" })
      } finally {
        setLoadingMsgs(false)
      }
    }
    load()
  }, [selectedConv?.id, markMessagesAsRead])

  const realtime = useMessagesRealtime(currentUserId, {
    onPresenceChange: (userIds) => setOnlineUserIds(userIds),
    onNewMessage: (newMsg) => {
      if (selectedConv && newMsg.conversation_id === selectedConv.id) {
        setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]))
        markMessagesAsRead(selectedConv.id)
      }
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === newMsg.conversation_id)
        if (index === -1) {
          fetchConversations().then((data) => setConversations(data)).catch(console.error)
          return prev
        }
        const next = [...prev]
        const isCurrent = selectedConv?.id === newMsg.conversation_id
        next[index] = {
          ...next[index],
          last_message: newMsg.content,
          last_message_at: newMsg.created_at,
          unread_count: isCurrent ? 0 : next[index].unread_count + 1,
        }
        return next
      })
    },
    onUpdateMessage: (updatedMsg) => {
      if (selectedConv && updatedMsg.conversation_id === selectedConv.id) {
        setMessages((prev) => prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)))
      }
    },
    onDeleteMessage: (deletedMsgId) => {
      setMessages((prev) => prev.filter((m) => m.id !== deletedMsgId))
    },
  })

  // --- Rattrapage à la (re)connexion Realtime ---
  // Le stream postgres_changes ne rejoue PAS les messages reçus pendant une coupure.
  // Sur transition déconnecté → reconnecté, on resynchronise la liste + la conversation
  // active pour ne rien perdre (chat "WhatsApp-like").
  const selectedConvIdRef = useRef<string | null>(null)
  useEffect(() => { selectedConvIdRef.current = selectedConv?.id ?? null }, [selectedConv?.id])

  const hasConnectedRef = useRef(false)
  useEffect(() => {
    if (!realtime.realtimeConnected) return
    if (!hasConnectedRef.current) {
      hasConnectedRef.current = true // 1re connexion : rien à rattraper
      return
    }
    // Reconnexion → resynchronisation.
    fetchConversations().then((data) => setConversations(data)).catch(() => {})
    const convId = selectedConvIdRef.current
    if (convId && !convId.startsWith("new-")) {
      fetchConversationMessages(convId)
        .then((data) => { setMessages(data); markMessagesAsRead(convId) })
        .catch(() => {})
    }
  }, [realtime.realtimeConnected, markMessagesAsRead])

  const handleRequestMediation = async (reason: string) => {
    if (!selectedConv) return
    setIsMediationLoading(true)
    try {
      await requestMediation(selectedConv.id, reason)
      toast.success("Demande de médiation envoyée")
      setIsMediationOpen(false)
    } catch {
      toast.error("Erreur lors de la demande")
    } finally {
      setIsMediationLoading(false)
    }
  }

  const handleDeleteConversation = useCallback((convId?: string) => {
    setConvIdToDelete(convId || selectedConv?.id || null)
    setIsDeleteConfirmOpen(true)
  }, [selectedConv])

  const confirmDeleteConversation = async () => {
    const id = convIdToDelete || selectedConv?.id
    if (!id) return
    setIsDeleteConfirmOpen(false)
    try {
      await deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (selectedConv?.id === id) {
        setSelectedConv(null)
        setShowChatMobile(false)
        router.push("/messages", { scroll: false })
      }
      toast.success("Conversation supprimée")
    } catch {
      toast.error("Erreur lors de la suppression")
    } finally {
      setConvIdToDelete(null)
    }
  }

  const enrichedConversations = useMemo(() =>
    conversations.map((c) => ({
      ...c,
      isPinned: pinnedIds.includes(c.id),
      isArchived: archivedIds.includes(c.id),
    })),
    [conversations, pinnedIds, archivedIds]
  )

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return enrichedConversations
    return enrichedConversations.filter((c) =>
      `${c.other_participant.first_name} ${c.other_participant.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [enrichedConversations, searchQuery])

  return (
    <div className="flex h-full w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-blue-100/40 blur-3xl opacity-50 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-100/40 blur-3xl opacity-50 mix-blend-multiply pointer-events-none" />

      {/* Left column: conversation list */}
      <div className={cn("h-full w-full shrink-0 md:w-[360px] md:block md:shrink-0", showChatMobile && "hidden md:block")}>
        <ChatSidebar
          conversations={filteredConversations}
          activeId={selectedConv?.id || null}
          onSelect={(conv: Conversation) => {
            setSelectedConv(conv)
            setShowChatMobile(true)
            const resolvedId = conv.other_participant.user_id || conv.other_participant.id
            router.push(`/messages?contact=${resolvedId}`, { scroll: false })
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={loadingConv}
          onlineUserIds={onlineUserIds}
          onPin={handleTogglePin}
          onArchive={handleToggleArchive}
          onDelete={handleDeleteConversation}
        />
      </div>

      {/* Right column: chat area */}
      <div className={cn("flex-1 flex flex-col h-full relative z-10", !showChatMobile && "hidden md:block")}>
        {selectedConv ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-white/40 flex items-center justify-between bg-white/70 backdrop-blur-xl z-20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] shrink-0">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden -ml-2 hover:bg-slate-100/50 h-8 w-8"
                  onClick={() => { setShowChatMobile(false); router.push("/messages", { scroll: false }) }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="relative cursor-pointer group">
                  <Avatar className="h-10 w-10 ring-2 ring-indigo-100 transition-transform group-hover:scale-105">
                    <AvatarImage src={selectedConv.other_participant.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-primary text-white font-bold text-sm">
                      {selectedConv.other_participant.first_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className={cn(
                    "absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full transition-colors",
                    onlineUserIds.has(selectedConv.other_participant.user_id) ? "bg-emerald-500" : "bg-slate-300"
                  )} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 leading-tight">
                    {selectedConv.other_participant.first_name} {selectedConv.other_participant.last_name}
                  </h2>
                  <span className={cn(
                    "text-[11px] font-semibold",
                    onlineUserIds.has(selectedConv.other_participant.user_id) ? "text-emerald-600" : "text-slate-400"
                  )}>
                    {onlineUserIds.has(selectedConv.other_participant.user_id) ? "En ligne" : "Hors ligne"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Rechercher dans la discussion"
                  aria-pressed={inChatSearchOpen}
                  className={cn(
                    "h-9 w-9 rounded-xl transition-colors",
                    inChatSearchOpen ? "text-primary bg-primary/10" : "text-slate-400 hover:text-primary hover:bg-primary/5"
                  )}
                  onClick={() => setInChatSearchOpen((v) => { const next = !v; if (!next) setInChatQuery(""); return next })}
                >
                  <Search className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 h-9 w-9 rounded-xl">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-slate-100">
                    <DropdownMenuItem className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 rounded-lg" onClick={() => setIsMediationOpen(true)}>
                      <Gavel className="mr-2 h-4 w-4" /> Demander médiation
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg animate-none cursor-pointer" onClick={() => handleDeleteConversation()}>
                      <Trash2 className="mr-2 h-4 w-4" /> Supprimer discussion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* In-chat search bar */}
            {inChatSearchOpen && (
              <div className="px-4 py-2 border-b border-white/40 bg-white/60 backdrop-blur-xl z-10 shrink-0 flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={inChatQuery}
                  onChange={(e) => setInChatQuery(e.target.value)}
                  placeholder="Rechercher dans cette discussion..."
                  aria-label="Texte à rechercher dans la discussion"
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                />
                {inChatQuery.trim() && (
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                    {displayedMessages.length} résultat{displayedMessages.length > 1 ? "s" : ""}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Fermer la recherche"
                  className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 shrink-0"
                  onClick={() => { setInChatSearchOpen(false); setInChatQuery("") }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {loadingMsgs ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-slate-50/10 backdrop-blur-sm">
                <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
                <p className="text-sm text-slate-500 font-medium">Chargement des messages...</p>
              </div>
            ) : (
              <MessageList
                messages={displayedMessages}
                currentUserId={currentUserId || ""}
                onEditMessage={onStartEdit}
                onDeleteMessage={handleDeleteMessage}
                onResendMessage={handleResendMessage}
              />
            )}

            <MessageInput
              onSend={handleSendMessage}
              isDisabled={!realtime.realtimeConnected}
              editingMessage={editingMessage}
              onCancelEdit={() => setEditingMessage(null)}
              onEditSubmit={handleEditMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/30 backdrop-blur-md p-8 text-center h-full">
            <div className="w-24 h-24 bg-white shadow-xl shadow-indigo-100/50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
              <MessageSquare className="h-10 w-10 text-primary/60" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Vos Messages</h2>
            <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
              Sélectionnez une conversation dans le panneau latéral pour commencer à échanger avec votre réseau.
            </p>
          </div>
        )}
      </div>

      <MediationDialog
        isOpen={isMediationOpen}
        onClose={() => setIsMediationOpen(false)}
        onConfirm={handleRequestMediation}
        isLoading={isMediationLoading}
      />

      <ConfirmActionDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteConversation}
        variant="destructive"
        title="Supprimer la conversation ?"
        description="Cette action supprimera tout l'historique des messages pour vous. Cette action est irréversible."
        confirmText="Supprimer définitivement"
      />
    </div>
  )
}

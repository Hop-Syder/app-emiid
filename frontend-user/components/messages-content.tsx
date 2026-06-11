/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de messagerie refactorisée et modulaire (Version Complète & Robuste)
 * @created 2026-05-11
 * @updated 2026-06-11
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, MoreHorizontal, Gavel, Trash2, MessageSquare, Phone, Video, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { captureError } from "@/lib/observability"

const MAX_CONTENT_LENGTH = 10 * 1024 * 1024; // 10MB

// Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Modular Components
import { ChatSidebar } from "./messages/chat-sidebar"
import { MessageList } from "./messages/message-list"
import { MessageInput } from "./messages/message-input"
import { MediationDialog } from "./messages/mediation-dialog"
import { Conversation, Message } from "./messages/types"

// APIs & Hooks
import {
  fetchConversations,
  fetchConversationMessages,
  requestMediation,
  deleteConversation,
} from "@/features/messages/messagesApi"
import { useCurrentUserId } from "@/features/messages/useCurrentUserId"
import { useMessagesRealtime } from "@/features/messages/useMessagesRealtime"

export function MessagesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const contactId = searchParams.get("contact") || searchParams.get("user")

  const supabase = useMemo(() => createClient(), [])
  const currentUserId = useCurrentUserId()

  // === ÉTATS ET RÉFÉRENCES ===
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

  // États additionnels pour les fonctionnalités WhatsApp
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  const [archivedIds, setArchivedIds] = useState<string[]>([])
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [convIdToDelete, setConvIdToDelete] = useState<string | null>(null)

  // Charger les états Pin/Archive du local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pinned = localStorage.getItem("local_pinned_conversations")
      const archived = localStorage.getItem("local_archived_conversations")
      if (pinned) {
        try {
          setPinnedIds(JSON.parse(pinned))
        } catch (e) {
          console.error(e)
        }
      }
      if (archived) {
        try {
          setArchivedIds(JSON.parse(archived))
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [])

  // Callbacks de modification de Pin/Archive
  const handleTogglePin = useCallback((conversationId: string) => {
    setPinnedIds(prev => {
      const next = prev.includes(conversationId)
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
      localStorage.setItem("local_pinned_conversations", JSON.stringify(next))
      return next
    })
  }, [])

  const handleToggleArchive = useCallback((conversationId: string) => {
    setArchivedIds(prev => {
      const next = prev.includes(conversationId)
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
      localStorage.setItem("local_archived_conversations", JSON.stringify(next))
      return next
    })

    // Fermer la conversation si elle était active
    setSelectedConv(prev => {
      if (prev && prev.id === conversationId) {
        setShowChatMobile(false)
        router.push('/messages', { scroll: false })
        return null
      }
      return prev
    })
  }, [router])

  // Mark as read
  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!currentUserId || conversationId.startsWith('new-')) return
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId)

      setConversations(prev => prev.map(c =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      ))
    } catch (err) {
      console.error("Error marking read", err)
    }
  }, [currentUserId, supabase])

  // Load Conversations
  useEffect(() => {
    const load = async () => {
      if (!currentUserId) return
      setLoadingConv(true)
      try {
        const data = await fetchConversations()
        setConversations(data)

        if (contactId) {
          const { data: profile } = await supabase
            .from('public_profiles')
            .select('user_id, first_name, last_name, avatar_url')
            .or(`id.eq.${contactId},user_id.eq.${contactId}`)
            .maybeSingle()

          const resolvedUserId = profile?.user_id || contactId;
          const existing = data.find((c: Conversation) => c.other_participant.user_id === resolvedUserId || c.other_participant.id === contactId)

          if (existing) {
            setSelectedConv(existing)
            setShowChatMobile(true)
          } else {
            // New conv placeholder
            setSelectedConv({
              id: `new-${resolvedUserId}`,
              participant1_id: currentUserId,
              participant2_id: resolvedUserId,
              unread_count: 0,
              updated_at: new Date().toISOString(),
              other_participant: {
                id: resolvedUserId,
                user_id: resolvedUserId,
                first_name: profile?.first_name || "Nouveau",
                last_name: profile?.last_name || "Contact",
                avatar_url: profile?.avatar_url || ""
              }
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
  }, [currentUserId, contactId])

  // Load Messages
  useEffect(() => {
    if (!selectedConv || selectedConv.id.startsWith('new-')) {
      setMessages([])
      return
    }
    const load = async () => {
      setLoadingMsgs(true)
      try {
        const data = await fetchConversationMessages(selectedConv.id)
        setMessages(data)
        markMessagesAsRead(selectedConv.id)
      } catch (err) {
        captureError(err, { scope: "messages", action: "fetchMessages" })
      } finally {
        setLoadingMsgs(false)
      }
    }
    load()
  }, [selectedConv?.id, markMessagesAsRead])

  // Realtime handlers
  const realtime = useMessagesRealtime(currentUserId, {
    onPresenceChange: (userIds) => {
      setOnlineUserIds(userIds)
    },
    onNewMessage: (newMsg) => {
      // 1. Dédoublonner et ajouter le message si c'est la conversation active
      if (selectedConv && newMsg.conversation_id === selectedConv.id) {
        setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
        markMessagesAsRead(selectedConv.id)
      }

      // 2. Mettre à jour les conversations dans la barre latérale
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === newMsg.conversation_id)
        if (index === -1) {
          // Si la conversation n'est pas dans la liste locale, on recharge
          fetchConversations().then(data => setConversations(data)).catch(console.error)
          return prev
        }
        const next = [...prev]
        const isCurrent = selectedConv?.id === newMsg.conversation_id
        next[index] = {
          ...next[index],
          last_message: newMsg.content,
          last_message_at: newMsg.created_at,
          unread_count: isCurrent ? 0 : next[index].unread_count + 1
        }
        return next
      })
    },
    onUpdateMessage: (updatedMsg) => {
      if (selectedConv && updatedMsg.conversation_id === selectedConv.id) {
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m))
      }
    },
    onDeleteMessage: (deletedMsgId) => {
      setMessages(prev => prev.filter(m => m.id !== deletedMsgId))
    }
  })

  const getOrCreateConversationId = async (receiverId: string): Promise<string> => {
    if (!currentUserId) throw new Error("Non authentifié")
    let convId = selectedConv?.id

    if (!convId || convId.startsWith('new-')) {
      const p1 = currentUserId < receiverId ? currentUserId : receiverId
      const p2 = currentUserId < receiverId ? receiverId : currentUserId

      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${p1},participant2_id.eq.${p2}),and(participant1_id.eq.${p2},participant2_id.eq.${p1})`)
        .maybeSingle()

      if (!existingConv) {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({ participant1_id: p1, participant2_id: p2 })
          .select('id')
          .single()
        if (createError) throw createError
        convId = newConv.id
      } else {
        convId = existingConv.id
      }
    }
    if (!convId) {
      throw new Error("Impossible de trouver ou créer la conversation")
    }
    return convId
  }

  const sendMessageToDB = async (content: string, receiverId: string, convId: string): Promise<Message> => {
    if (!currentUserId) throw new Error("Non authentifié")

    const { data: newMsg, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        sender_id: currentUserId,
        content: content,
        is_read: false,
      })
      .select()
      .single()

    if (msgError) throw msgError
    if (!newMsg) throw new Error("Erreur de base de données lors de la création du message")

    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString()
      })
      .eq('id', convId)

    return {
      id: newMsg.id,
      conversation_id: newMsg.conversation_id,
      sender_id: newMsg.sender_id,
      content: newMsg.content,
      is_read: newMsg.is_read,
      created_at: newMsg.created_at,
      is_mediation: false
    }
  }

  const handleFileUpload = async (file: File, convId: string): Promise<Message | undefined> => {
    if (!selectedConv || !currentUserId) return

    // Contrôle explicite requis par l'audit de sécurité
    if (file.size > MAX_CONTENT_LENGTH) {
      toast.error("Fichier trop volumineux (Max 10MB)")
      return
    }

    const type = file.type.startsWith("image/") ? "image" : "file"
    const localMaxSize = type === "image" ? 5 * 1024 * 1024 : MAX_CONTENT_LENGTH

    if (file.size > localMaxSize) {
      toast.error(`Fichier trop volumineux (Max ${type === "image" ? "5MB" : "10MB"})`)
      return
    }

    const uploadToastId = toast.loading("Envoi du fichier...")
    try {
      const extension = file.name.split(".").pop()
      const filePath = `messages/${convId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

      const { error: uploadError } = await supabase.storage.from("messages").upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from("messages").getPublicUrl(filePath)
      const content = type === "image" ? `[Image] ${publicUrl}` : `[Fichier] ${file.name} - ${publicUrl}`

      const newMsg = await sendMessageToDB(content, selectedConv.other_participant.user_id, convId)
      toast.success("Fichier envoyé", { id: uploadToastId })
      return newMsg
    } catch (err) {
      console.error(err)
      toast.error("Échec de l'upload", { id: uploadToastId })
      throw err
    }
  }

  const handleSendMessage = async (content: string, type?: "text" | "emoji", file?: File) => {
    if (!selectedConv || (!content.trim() && !file) || !currentUserId) return

    const isNewConv = selectedConv.id.startsWith('new-')
    const optimisticId = `optimistic-${Date.now()}`

    // Message temporaire pour l'optimistic UI
    const tempMsg: Message = {
      id: optimisticId,
      conversation_id: selectedConv.id,
      sender_id: currentUserId,
      content: file ? `[Fichier] ${file.name}` : content,
      is_read: false,
      is_mediation: false,
      created_at: new Date().toISOString(),
      status: 'pending'
    }

    setMessages(prev => [...prev, tempMsg])

    try {
      const convId = await getOrCreateConversationId(selectedConv.other_participant.user_id)
      let newMsg: Message | undefined = undefined

      if (file) {
        newMsg = await handleFileUpload(file, convId)
      } else {
        newMsg = await sendMessageToDB(content, selectedConv.other_participant.user_id, convId)
      }

      if (newMsg) {
        const finalMsg = newMsg
        // Remplacer le message temporaire par le vrai message Supabase
        setMessages(prev => prev.map(m => m.id === optimisticId ? { ...finalMsg, status: 'sent' as const } : m))

        // Mettre à jour la conversation dans la liste de gauche
        setConversations(prev => {
          return prev.map(c => {
            if (c.id === selectedConv.id || c.id === convId) {
              return {
                ...c,
                id: convId,
                last_message: file ? `[Fichier] ${file.name}` : content,
                last_message_at: finalMsg.created_at,
                updated_at: finalMsg.created_at
              }
            }
            return c
          })
        })
      }

      if (isNewConv && newMsg) {
        const updatedConvs = await fetchConversations()
        setConversations(updatedConvs)

        const newRealConv = updatedConvs.find(c => c.id === convId)
        if (newRealConv) {
          setSelectedConv(newRealConv)
        } else {
          setSelectedConv(prev => prev ? { ...prev, id: convId } : null)
        }
      }
    } catch (err: any) {
      console.error(err)
      // Marquer le message comme en erreur
      setMessages(prev => prev.map(m => m.id === optimisticId ? { ...m, status: 'error' as const } : m))
      toast.error(`Échec de l'envoi : ${err?.message || "Erreur réseau"}`)
    }
  }

  // callbacks d'édition et suppression
  const handleStartEditMessage = useCallback((message: Message) => {
    setEditingMessage(message)
  }, [])

  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!messageId || !newContent.trim()) return
    try {
      const { error } = await supabase
        .from('messages')
        .update({ content: newContent })
        .eq('id', messageId)

      if (error) throw error

      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, content: newContent, is_edited: true } : m
      ))
      toast.success("Message modifié")
    } catch (err: any) {
      console.error("Error updating message", err)
      toast.error(`Échec de la modification : ${err?.message || "Erreur réseau"}`)
    }
  }, [supabase])

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!messageId) return
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      setMessages(prev => prev.filter(m => m.id !== messageId))
      toast.success("Message supprimé")
    } catch (err: any) {
      console.error("Error deleting message", err)
      toast.error(`Échec de la suppression : ${err?.message || "Erreur réseau"}`)
    }
  }, [supabase])

  const handleResendMessage = useCallback(async (failedMsg: Message) => {
    if (!failedMsg || !selectedConv) return
    
    // Supprimer le message en erreur localement
    setMessages(prev => prev.filter(m => m.id !== failedMsg.id))
    
    // Renvoyer le contenu
    await handleSendMessage(failedMsg.content)
  }, [selectedConv, handleSendMessage])

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
      setConversations(prev => prev.filter(c => c.id !== id))
      if (selectedConv?.id === id) {
        setSelectedConv(null)
        setShowChatMobile(false)
        router.push('/messages', { scroll: false })
      }
      toast.success("Conversation supprimée")
    } catch {
      toast.error("Erreur lors de la suppression")
    } finally {
      setConvIdToDelete(null)
    }
  }

  const enrichedConversations = useMemo(() => {
    return conversations.map(c => ({
      ...c,
      isPinned: pinnedIds.includes(c.id),
      isArchived: archivedIds.includes(c.id)
    }))
  }, [conversations, pinnedIds, archivedIds])

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return enrichedConversations
    return enrichedConversations.filter(c =>
      `${c.other_participant.first_name} ${c.other_participant.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  }, [enrichedConversations, searchQuery])

  // === RENDU PRINCIPAL DU COMPOSANT ===
  return (
    <div className="flex h-full w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden relative">

      {/* Background decorations for Glassmorphism */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-blue-100/40 blur-3xl opacity-50 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-100/40 blur-3xl opacity-50 mix-blend-multiply pointer-events-none" />

      {/* === COLONNE DE GAUCHE : LISTE DES CONVERSATIONS === */}
      <div className={cn(
        "h-full w-full shrink-0 md:w-[360px] md:block md:shrink-0",
        showChatMobile && "hidden md:block"
      )}>
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

      {/* === COLONNE DE DROITE : ZONE DE CHAT === */}
      <div className={cn("flex-1 flex flex-col h-full relative z-10", !showChatMobile && "hidden md:block")}>
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/40 flex items-center justify-between bg-white/70 backdrop-blur-xl z-20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] shrink-0">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden -ml-2 hover:bg-slate-100/50 h-8 w-8"
                  onClick={() => {
                    setShowChatMobile(false)
                    router.push('/messages', { scroll: false })
                  }}
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
                    onlineUserIds.has(selectedConv.other_participant.user_id) 
                      ? "bg-emerald-500" 
                      : "bg-slate-300"
                  )} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 leading-tight">
                    {selectedConv.other_participant.first_name} {selectedConv.other_participant.last_name}
                  </h2>
                  <span className={cn(
                    "text-[11px] font-semibold",
                    onlineUserIds.has(selectedConv.other_participant.user_id)
                      ? "text-emerald-600"
                      : "text-slate-400"
                  )}>
                    {onlineUserIds.has(selectedConv.other_participant.user_id) ? "En ligne" : "Hors ligne"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary hover:bg-primary/5 h-9 w-9 rounded-xl hidden md:flex" title="Appel vidéo">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary hover:bg-primary/5 h-9 w-9 rounded-xl hidden md:flex" title="Appel audio">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary hover:bg-primary/5 h-9 w-9 rounded-xl hidden md:flex" title="Rechercher dans la discussion">
                  <Search className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 h-9 w-9 rounded-xl">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-slate-100">
                    <DropdownMenuItem
                      className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 rounded-lg"
                      onClick={() => setIsMediationOpen(true)}
                    >
                      <Gavel className="mr-2 h-4 w-4" /> Demander médiation
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg animate-none cursor-pointer"
                      onClick={() => handleDeleteConversation()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Supprimer discussion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            {loadingMsgs ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-slate-50/10 backdrop-blur-sm">
                <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
                <p className="text-sm text-slate-500 font-medium">Chargement des messages...</p>
              </div>
            ) : (
              <MessageList
                messages={messages}
                currentUserId={currentUserId || ''}
                onEditMessage={handleStartEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onResendMessage={handleResendMessage}
              />
            )}

            {/* Input */}
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

      {/* === PANNEAU DÉCORATIF DE DROITE : SUR DESKTOP UNIQUEMENT === */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50/30 backdrop-blur-md p-8 text-center h-full border-l border-slate-100/50 relative z-10">
        <div className="w-24 h-24 bg-white/80 backdrop-blur-sm shadow-xl shadow-indigo-100/30 rounded-3xl flex items-center justify-center mb-6 border border-slate-100/80 transition-all duration-300 hover:scale-105">
          <MessageSquare className="h-10 w-10 text-primary/60" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Vos Messages</h2>
        <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
          Sélectionnez une discussion dans le panneau pour commencer à échanger de manière sécurisée.
        </p>
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

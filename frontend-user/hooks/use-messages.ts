/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook personnalisé pour orchestrer la logique de messagerie en temps réel, présence et actions locales.
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { captureError } from "@/lib/observability"
import type { Conversation, Message } from "@/components/messages/types"
import {
  fetchConversations,
  fetchConversationMessages,
  requestMediation,
  deleteConversation,
} from "@/features/messages/messagesApi"
import { useCurrentUserId } from "@/features/messages/useCurrentUserId"
import { useMessagesRealtime } from "@/features/messages/useMessagesRealtime"
import { useConversationActions } from "@/hooks/use-conversation-actions"

export function useMessages() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const contactId = searchParams.get("contact") || searchParams.get("user")
  const convIdFromUrl = searchParams.get("conv")

  const supabase = useMemo(() => createClient(), [])
  const currentUserId = useCurrentUserId()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [groupPanelOpen, setGroupPanelOpen] = useState(false)

  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConv, setLoadingConv] = useState(true)
  // Distingue une panne réseau/API réelle d'une boîte de réception légitimement
  // vide : les deux laissaient `conversations` à [], donc le même message
  // « Aucune conversation pour le moment » s'affichait dans les deux cas.
  const [conversationsError, setConversationsError] = useState(false)
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

  // Synchro locale des méta du groupe éditées dans le panneau.
  const handleGroupUpdated = useCallback((patch: Partial<Conversation>) => {
    setSelectedConv((prev) => (prev ? { ...prev, ...patch } : prev))
    setConversations((prev) => prev.map((c) => {
      if (!selectedConv || c.id !== selectedConv.id) return c
      const next = { ...c, ...patch }
      if (patch.name && next.other_participant) {
        next.other_participant = { ...next.other_participant, first_name: patch.name }
      }
      return next
    }))
  }, [selectedConv])

  // L'utilisateur a quitté / supprimé le groupe : on le retire de la liste et on ferme.
  const handleGroupLeft = useCallback((conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId))
    setSelectedConv((prev) => (prev?.id === conversationId ? null : prev))
    setShowChatMobile(false)
    router.push("/messages", { scroll: false })
  }, [router])

  const handleGroupCreated = async (groupId: string) => {
    try {
      const data = await fetchConversations()
      setConversations(data)
      const group = data.find((c) => c.id === groupId)
      if (group) {
        setSelectedConv(group)
        setShowChatMobile(true)
        router.push(`/messages?conv=${groupId}`, { scroll: false })
      }
    } catch {
      // silencieux
    }
  }

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
    let active = true
    const load = async () => {
      if (!currentUserId) return
      setLoadingConv(true)
      setConversationsError(false)
      try {
        const data = await fetchConversations()
        if (!active) return
        setConversations(data)

        if (contactId) {
          const { data: profileData } = await supabase
            .from("public_profiles")
            .select("user_id, first_name, last_name, avatar_url")
            .or(`id.eq.${contactId},user_id.eq.${contactId}`)
            .maybeSingle()

          if (!active) return
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
                avatar_url: profileData?.avatar_url || "/profil/avatar.jpg",
              },
            })
            setShowChatMobile(true)
          }
        } else if (convIdFromUrl) {
          const existing = data.find((c: Conversation) => c.id === convIdFromUrl)
          if (existing && active) {
            setSelectedConv(existing)
            setShowChatMobile(true)
          }
        }
      } catch (err) {
        captureError(err, { scope: "messages", action: "fetchConversations" })
        if (active) setConversationsError(true)
      } finally {
        if (active) {
          setLoadingConv(false)
        }
      }
    }
    load()

    return () => {
      active = false
    }
  }, [currentUserId, contactId, convIdFromUrl, supabase])

  // Load Messages
  useEffect(() => {
    const convId = selectedConv?.id
    if (!convId || convId.startsWith("new-")) { setMessages([]); return }
    let active = true
    const load = async () => {
      setLoadingMsgs(true)
      try {
        const data = await fetchConversationMessages(convId)
        if (active) {
          setMessages(data)
          markMessagesAsRead(convId)
        }
      } catch (err) {
        captureError(err, { scope: "messages", action: "fetchMessages" })
      } finally {
        if (active) {
          setLoadingMsgs(false)
        }
      }
    }
    load()

    return () => {
      active = false
    }
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
  const selectedConvIdRef = useRef<string | null>(null)
  useEffect(() => { selectedConvIdRef.current = selectedConv?.id ?? null }, [selectedConv?.id])

  const hasConnectedRef = useRef(false)
  useEffect(() => {
    if (!realtime.realtimeConnected) return
    if (!hasConnectedRef.current) {
      hasConnectedRef.current = true
      return
    }
    fetchConversations().then((data) => setConversations(data)).catch(() => undefined)
    const convId = selectedConvIdRef.current
    if (convId && !convId.startsWith("new-")) {
      fetchConversationMessages(convId)
        .then((data) => { setMessages(data); markMessagesAsRead(convId) })
        .catch(() => undefined)
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

  return {
    conversations,
    selectedConv,
    setSelectedConv,
    showNewGroup,
    setShowNewGroup,
    groupPanelOpen,
    setGroupPanelOpen,
    messages,
    loadingConv,
    conversationsError,
    loadingMsgs,
    searchQuery,
    setSearchQuery,
    showChatMobile,
    setShowChatMobile,
    isMediationOpen,
    setIsMediationOpen,
    isMediationLoading,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    onlineUserIds,
    inChatSearchOpen,
    setInChatSearchOpen,
    inChatQuery,
    setInChatQuery,
    editingMessage,
    setEditingMessage,
    handleGroupUpdated,
    handleGroupLeft,
    handleGroupCreated,
    displayedMessages,
    handleTogglePin,
    handleToggleArchive,
    handleRequestMediation,
    handleDeleteConversation,
    confirmDeleteConversation,
    handleSendMessage,
    handleEditMessage,
    handleDeleteMessage,
    handleResendMessage,
    onStartEdit,
    realtimeConnected: realtime.realtimeConnected,
    currentUserId,
    filteredConversations,
  }
}

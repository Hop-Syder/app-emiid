/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de messagerie refactorisée et modulaire (Version Complète & Robuste)
 * @created 2026-05-11
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, MoreHorizontal, Gavel, Trash2 } from "lucide-react"
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
  const contactId = searchParams.get("contact") || searchParams.get("user")

  const supabase = useMemo(() => createClient(), [])
  const currentUserId = useCurrentUserId()

  // State
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

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastConvIdRef = useRef<string | null>(null)

  const scrollToBottom = useCallback((behavior: "smooth" | "auto" = "smooth") => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior })
    }, 100)
  }, [])

  useEffect(() => {
    if (!selectedConv) return
    const isSameConv = lastConvIdRef.current === selectedConv.id
    lastConvIdRef.current = selectedConv.id
    scrollToBottom(isSameConv ? "smooth" : "auto")
  }, [messages, selectedConv?.id, scrollToBottom])

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
        } else if (data.length > 0) {
          setSelectedConv(prev => prev || data[0])
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

  // Realtime
  const realtime = useMessagesRealtime(currentUserId, {
    onPresenceChange: () => {
      // Pour l'instant on ne gère pas visuellement la présence ici
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
          // Si la conversation n'est pas dans la liste locale (ex: nouveau contact initié par un tiers),
          // on recharge la liste depuis le serveur.
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
        return next.sort((a, b) => {
          const dateA = new Date(a.last_message_at || a.updated_at).getTime()
          const dateB = new Date(b.last_message_at || b.updated_at).getTime()
          return dateB - dateA
        })
      })
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

  const sendMessageToDB = async (content: string, receiverId: string, convId: string) => {
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

    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString()
      })
      .eq('id', convId)

    return newMsg
  }

  const handleFileUpload = async (file: File, convId: string) => {
    if (!selectedConv || !currentUserId) return
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
      setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
      toast.success("Fichier envoyé", { id: uploadToastId })
      return newMsg
    } catch (err) {
      console.error(err)
      toast.error("Échec de l'upload", { id: uploadToastId })
      throw err
    }
  }

  const handleSendMessage = async (content: string, file?: File) => {
    if (!selectedConv || (!content.trim() && !file)) return
    
    const isNewConv = selectedConv.id.startsWith('new-')
    try {
      const convId = await getOrCreateConversationId(selectedConv.other_participant.user_id)
      let newMsg: any

      if (file) {
        newMsg = await handleFileUpload(file, convId)
      } else {
        newMsg = await sendMessageToDB(content, selectedConv.other_participant.user_id, convId)
        setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
      }

      if (isNewConv && newMsg) {
        // Recharger les conversations pour avoir la vraie conversation créée avec les vrais profils
        const updatedConvs = await fetchConversations()
        setConversations(updatedConvs)
        
        // Trouver la conversation nouvellement créée
        const newRealConv = updatedConvs.find(c => c.id === convId)
        if (newRealConv) {
          setSelectedConv(newRealConv)
        } else {
          // Fallback
          setSelectedConv(prev => prev ? { ...prev, id: convId } : null)
        }
      }
      scrollToBottom()
    } catch (err: any) {
      console.error(err)
      toast.error(`Échec de l'envoi: ${err?.message || JSON.stringify(err)}`)
    }
  }

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

  const handleDeleteConversation = () => {
    setIsDeleteConfirmOpen(true)
  }

  const confirmDeleteConversation = async () => {
    if (!selectedConv) return
    setIsDeleteConfirmOpen(false)
    try {
      await deleteConversation(selectedConv.id)
      setConversations(prev => prev.filter(c => c.id !== selectedConv.id))
      setSelectedConv(null)
      setShowChatMobile(false)
      toast.success("Conversation supprimée")
    } catch {
      toast.error("Erreur lors de la suppression")
    }
  }

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations
    return conversations.filter(c => 
      `${c.other_participant.first_name} ${c.other_participant.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden rounded-xl shadow-2xl border border-slate-200">
      {/* Sidebar */}
      <div className={cn("md:block", showChatMobile ? "hidden" : "block w-full")}>
        <ChatSidebar
          conversations={filteredConversations}
          activeId={selectedConv?.id || null}
          onSelect={(conv) => {
            setSelectedConv(conv)
            setShowChatMobile(true)
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={loadingConv}
        />
      </div>

      {/* Main Chat */}
      <div className={cn("flex-1 flex flex-col h-full bg-white relative", !showChatMobile && "hidden md:flex")}>
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden" 
                  onClick={() => setShowChatMobile(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 ring-2 ring-indigo-50">
                  <AvatarImage src={selectedConv.other_participant.avatar_url} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                    {selectedConv.other_participant.first_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    {selectedConv.other_participant.first_name} {selectedConv.other_participant.last_name}
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-medium">En ligne</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-400">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100">
                    <DropdownMenuItem 
                      className="text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                      onClick={() => setIsMediationOpen(true)}
                    >
                      <Gavel className="mr-2 h-4 w-4" /> Demander médiation
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-700 focus:bg-red-50"
                      onClick={handleDeleteConversation}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Supprimer discussion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            {loadingMsgs ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-slate-50/30">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
                <p className="text-sm text-slate-500 font-medium italic">Chargement de vos messages...</p>
              </div>
            ) : (
              <MessageList 
                messages={messages} 
                currentUserId={currentUserId || ''} 
                scrollRef={messagesEndRef} 
              />
            )}

            {/* Input */}
            <MessageInput 
              onSend={handleSendMessage} 
              isDisabled={!realtime.realtimeConnected} 
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-8 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <Avatar className="h-12 w-12 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Vos Messages</h2>
            <p className="text-slate-500 max-w-xs text-sm">
              Sélectionnez une conversation pour commencer à échanger avec votre réseau.
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

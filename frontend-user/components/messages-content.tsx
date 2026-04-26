/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de messagerie moderne avec statuts lu/non-lu et indicateur en ligne
 * @created 2025-12-24
 * @updated 2026-03-18
 */

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import {
  Loader2, Send, Search, Image, Paperclip, 
  MoreHorizontal, ArrowLeft, Check, CheckCheck, X, Plus,
  Settings, Bell, Pin, Trash2, Archive, Star, Shield, Gavel, AlertTriangle,
  FileText, Smile, MessageSquare, User
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { fetchWithAuth, readApiError } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Conversation, Message } from "@/types"

// Supprimé les mocks et generateMockMessages qui ne sont plus nécessaires
const supabase = createClient()

export function MessagesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const contactId = searchParams.get("contact") || searchParams.get("user")

  const [message, setMessage] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConv, setLoadingConv] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showChatMobile, setShowChatMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "unread" | "pinned">("all")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  const [isMediationDialogOpen, setIsMediationDialogOpen] = useState(false)
  const [mediationReason, setMediationReason] = useState("")
  const [convToMediate, setConvToMediate] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mediationActive = messages.some((msg) => msg.content.startsWith("⚠️ [MÉDIATION DEMANDÉE]"))

  const upsertConversation = useCallback((conversation: Conversation) => {
    setConversations(prev => {
      const isPinned = prev.find(c => c.id === conversation.id)?.isPinned || false;
      const next = prev.filter(conv => conv.id !== conversation.id)
      return [{ ...conversation, isPinned }, ...next]
    })
  }, [])

  // Marquer comme lu
  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!currentUserId) return;
    try {
      setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })))
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ))

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId);
    } catch (err) {
      console.error("Error marking as read:", err)
      setSyncError("Échec de la synchronisation lecture")
    }
  }, [currentUserId])

  // 1. Charger les conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!currentUserId) return;
      setLoadingConv(true)
      try {
        const res = await fetchWithAuth("/api/messages/conversations")
        if (!res.ok) throw new Error("Erreur backend")
        
        const data = await res.json()
        const pinnedIds = JSON.parse(localStorage.getItem(`emiid_pinned_convs_${currentUserId}`) || "[]")
        const formatted = data.map((c: Conversation) => ({
          ...c,
          isPinned: pinnedIds.includes(c.id)
        }))
        
        setConversations(formatted);

        if (contactId) {
            const existing = formatted.find((c: Conversation) => c.otherUser.id === contactId)
            if (existing) {
              setSelectedConv(existing)
              setShowChatMobile(true)
            } else {
              // Créer une conversation temporaire si c'est un nouveau contact
              setSelectedConv({
                id: `new-conv-${contactId}`,
                otherUser: {
                  id: contactId,
                  name: "Chargement...", // Sera mis à jour ou restera ainsi jusqu'au premier message
                  avatar: null,
                  role: null,
                  isOnline: false,
                  lastSeen: null
                },
                lastMessage: "Envoyez le premier message...",
                lastMessageAt: new Date().toISOString(),
                unreadCount: 0,
                isPinned: false
              })
              setShowChatMobile(true)
            }
        } else if (!selectedConv && formatted.length > 0) {
            setSelectedConv(formatted[0])
        }

      } catch (err) {
        console.error("Error loading convs:", err)
        toast.error("Impossible de charger les conversations")
        setSyncError("Erreur de chargement des conversations")
      } finally {
        setLoadingConv(false)
      }
    }
    
    if (currentUserId) {
        loadConversations()
    } else {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            setCurrentUserId(user.id)
          }
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  // 2. Charger les messages
  useEffect(() => {
    if (!selectedConv) return

    const loadMessages = async () => {
      if (selectedConv.id.startsWith('new-')) {
        setMessages([])
        setLoadingMsgs(false)
        return
      }
      setLoadingMsgs(true)
      try {
        const res = await fetchWithAuth(`/api/messages/conversation/${selectedConv.id}`)
        if (!res.ok) throw new Error("Erreur messages")
        
        const data = await res.json()
        setMessages(data || [])
        setSyncError(null)
        markMessagesAsRead(selectedConv.id)
      } catch (err) {
        console.error("Error loading msgs:", err)
        // On ne toast pas ici pour éviter de polluer si c'est une erreur de transition
      } finally {
        setLoadingMsgs(false)
      }
    }
    loadMessages()
  }, [selectedConv, markMessagesAsRead])

  // 3. Temps réel & Presence
  useEffect(() => {
    if (!currentUserId) return

    const globalChannel = supabase.channel(`user-presence-global`)

    globalChannel
      .on('presence', { event: 'sync' }, () => {
        const state = globalChannel.presenceState()
        const onlineIds = new Set<string>()
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.user_id) onlineIds.add(p.user_id)
          })
        })
        
        setOnlineUsers(onlineIds)
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMsg = payload.new as Message
          
          // Vérifier si cette conversation nous concerne
          setConversations(prev => {
            const convIndex = prev.findIndex(c => c.id === newMsg.conversation_id)
            
            if (convIndex === -1) {
              void fetchWithAuth("/api/messages/conversations").then(async res => {
                if (res.ok) setConversations(await res.json())
              })
              return prev
            }

            const next = [...prev]
            const updated = {
              ...next[convIndex],
              lastMessage: newMsg.content,
              lastMessageAt: newMsg.created_at,
              unreadCount: newMsg.sender_id !== currentUserId ? next[convIndex].unreadCount + 1 : next[convIndex].unreadCount
            }
            next.splice(convIndex, 1)
            return [updated, ...next]
          })

          if (selectedConv && (newMsg.conversation_id === selectedConv.id)) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
            if (newMsg.sender_id !== currentUserId) {
              markMessagesAsRead(selectedConv.id)
            }
          }
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true)
          setConnectionNotice(null)
          
          // Tracker notre presence
          await globalChannel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          })
          return
        }

        if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          setRealtimeConnected(false)
          setConnectionNotice("Temps réel indisponible. La messagerie passe en synchronisation automatique.")
        }
      })

    return () => {
      setRealtimeConnected(false)
      supabase.removeChannel(globalChannel)
    }
  }, [currentUserId, selectedConv, markMessagesAsRead])

  useEffect(() => {
    if (!currentUserId || realtimeConnected) return

    const intervalId = window.setInterval(async () => {
      try {
        const convRes = await fetchWithAuth("/api/messages/conversations")
        if (convRes.ok) {
          const data = await convRes.json()
          const pinnedIds = JSON.parse(localStorage.getItem(`emiid_pinned_convs_${currentUserId}`) || "[]")
          const enrichedData = data.map((c: any) => ({
            ...c,
            isPinned: pinnedIds.includes(c.id)
          }))
          setConversations(enrichedData)

          if (selectedConv) {
            const refreshedConversation = enrichedData.find((conversation: Conversation) =>
              conversation.id === selectedConv.id || conversation.otherUser.id === selectedConv.otherUser.id,
            )

            if (refreshedConversation && refreshedConversation.id !== selectedConv.id) {
              setSelectedConv(refreshedConversation)
            }
          }
        }

        if (!selectedConv || selectedConv.id.startsWith('new-')) {
          return
        }

        const msgRes = await fetchWithAuth(`/api/messages/conversation/${selectedConv.id}`)
        if (!msgRes.ok) {
          return
        }

        const data = await msgRes.json()
        setSyncError(null)
        setMessages(prev => {
          const previousLastId = prev[prev.length - 1]?.id
          const nextLastId = data[data.length - 1]?.id

          if (prev.length === data.length && previousLastId === nextLastId) {
            return prev
          }

          return data
        })

        if (data.some((msg: Message) => !msg.is_read && msg.sender_id !== currentUserId)) {
          void markMessagesAsRead(selectedConv.id)
        }
      } catch (error) {
        console.error("Realtime fallback refresh error:", error)
        setSyncError("Impossible de synchroniser les nouveaux messages pour le moment.")
      }
    }, 3000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [currentUserId, realtimeConnected, selectedConv, markMessagesAsRead])

  // 4. Scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessageToDB = async (content: string, receiverId: string) => {
      if (!currentUserId) throw new Error("Non authentifié");
      let convId = selectedConv?.id;
      
      if (!convId || convId.startsWith('new-')) {
         const p1 = currentUserId < receiverId ? currentUserId : receiverId;
         const p2 = currentUserId < receiverId ? receiverId : currentUserId;

         const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .eq('participant1_id', p1)
            .eq('participant2_id', p2)
            .single();
            
         if (!existingConv) {
             const { data: newConv, error: createError } = await supabase
                .from('conversations')
                .insert({ participant1_id: p1, participant2_id: p2 })
                .select('id')
                .single();
             if (createError) throw createError;
             convId = newConv.id;
         } else {
             convId = existingConv.id;
         }
      }

      const { data: newMsg, error: msgError } = await supabase
          .from('messages')
          .insert({
              conversation_id: convId,
              sender_id: currentUserId,
              content: content,
              is_read: false,
          })
          .select()
          .single();

      if (msgError) throw msgError;

      await supabase
          .from('conversations')
          .update({
              last_message_content: content,
              last_message_at: new Date().toISOString()
          })
          .eq('id', convId);

      return newMsg;
  }

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConv || isSending || !currentUserId) return

    setIsSending(true)
    try {
      const content = message.trim()
      const newMsg = await sendMessageToDB(content, selectedConv.otherUser.id);

      setSyncError(null)

      const updatedConversation = {
        ...selectedConv,
        id: newMsg.conversation_id,
        lastMessage: newMsg.content,
        lastMessageAt: newMsg.created_at,
        unreadCount: 0,
      }

      setSelectedConv(updatedConversation)
      upsertConversation(updatedConversation)

      setMessages(prev => prev.some(existingMessage => existingMessage.id === newMsg.id) ? prev : [...prev, newMsg])
      setMessage("")
    } catch (err) {
      console.error("Send error:", err)
      toast.error("Erreur lors de l'envoi")
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = async (file: File, type: "image" | "file") => {
    if (!selectedConv || !file || !currentUserId) return

    // VALIDATION : Taille Max
    const maxSize = type === "image" ? 5 * 1024 * 1024 : 10 * 1024 * 1024 // 5MB image, 10MB file
    if (file.size > maxSize) {
      toast.error(`Fichier trop volumineux (Max ${type === "image" ? "5MB" : "10MB"})`)
      return
    }

    // VALIDATION : Type Fichier
    if (type === "image" && !file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide")
      return
    }

    setIsSending(true)
    const uploadToastId = toast.loading(`Envoi de l'${type === "image" ? "image" : "fichier"}...`)
    
    try {
      const extension = file.name.split(".").pop()
      const convFolder = selectedConv.id.startsWith('new-') ? `initial-${selectedConv.otherUser.id}` : `conversation-${selectedConv.id}`
      const filePath = `${convFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

      // Tentative d'upload
      const { error: uploadError } = await supabase.storage.from("messages").upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
      
      if (uploadError) {
        console.error("Supabase Storage Error:", uploadError)
        throw new Error(`Erreur de stockage: ${uploadError.message}`)
      }

      // Récupération de l'URL publique
      const { data: publicUrlData } = supabase.storage.from("messages").getPublicUrl(filePath)
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Impossible de générer l'URL du fichier")
      }

      const publicUrl = publicUrlData.publicUrl
      const content = type === "image" ? `[Image] ${publicUrl}` : `[Fichier] ${file.name} - ${publicUrl}`

      // Enregistrement dans la DB
      const newMsg = await sendMessageToDB(content, selectedConv.otherUser.id)
      
      setSyncError(null)

      const updatedConversation = {
        ...selectedConv,
        id: newMsg.conversation_id,
        lastMessage: newMsg.content,
        lastMessageAt: newMsg.created_at,
        unreadCount: 0,
      }

      setSelectedConv(updatedConversation)
      upsertConversation(updatedConversation)

      setMessages((prev) => prev.some(existingMessage => existingMessage.id === newMsg.id) ? prev : [...prev, newMsg])
      toast.success(`${type === "image" ? "Image envoyée" : "Fichier envoyé"}`, { id: uploadToastId })
    } catch (err: any) {
      console.error("Detailed Upload error:", err)
      toast.error(err.message || "Erreur de partage du fichier", { id: uploadToastId })
    } finally {
      setIsSending(false)
      if (imageInputRef.current) imageInputRef.current.value = ""
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleContactSupport = async () => {
    try {
      const res = await fetchWithAuth("/api/messages/support")
      if (res.ok) {
        const supportUser = await res.json()
        const existing = conversations.find(c => c.otherUser.id === supportUser.id)

        if (existing) {
          setSelectedConv(existing)
        } else {
          setSelectedConv({
            id: 'new-support',
            otherUser: {
              id: supportUser.id,
              name: supportUser.name || "Service Client EmiID",
              avatar: supportUser.avatar || "/nexus-support.png",
              role: "Support Technique",
              isOnline: true,
              lastSeen: null
            },
            lastMessage: "",
            lastMessageAt: new Date().toISOString(),
            unreadCount: 0
          })
          setMessages([])
        }
        setShowChatMobile(true)
      } else {
        toast.error(await readApiError(res, "Support indisponible"))
      }
    } catch (err) {
      console.error("Support error:", err)
      toast.error("Support indisponible")
    }
  }

  const handleInviteAdmin = (conversationId: string) => {
    setConvToMediate(conversationId)
    setIsMediationDialogOpen(true)
  }

  const handleDeleteConversation = async (convId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette conversation et tous ses messages ?")) return
    
    try {
      const res = await fetchWithAuth(`/api/messages/conversation/${convId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== convId))
        if (selectedConv?.id === convId) {
          setSelectedConv(null)
          setMessages([])
        }
        toast.success("Conversation supprimée")
      } else {
        toast.error("Erreur lors de la suppression")
      }
    } catch (err) {
      toast.error("Erreur de connexion")
    }
  }

  const submitMediation = async () => {
    if (!convToMediate || !mediationReason) return
    setIsSending(true)
    try {
      const res = await fetchWithAuth(`/api/messages/dispute/${convToMediate}`, {
        method: "POST",
        body: JSON.stringify({ reason: mediationReason })
      })
      if (res.ok) {
        toast.success("Demande de médiation envoyée. Un administrateur rejoindra la discussion prochainement.")
        setIsMediationDialogOpen(false)
        setMediationReason("")
      } else {
        toast.error(await readApiError(res, "Impossible d'inviter l'admin"))
      }
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setIsSending(false)
    }
  }

  // Toggle pin with persistence
  const togglePin = (convId: string) => {
    if (!currentUserId) return;
    
    setConversations(prev => {
      const next = prev.map(conv =>
        conv.id === convId ? { ...conv, isPinned: !conv.isPinned } : conv
      );
      
      // Persister dans localStorage
      const pinnedIds = next.filter(c => c.isPinned).map(c => c.id);
      localStorage.setItem(`emiid_pinned_convs_${currentUserId}`, JSON.stringify(pinnedIds));
      
      return next;
    })
  }

  // Filtrer les conversations
  const filteredConversations = conversations
    .filter(conv => {
      const matchesSearch = conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter =
        filterType === "all" ? true :
          filterType === "unread" ? conv.unreadCount > 0 :
            filterType === "pinned" ? conv.isPinned : true
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
    })

  // Format temps relatif
  const formatTime = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Maintenant"
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}j`
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return "Hors ligne"
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 5) return "En ligne recemment"
    if (diffMins < 60) return `Vu il y a ${diffMins}min`
    if (diffHours < 24) return `Vu il y a ${diffHours}h`
    return `Vu le ${date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  // Total non lus
  const totalUnread = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)

  return (
    <TooltipProvider>
      <div className="fixed inset-0 top-[4rem] z-40 flex bg-background md:relative md:top-auto md:z-auto md:h-[calc(100vh-8rem)] md:rounded-2xl md:border shadow-sm overflow-hidden">

        {/* Sidebar - Liste des conversations */}
        <aside className={cn(
          "w-full md:w-[340px] lg:w-[380px] flex flex-col border-r bg-card shrink-0",
          showChatMobile && "hidden md:flex"
        )}>
          {/* Header Sidebar */}
          <header className="p-4 lg:p-6 border-b bg-white/50 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Messages</h1>
                {totalUnread > 0 && (
                  <Badge className="h-6 px-2 rounded-full bg-primary text-white text-[10px] font-black border-none">
                    {totalUnread}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 transition-colors">
                      <Settings className="h-4 w-4 text-slate-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Paramètres</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all shadow-sm"
                      onClick={handleContactSupport}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Nouveau message</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Recherche */}
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher une discussion..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-slate-100/50 border-slate-100 focus-visible:ring-primary/20 transition-all font-medium text-sm"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
              {[
                { key: "all", label: "Tous" },
                { key: "unread", label: "Non lus" },
                { key: "pinned", label: "Épinglés" },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={filterType === filter.key ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shrink-0",
                    filterType === filter.key
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  )}
                  onClick={() => setFilterType(filter.key as typeof filterType)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </header>

          {/* Liste des conversations */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {loadingConv ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                      <div className="w-12 h-12 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-32 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length > 0 ? (
                <div className="space-y-1">
                  {filteredConversations.map((conv) => {
                    const isSelected = selectedConv?.id === conv.id
                    const isOnline = onlineUsers.has(conv.otherUser.id)

                    return (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => {
                          setSelectedConv(conv)
                          setShowChatMobile(true)
                        }}
                        className={cn(
                          "relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group",
                          isSelected
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted/60"
                        )}
                      >
                        {/* Avatar avec indicateur en ligne */}
                        <div className="relative shrink-0">
                          <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                            <AvatarImage src={conv.otherUser.avatar || undefined} className="object-cover" />
                            <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                              {conv.otherUser.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className={cn(
                            "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background",
                            isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
                          )}>
                            {isOnline && (
                              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                            )}
                          </span>
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {conv.isPinned && (
                                <Pin className="h-3 w-3 text-primary shrink-0" />
                              )}
                              <span className={cn(
                                "font-semibold text-sm truncate",
                                conv.unreadCount > 0 ? "text-foreground" : "text-foreground/80"
                              )}>
                                {conv.otherUser.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground shrink-0">
                              {formatTime(conv.lastMessageAt)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <p className={cn(
                              "text-xs truncate",
                              conv.unreadCount > 0
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                            )}>
                              {conv.lastMessage || "Demarrer une conversation"}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Menu contextuel */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem onClick={() => togglePin(conv.id)} className="rounded-lg">
                              <Pin className="h-4 w-4 mr-2" />
                              {conv.isPinned ? "Desepingler" : "Epingler"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg">
                              <Bell className="h-4 w-4 mr-2" />
                              {conv.isMuted ? "Reactiver" : "Mettre en sourdine"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg">
                              <Archive className="h-4 w-4 mr-2" />
                              Archiver
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="rounded-lg text-destructive focus:text-destructive cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conv.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Aucune conversation
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {searchQuery
                      ? "Aucun resultat pour cette recherche"
                      : "Commencez une nouvelle discussion"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Zone de chat */}
        <main className={cn(
          "flex-1 w-full min-w-0 min-h-0 flex flex-col bg-muted/20 pb-[env(safe-area-inset-bottom)] md:pb-0 relative",
          !showChatMobile && "hidden md:flex"
        )}>
          {selectedConv ? (
            <>
              {/* Header Chat */}
              <header className="h-[72px] px-4 lg:px-8 flex items-center justify-between border-b bg-white/80 backdrop-blur-md sticky top-0 z-30">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-10 w-10 rounded-xl hover:bg-slate-100"
                    onClick={() => setShowChatMobile(false)}
                  >
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                  </Button>

                  <div className="relative group cursor-pointer" onClick={() => router.push(`/profil/${selectedConv.otherUser.id}`)}>
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Avatar className="h-11 w-11 border-2 border-white shadow-md relative z-10">
                      <AvatarImage src={selectedConv.otherUser.avatar || undefined} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary font-black">
                        {selectedConv.otherUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className={cn(
                      "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white z-20",
                      onlineUsers.has(selectedConv.otherUser.id) ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-300"
                    )} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <h2 className="font-black text-sm text-slate-900 truncate tracking-tight">
                        {selectedConv.otherUser.name}
                      </h2>
                      {mediationActive && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none shadow-sm shadow-orange-500/20 px-2 py-0.5 hidden sm:inline-flex animate-pulse items-center text-[9px] font-black uppercase tracking-wider">
                          <Shield className="w-2.5 h-2.5 mr-1" />
                          Médiation
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] font-bold">
                      {onlineUsers.has(selectedConv.otherUser.id)
                        ? <span className="text-emerald-600">En ligne maintenant</span>
                        : <span className="text-slate-400">{formatLastSeen(selectedConv.otherUser.lastSeen)}</span>
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                        onClick={() => toast.info("Profil", { description: "Ouverture du profil..." })}
                      >
                        <User className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voir le profil</TooltipContent>
                  </Tooltip>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-slate-100 transition-all">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100">
                      <DropdownMenuItem className="rounded-xl py-2.5 font-bold text-xs text-slate-600">
                        <Star className="h-4 w-4 mr-3 text-amber-500" />
                        Messages importants
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl py-2.5 font-bold text-xs text-slate-600">
                        <Search className="h-4 w-4 mr-3 text-slate-400" />
                        Rechercher dans le chat
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 opacity-50" />
                      <DropdownMenuItem
                        className="rounded-xl py-2.5 text-xs text-amber-600 focus:text-amber-600 font-black uppercase tracking-wider"
                        onClick={() => handleInviteAdmin(selectedConv.id)}
                      >
                        <Shield className="h-4 w-4 mr-3" />
                        Demander une médiation
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="rounded-xl py-2.5 text-xs text-destructive focus:text-destructive font-black uppercase tracking-wider cursor-pointer"
                        onClick={() => handleDeleteConversation(selectedConv.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        Supprimer le chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>

              {(connectionNotice || syncError || mediationActive) && (
                <div className="border-b bg-card px-4 py-3 lg:px-6">
                  <div className="space-y-2">
                    {connectionNotice && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        {connectionNotice}
                      </div>
                    )}
                    {syncError && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
                        {syncError}
                      </div>
                    )}
                    {mediationActive && (
                      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 shadow-sm">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-500" />
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-600 shadow-sm border border-amber-200">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-amber-950">
                              Médiation EmiID en cours
                            </h4>
                            <p className="text-[11px] sm:text-xs font-medium text-amber-900/70 mt-0.5 leading-relaxed">
                              Un administrateur accompagne cette conversation afin de garantir la sécurité et la sérénité de vos échanges.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1 px-4 lg:px-6 py-4">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground">Chargement...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {messages.map((msg, index) => {
                      const isOwn = msg.sender_id === currentUserId
                      const showAvatar = index === 0 || messages[index - 1]?.sender_id !== msg.sender_id
                      const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.sender_id !== msg.sender_id

                      const isMediation = msg.content.includes("[MÉDIATION DEMANDÉE]")

                      if (isMediation) {
                        return (
                          <div key={msg.id} className="flex justify-center my-6 sm:my-8 px-4">
                            <div className="relative group w-full max-w-sm">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                              <div className="relative bg-white/95 backdrop-blur-sm border border-amber-200/50 rounded-2xl px-4 sm:px-5 py-3.5 flex items-center gap-3 sm:gap-4 shadow-sm">
                                <div className="flex bg-amber-50 border border-amber-100 p-2 sm:p-2.5 rounded-full shrink-0">
                                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                                </div>
                                <p className="text-[11px] sm:text-xs font-bold text-amber-950 leading-snug">
                                  {msg.content.replace("⚠️ [MÉDIATION DEMANDÉE] ", "")}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "flex gap-2.5",
                            isOwn ? "justify-end" : "justify-start"
                          )}
                        >
                          {!isOwn && (
                            <div className="w-8 shrink-0">
                              {showAvatar && (
                                <Avatar className="h-8 w-8 border border-border">
                                  <AvatarImage src={selectedConv.otherUser.avatar || undefined} className="object-cover" />
                                  <AvatarFallback className="text-xs bg-muted">
                                    {selectedConv.otherUser.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          )}

                          <div className={cn(
                            "max-w-[85%] sm:max-w-[70%]",
                            isOwn ? "items-end" : "items-start"
                          )}>
                            <div className={cn(
                              "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all",
                              isOwn
                                ? "bg-gradient-to-br from-primary to-primary/80 text-white rounded-tr-none"
                                : "bg-white/80 backdrop-blur-sm border border-slate-100 text-slate-800 rounded-tl-none"
                            )}>
                              {msg.content.startsWith('[Image]') ? (
                                <div className="space-y-2">
                                  <img
                                    src={msg.content.split(' ')[1]}
                                    className="rounded-xl max-w-full hover:scale-[1.02] transition-all cursor-pointer shadow-md border border-white/20"
                                    alt="Shared"
                                    onClick={() => window.open(msg.content.split(' ')[1], '_blank')}
                                  />
                                </div>
                              ) : msg.content.startsWith('[Fichier]') ? (
                                <div className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl border transition-all group/file",
                                  isOwn ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-100"
                                )}>
                                  <div className={cn(
                                    "p-2 rounded-lg shadow-inner",
                                    isOwn ? "bg-white/20" : "bg-primary/10"
                                  )}>
                                    <FileText className={cn("h-5 w-5", isOwn ? "text-white" : "text-primary")} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={cn("font-black text-xs truncate", isOwn ? "text-white" : "text-slate-900")}>
                                      {msg.content.split(' - ')[0].replace('[Fichier] ', '')}
                                    </p>
                                    <a
                                      href={msg.content.split(' - ')[1]}
                                      target="_blank"
                                      className={cn("text-[10px] font-bold uppercase tracking-wider hover:underline", isOwn ? "text-white/80" : "text-primary")}
                                    >
                                      Télécharger
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <p className="font-medium">{msg.content}</p>
                              )}
                            </div>

                            {isLastInGroup && (
                              <div className={cn(
                                "flex items-center gap-2 mt-1.5 px-1",
                                isOwn ? "justify-end" : "justify-start"
                              )}>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                  {formatMessageTime(msg.created_at)}
                                </span>
                                {isOwn && (
                                  <div className="flex items-center">
                                    {msg.is_read ? (
                                      <CheckCheck className="h-3.5 w-3.5 text-primary" />
                                    ) : (
                                      <Check className="h-3.5 w-3.5 text-slate-300" />
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <footer className="p-4 sm:p-6 border-t bg-white/80 backdrop-blur-md mt-auto shrink-0 z-30">
                <div className="flex items-end gap-3 w-full max-w-4xl mx-auto">
                  <div className="flex gap-1 shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-11 w-11 rounded-2xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Joindre un fichier</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-11 w-11 rounded-2xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          <Image className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Envoyer une image</TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex-1 min-w-0 relative group">
                    <div className="absolute inset-0 bg-primary/5 rounded-[20px] blur-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                    <Textarea
                      ref={inputRef}
                      placeholder="Tapez votre message ici..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="relative z-10 min-h-[48px] max-h-[150px] py-3.5 px-5 resize-none rounded-[20px] bg-slate-100/50 border-slate-100 focus:bg-white focus:border-primary/30 transition-all font-medium text-sm w-full leading-relaxed shadow-inner"
                      rows={1}
                    />
                    <div className="absolute right-3 bottom-2.5 flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all">
                        <Smile className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-2xl shrink-0 transition-all shadow-lg active:scale-95 flex items-center justify-center p-0",
                      message.trim() ? "bg-primary text-white shadow-primary/25" : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                    )}
                    onClick={handleSendMessage}
                    onPointerDown={(e) => {
                      // Empêche la perte de focus (et la fermeture du clavier sur mobile)
                      e.preventDefault()
                      if (message.trim() && !isSending) {
                        handleSendMessage()
                      }
                    }}
                    disabled={!message.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </footer>

              {/* Inputs cachés pour l'upload */}
              <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "image")} />
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "file")} />
            </>
          ) : (
            /* Etat vide - Aucune conversation selectionnee */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Vos messages
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Selectionnez une conversation ou demarrez une nouvelle discussion pour commencer a echanger.
              </p>
              <Button className="rounded-xl px-6">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle conversation
              </Button>
            </div>
          )}
        </main>

        {/* Modal de Médiation */}
        <Dialog open={isMediationDialogOpen} onOpenChange={setIsMediationDialogOpen}>
          <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden max-w-md bg-white">
            <div className="p-8 space-y-6">
              <DialogHeader className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 shadow-inner">
                  <Gavel className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Demande de Médiation</DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">
                    Un administrateur EmiID sera invité à rejoindre cette discussion pour vous aider à résoudre le litige.
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Motif de la demande</Label>
                  <Select onValueChange={setMediationReason} value={mediationReason}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-primary/20 font-bold">
                      <SelectValue placeholder="Choisir un motif..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="Litige sur un paiement" className="font-semibold py-3">Litige sur un paiement</SelectItem>
                      <SelectItem value="Désaccord sur les livrables" className="font-semibold py-3">Désaccord sur les livrables</SelectItem>
                      <SelectItem value="Comportement suspect ou suspect d'arnaque" className="font-semibold py-3">Comportement suspect</SelectItem>
                      <SelectItem value="Harcèlement ou propos déplacés" className="font-semibold py-3">Harcèlement / Propos déplacés</SelectItem>
                      <SelectItem value="Autre raison importante" className="font-semibold py-3">Autre raison...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-500 shrink-0" />
                  <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
                    Note : L&apos;administrateur aura accès à l&apos;historique complet de cette discussion pour mener à bien sa médiation.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="rounded-xl flex-1 h-12 font-bold" onClick={() => setIsMediationDialogOpen(false)}>Annuler</Button>
                <Button
                  className={cn(
                    "rounded-xl flex-[2] h-12 font-bold shadow-lg shadow-amber-200 transition-all",
                    mediationReason ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-slate-100 text-slate-400"
                  )}
                  disabled={!mediationReason || isSending}
                  onClick={submitMediation}
                >
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Inviter l'Admin"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  )
}

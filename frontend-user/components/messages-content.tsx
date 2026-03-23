/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de messagerie moderne avec statuts lu/non-lu et indicateur en ligne
 * @created 2025-12-24
 * @updated 2026-03-18
 */

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Loader2, Send, Search, Image, Paperclip, Smile, Mic, Phone, Video, 
  MoreHorizontal, ArrowLeft, Check, CheckCheck, X, Plus,
  Settings, Bell, Pin, Trash2, Archive, Star, Filter, Shield, Gavel, AlertTriangle
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { fetchWithAuth } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// Types
interface UserProfile {
  id: string
  name: string
  avatar: string | null
  role: string | null
  isOnline: boolean
  lastSeen: string | null
  isTyping?: boolean
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
  type?: "text" | "image" | "file" | "audio"
  reactions?: string[]
}

interface Conversation {
  id: string
  otherUser: UserProfile
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  isPinned?: boolean
  isMuted?: boolean
}

// Supprimé les mocks et generateMockMessages qui ne sont plus nécessaires
const supabase = createClient()

export function MessagesContent() {
  const searchParams = useSearchParams()
  const contactId = searchParams.get("contact")

  const [message, setMessage] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConv, setLoadingConv] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [supportId, setSupportId] = useState<string | null>(null)
  const [showChatMobile, setShowChatMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "unread" | "pinned">("all")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [isMediationDialogOpen, setIsMediationDialogOpen] = useState(false)
  const [mediationReason, setMediationReason] = useState("")
  const [convToMediate, setConvToMediate] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Marquer comme lu
  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    try {
      setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })))
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ))
      
      await fetchWithAuth(`/api/messages/read/${conversationId}`, { method: "POST" })
    } catch (err) {
      console.error("Error marking as read:", err)
    }
  }, [])

  // 1. Charger les conversations
  useEffect(() => {
    const loadConversations = async () => {
      setLoadingConv(true)
      try {
        const res = await fetchWithAuth("/api/messages/conversations")
        if (res.ok) {
          const data = await res.json()
          setConversations(data)
          
          const support = data.find((c: any) => c.otherUser.role?.toLowerCase().includes("admin") || c.otherUser.name.toLowerCase().includes("nexus"))
          if (support) setSupportId(support.otherUser.id)

          if (contactId) {
            const existing = data.find((c: any) => c.otherUser.id === contactId)
            if (existing) {
              setSelectedConv(existing)
              setShowChatMobile(true)
            } else {
              setSelectedConv({
                 id: `new-conv-${contactId}`,
                 otherUser: {
                    id: contactId,
                    name: "Nouvelle interaction",
                    avatar: null,
                    role: null,
                    isOnline: false,
                    lastSeen: null
                 },
                 lastMessage: "Envoyez le premier message...",
                 lastMessageAt: new Date().toISOString(),
                 unreadCount: 0
              })
              setShowChatMobile(true)
            }
          } else if (!selectedConv && data.length > 0) {
            setSelectedConv(data[0])
          }
        }
      } catch (err) {
        console.error("Error loading convs:", err)
      } finally {
        setLoadingConv(false)
      }
    }
    loadConversations()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id)
    })
  }, [])

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
        if (res.ok) {
          const data = await res.json()
          setMessages(data)
          markMessagesAsRead(selectedConv.id)
        }
      } catch (err) {
        console.error("Error loading msgs:", err)
      } finally {
        setLoadingMsgs(false)
      }
    }
    loadMessages()
  }, [selectedConv, markMessagesAsRead])

  // 3. Souscription Temps Réel (Supabase Realtime)
  useEffect(() => {
    if (!currentUserId) return

    // Canal global pour les notifications et mise à jour de la liste
    const globalChannel = supabase
      .channel(`user-messages-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const newMsg = payload.new as any
          
          // On ne s'intéresse qu'aux messages qu'on reçoit ou qu'on envoie
          // Note : Supabase Realtime ne filtre pas par défaut par RLS sur INSERT pour tout le monde si configuré ainsi
          // On vérifie donc si la conversation appartient à l'utilisateur
          
          const convRes = await fetchWithAuth("/api/messages/conversations")
          if (convRes.ok) {
            const data = await convRes.json()
            setConversations(data)
          }

          // Si c'est le message de la conversation active, on l'ajoute (si pas déjà fait par le canal spécifique)
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
      .subscribe()

    return () => {
      supabase.removeChannel(globalChannel)
    }
  }, [currentUserId, selectedConv, markMessagesAsRead])

  // 4. Scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConv || isSending) return

    setIsSending(true)
    try {
      const res = await fetchWithAuth("/api/messages/send", {
        method: "POST",
        body: JSON.stringify({
          receiverId: selectedConv.otherUser.id,
          content: message.trim()
        })
      })

      if (res.ok) {
        const newMsg = await res.json()
        
        // Si c'était une nouvelle conversation support, on rafraîchit
        if (selectedConv.id.startsWith('new-')) {
            const convRes = await fetchWithAuth("/api/messages/conversations")
            if (convRes.ok) {
                const convs = await convRes.json()
                setConversations(convs)
                const newRealConv = convs.find((c: any) => c.otherUser.id === selectedConv.otherUser.id)
                if (newRealConv) {
                    setSelectedConv(newRealConv)
                } else {
                    setSelectedConv({
                        id: newMsg.conversation_id,
                        otherUser: selectedConv.otherUser,
                        lastMessage: newMsg.content,
                        lastMessageAt: newMsg.created_at,
                        unreadCount: 0
                    })
                }
            }
        }
        
        setMessages(prev => [...prev, newMsg])
        setMessage("")
      }
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
    try {
      const extension = file.name.split(".").pop()
      const convFolder = selectedConv.id.startsWith('new-') ? `initial-${selectedConv.otherUser.id}` : `conversation-${selectedConv.id}`
      const filePath = `${convFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

      const { error } = await supabase.storage.from("messages").upload(filePath, file)
      if (error) throw error

      const { data: publicUrlData } = supabase.storage.from("messages").getPublicUrl(filePath)
      const publicUrl = publicUrlData.publicUrl

      const content = type === "image" ? `[Image] ${publicUrl}` : `[Fichier] ${file.name} - ${publicUrl}`

      const res = await fetchWithAuth("/api/messages/send", {
        method: "POST",
        body: JSON.stringify({
          receiverId: selectedConv.otherUser.id,
          content
        }),
      })

      if (res.ok) {
        const newMsg = await res.json()
        if (selectedConv.id.startsWith('new-')) {
            const convRes = await fetchWithAuth("/api/messages/conversations")
            if (convRes.ok) {
                const convs = await convRes.json()
                setConversations(convs)
                const newRealConv = convs.find((c: any) => c.otherUser.id === selectedConv.otherUser.id)
                if (newRealConv) setSelectedConv(newRealConv)
            }
        }
        setMessages((prev) => [...prev, newMsg])
      }
    } catch (err: any) {
      console.error("Upload error:", err)
      toast.error("Erreur de partage du fichier")
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
                name: supportUser.name || "Service Client Nexus",
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
        const err = await res.json()
        toast.error(err.error || "Impossible d'inviter l'admin")
      }
    } catch (err) {
      toast.error("Erreur de connexion")
    } finally {
      setIsSending(false)
    }
  }

  // Toggle pin
  const togglePin = (convId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === convId ? { ...conv, isPinned: !conv.isPinned } : conv
    ))
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
      <div className="h-[calc(100vh-8rem)] flex bg-background rounded-xl border shadow-sm overflow-hidden">
        
        {/* Sidebar - Liste des conversations */}
        <aside className={cn(
          "w-full md:w-[340px] lg:w-[380px] flex flex-col border-r bg-card",
          showChatMobile && "hidden md:flex"
        )}>
          {/* Header Sidebar */}
          <header className="p-4 lg:p-5 border-b space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">Messages</h1>
                {totalUnread > 0 && (
                  <Badge className="h-6 px-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {totalUnread}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Parametres</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={handleContactSupport}>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Nouvelle conversation</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={handleContactSupport}>
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Support Nexus</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" 
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              {[
                { key: "all", label: "Tous" },
                { key: "unread", label: "Non lus" },
                { key: "pinned", label: "Epingles" },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={filterType === filter.key ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-medium transition-all",
                    filterType === filter.key 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-transparent border-muted-foreground/20 text-muted-foreground hover:text-foreground"
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
                    const isOnline = conv.otherUser.isOnline
                    
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
                            <DropdownMenuItem className="rounded-lg text-destructive focus:text-destructive">
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
          "flex-1 flex flex-col bg-muted/20",
          !showChatMobile && "hidden md:flex"
        )}>
          {selectedConv ? (
            <>
              {/* Header Chat */}
              <header className="h-[72px] px-4 lg:px-6 flex items-center justify-between border-b bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden h-9 w-9 rounded-xl"
                    onClick={() => setShowChatMobile(false)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                      <AvatarImage src={selectedConv.otherUser.avatar || undefined} className="object-cover" />
                      <AvatarFallback className="bg-muted font-medium">
                        {selectedConv.otherUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                      selectedConv.otherUser.isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
                    )} />
                  </div>
                  
                  <div className="min-w-0">
                    <h2 className="font-semibold text-sm text-foreground truncate">
                      {selectedConv.otherUser.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedConv.otherUser.isOnline 
                        ? <span className="text-emerald-600 font-medium">En ligne</span>
                        : formatLastSeen(selectedConv.otherUser.lastSeen)
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hidden sm:flex">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Appel audio</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hidden sm:flex">
                        <Video className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Appel video</TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuItem className="rounded-lg">
                        <Star className="h-4 w-4 mr-2" />
                        Messages importants
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg">
                        <Search className="h-4 w-4 mr-2" />
                        Rechercher
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="rounded-lg text-amber-600 focus:text-amber-600 font-bold"
                        onClick={() => handleInviteAdmin(selectedConv.id)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Médiation Nexus
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Signaler / Litige
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>

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
                          <div key={msg.id} className="flex justify-center my-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-3 flex items-center gap-3 max-w-md shadow-sm">
                              <Shield className="h-5 w-5 text-amber-600 shrink-0" />
                              <p className="text-xs font-bold text-amber-800 leading-normal">
                                {msg.content.replace("⚠️ [MÉDIATION DEMANDÉE] ", "")}
                              </p>
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
                            "max-w-[75%] sm:max-w-[65%]",
                            isOwn ? "items-end" : "items-start"
                          )}>
                            <div className={cn(
                              "px-4 py-2.5 rounded-xl text-sm leading-relaxed",
                              isOwn 
                                ? "bg-primary text-primary-foreground rounded-br-md" 
                                : "bg-card border border-border rounded-bl-md"
                            )}>
                              {msg.content.startsWith('[Image]') ? (
                                <div className="space-y-2">
                                  <img 
                                    src={msg.content.split(' ')[1]} 
                                    className="rounded-xl max-w-full hover:scale-[1.02] transition-transform cursor-pointer shadow-sm border border-black/5" 
                                    alt="Shared" 
                                    onClick={() => window.open(msg.content.split(' ')[1], '_blank')}
                                  />
                                </div>
                              ) : msg.content.startsWith('[Fichier]') ? (
                                <div className="flex items-center gap-3 bg-black/5 p-3 rounded-xl border border-white/10 group/file">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <Paperclip className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-xs truncate">{msg.content.split(' - ')[0].replace('[Fichier] ', '')}</p>
                                    <a 
                                      href={msg.content.split(' - ')[1]} 
                                      target="_blank" 
                                      className="text-[10px] text-primary hover:underline font-semibold"
                                    >
                                      Télécharger le document
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                msg.content
                              )}
                            </div>
                            
                            {isLastInGroup && (
                              <div className={cn(
                                "flex items-center gap-1.5 mt-1 px-1",
                                isOwn ? "justify-end" : "justify-start"
                              )}>
                                <span className="text-[10px] text-muted-foreground">
                                  {formatMessageTime(msg.created_at)}
                                </span>
                                {isOwn && (
                                  <span className="flex items-center">
                                    {msg.is_read ? (
                                      <CheckCheck className="h-3.5 w-3.5 text-primary" />
                                    ) : (
                                      <Check className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                  </span>
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

              {/* Input */}
              <footer className="p-4 lg:px-6 border-t bg-card/80 backdrop-blur-sm">
                <div className="flex items-end gap-2 max-w-3xl mx-auto">
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl shrink-0">
                          <Plus className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ajouter</TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <div className="flex-1 relative">
                    <Textarea
                      ref={inputRef}
                      placeholder="Ecrivez votre message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="min-h-[44px] max-h-[120px] py-3 px-4 pr-24 resize-none rounded-xl bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                      rows={1}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => imageInputRef.current?.click()}>
                            <Image className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Image</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => fileInputRef.current?.click()}>
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Fichier</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        className="h-10 w-10 rounded-xl shrink-0 bg-primary hover:bg-primary/90"
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isSending}
                      >
                        {isSending ? (
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Envoyer</TooltipContent>
                  </Tooltip>
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
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 shadow-inner">
                  <Gavel className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Demande de Médiation</DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">
                    Un administrateur Nexus sera invité à rejoindre cette discussion pour vous aider à résoudre le litige.
                  </DialogDescription>
                </div>
              </div>

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
                    Note : L'administrateur aura accès à l'historique complet de cette discussion pour mener à bien sa médiation.
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

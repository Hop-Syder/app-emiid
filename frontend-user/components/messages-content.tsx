/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de messagerie avec statuts lu/non-lu et indicateur en ligne
 * @created 2025-12-24
 * @updated 2026-03-18
 */

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Search, Image, Paperclip, Loader2, User, MessageSquare, MoreVertical, ArrowLeft, Check, CheckCheck, Circle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

// Types
interface UserProfile {
  id: string
  name: string
  avatar: string | null
  role: string | null
  isOnline: boolean
  lastSeen: string | null
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
}

interface Conversation {
  id: string
  otherUser: UserProfile
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
}

// Données de démonstration pour le frontend
const mockUsers: UserProfile[] = [
  { id: "user-1", name: "Amara Diallo", avatar: "/african-woman-entrepreneur.jpg", role: "Entrepreneur", isOnline: true, lastSeen: null },
  { id: "user-2", name: "Kofi Mensah", avatar: "/african-man-developer.jpg", role: "Développeur", isOnline: false, lastSeen: new Date(Date.now() - 3600000).toISOString() },
  { id: "user-3", name: "Fatou Sow", avatar: "/african-woman-ceo.jpg", role: "CEO", isOnline: true, lastSeen: null },
  { id: "user-4", name: "Service Client Nexus", avatar: "/nexus-connect-logo.jpg", role: "Support Technique", isOnline: true, lastSeen: null },
]

const mockConversations: Conversation[] = [
  { 
    id: "conv-1", 
    otherUser: mockUsers[0], 
    lastMessage: "Bonjour, j'aimerais discuter de votre projet", 
    lastMessageAt: new Date(Date.now() - 300000).toISOString(),
    unreadCount: 2
  },
  { 
    id: "conv-2", 
    otherUser: mockUsers[1], 
    lastMessage: "Le développement avance bien!", 
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 0
  },
  { 
    id: "conv-3", 
    otherUser: mockUsers[2], 
    lastMessage: "Merci pour la collaboration", 
    lastMessageAt: new Date(Date.now() - 172800000).toISOString(),
    unreadCount: 1
  },
]

const generateMockMessages = (conversationId: string, otherUserId: string): Message[] => {
  const currentUserId = "current-user"
  const messages: Message[] = [
    { id: `${conversationId}-1`, conversation_id: conversationId, sender_id: otherUserId, content: "Bonjour! Comment allez-vous?", created_at: new Date(Date.now() - 7200000).toISOString(), is_read: true },
    { id: `${conversationId}-2`, conversation_id: conversationId, sender_id: currentUserId, content: "Très bien merci! Et vous?", created_at: new Date(Date.now() - 7100000).toISOString(), is_read: true },
    { id: `${conversationId}-3`, conversation_id: conversationId, sender_id: otherUserId, content: "Je voulais vous parler d'un projet intéressant", created_at: new Date(Date.now() - 7000000).toISOString(), is_read: true },
    { id: `${conversationId}-4`, conversation_id: conversationId, sender_id: currentUserId, content: "Je suis à l'écoute!", created_at: new Date(Date.now() - 6900000).toISOString(), is_read: true },
    { id: `${conversationId}-5`, conversation_id: conversationId, sender_id: otherUserId, content: "Parfait, je vous envoie les détails", created_at: new Date(Date.now() - 300000).toISOString(), is_read: false },
  ]
  return messages
}

export function MessagesContent() {
  const [message, setMessage] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConv, setLoadingConv] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showChatMobile, setShowChatMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentUserId] = useState("current-user")

  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Charger les conversations au montage
  useEffect(() => {
    const loadConversations = async () => {
      setLoadingConv(true)
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 500))
      setConversations(mockConversations)
      setLoadingConv(false)
    }
    loadConversations()
  }, [])

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (!selectedConv) return

    const loadMessages = async () => {
      setLoadingMsgs(true)
      await new Promise(resolve => setTimeout(resolve, 300))
      const msgs = generateMockMessages(selectedConv.id, selectedConv.otherUser.id)
      setMessages(msgs)
      setLoadingMsgs(false)
      
      // Marquer les messages comme lus
      markMessagesAsRead(selectedConv.id)
      
      // Scroll to bottom
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
    loadMessages()
  }, [selectedConv])

  // Marquer les messages comme lus
  const markMessagesAsRead = useCallback((conversationId: string) => {
    setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })))
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ))
  }, [])

  // Mettre à jour le statut en ligne périodiquement (simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setConversations(prev => prev.map(conv => ({
        ...conv,
        otherUser: {
          ...conv.otherUser,
          // Simuler des changements de statut aléatoires
          isOnline: conv.otherUser.role === "Support Technique" ? true : Math.random() > 0.3
        }
      })))
    }, 30000) // Toutes les 30 secondes

    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConv || isSending) return

    setIsSending(true)
    
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: selectedConv.id,
      sender_id: currentUserId,
      content: message.trim(),
      created_at: new Date().toISOString(),
      is_read: false
    }

    // Ajouter le message localement immédiatement
    setMessages(prev => [...prev, newMsg])
    setMessage("")

    // Mettre à jour la conversation
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConv.id 
        ? { ...conv, lastMessage: newMsg.content, lastMessageAt: newMsg.created_at }
        : conv
    ))

    // Simuler l'envoi au serveur
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simuler la confirmation de lecture après un délai
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMsg.id ? { ...msg, is_read: true } : msg
      ))
    }, 2000)

    setIsSending(false)
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const handleFileUpload = async (file: File, type: "image" | "file") => {
    if (!selectedConv || !file) return

    setIsSending(true)
    
    const placeholder = type === "image"
      ? `[Image] ${file.name}`
      : `[Fichier] ${file.name}`

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: selectedConv.id,
      sender_id: currentUserId,
      content: placeholder,
      created_at: new Date().toISOString(),
      is_read: false
    }

    setMessages(prev => [...prev, newMsg])
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSending(false)
    if (imageInputRef.current) imageInputRef.current.value = ""
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleContactSupport = () => {
    const supportConv = conversations.find(c => c.otherUser.role === "Support Technique")
    if (supportConv) {
      setSelectedConv(supportConv)
      setShowChatMobile(true)
    } else {
      // Créer une nouvelle conversation avec le support
      const newSupportConv: Conversation = {
        id: "conv-support",
        otherUser: mockUsers[3],
        lastMessage: null,
        lastMessageAt: null,
        unreadCount: 0
      }
      setConversations(prev => [newSupportConv, ...prev])
      setSelectedConv(newSupportConv)
      setShowChatMobile(true)
    }
  }

  // Filtrer les conversations par recherche
  const filteredConversations = conversations.filter(conv => 
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Formatter le temps relatif
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins}min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  // Formatter "Vu à" pour le statut hors ligne
  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return "Hors ligne"
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 60) return `Vu il y a ${diffMins}min`
    if (diffHours < 24) return `Vu il y a ${diffHours}h`
    return `Vu le ${date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`
  }

  // Composant pour l'indicateur de statut en ligne
  const OnlineIndicator = ({ isOnline, size = "md" }: { isOnline: boolean; size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
      sm: "w-2.5 h-2.5",
      md: "w-3 h-3",
      lg: "w-3.5 h-3.5"
    }
    
    return (
      <div className={cn(
        "rounded-full border-2 border-white shadow-sm",
        sizeClasses[size],
        isOnline ? "bg-green-500" : "bg-slate-400"
      )}>
        {isOnline && (
          <div className="w-full h-full rounded-full bg-green-500 animate-pulse" />
        )}
      </div>
    )
  }

  // Composant pour le statut de lecture des messages
  const MessageStatus = ({ isRead, isSent }: { isRead: boolean; isSent: boolean }) => {
    if (!isSent) return null
    
    return (
      <span className="inline-flex items-center ml-1">
        {isRead ? (
          <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
        ) : (
          <Check className="w-3.5 h-3.5 text-slate-400" />
        )}
      </span>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0 h-[calc(100vh-10rem)] bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden shadow-indigo-100/50">
      {/* Sidebar - Conversations */}
      <div className={cn(
        "flex flex-col border-r border-slate-100 bg-white/30 backdrop-blur-xl transition-all duration-300",
        showChatMobile ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-6 border-b border-slate-100/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Messages</h2>
            <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-600 border-indigo-100">
              {conversations.length} Discussions
            </Badge>
          </div>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Rechercher un contact..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-2xl bg-white/80 border-slate-200/60 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm" 
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {/* Shortcut Service Client */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContactSupport}
              className="p-4 rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-200 mb-6 cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">Service Client Nexus</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                    <p className="text-[10px] text-white/80">En ligne - Support 24/7</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {loadingConv ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
                <p className="text-xs text-slate-400 font-medium">Chargement des données...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filteredConversations.map((conv) => {
                  const isSelected = selectedConv?.id === conv.id
                  return (
                    <motion.div
                      key={conv.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => {
                        setSelectedConv(conv)
                        setShowChatMobile(true)
                      }}
                      className={cn(
                        "group relative flex items-center gap-4 p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300",
                        isSelected 
                          ? "bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100" 
                          : "hover:bg-white/60"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[2px_0_10px_rgba(var(--primary),0.5)]" />
                      )}
                      
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                          <AvatarImage src={conv.otherUser.avatar || undefined} />
                          <AvatarFallback className="bg-slate-100 text-slate-500">
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <OnlineIndicator isOnline={conv.otherUser.isOnline} size="md" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className={cn(
                            "font-bold text-sm truncate",
                            isSelected ? "text-slate-900" : "text-slate-700"
                          )}>
                            {conv.otherUser.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                            {formatRelativeTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "text-xs truncate font-medium flex-1",
                            isSelected ? "text-slate-500" : "text-slate-400",
                            conv.unreadCount > 0 && "font-semibold text-slate-700"
                          )}>
                            {conv.lastMessage || "Ouvrir la discussion"}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="ml-2 h-5 min-w-5 rounded-full bg-primary text-white text-[10px] font-bold px-1.5">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex p-3 bg-slate-50 rounded-2xl mb-3">
                  <MessageSquare className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 font-medium px-6 leading-relaxed">
                  {searchQuery ? "Aucun résultat trouvé" : "Prêt à networker ? Commencez une conversation."}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Zone principale - Chat */}
      <div className={cn(
        "flex flex-col relative bg-slate-50/30 transition-all duration-300",
        !showChatMobile ? "hidden lg:flex" : "flex"
      )}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-white/70 backdrop-blur-md border-b border-slate-100 z-10">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden rounded-xl bg-slate-100 text-slate-500"
                  onClick={() => setShowChatMobile(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="relative">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-white shadow-md">
                    <AvatarImage src={selectedConv.otherUser.avatar || undefined} />
                    <AvatarFallback className="bg-primary/5 text-primary">
                      <User />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <OnlineIndicator isOnline={selectedConv.otherUser.isOnline} size="md" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 tracking-tight">
                      {selectedConv.otherUser.name}
                    </h3>
                    {selectedConv.otherUser.role === "Support Technique" && (
                      <Badge className="bg-blue-100 text-blue-600 border-blue-200 rounded-lg text-[9px] hover:bg-blue-100">
                        VERIFIED
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {selectedConv.otherUser.isOnline ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-[11px] font-semibold text-green-600 uppercase tracking-widest">
                          En ligne
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                          {formatLastSeen(selectedConv.otherUser.lastSeen)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-2xl text-slate-400 hover:text-primary transition-colors">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-2xl text-slate-400 hover:text-primary transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <ScrollArea className="flex-1">
              <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                {loadingMsgs ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary h-8 w-8" />
                    <p className="text-xs text-slate-400 font-medium mt-3">Chargement des messages...</p>
                  </div>
                ) : messages.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {messages.map((msg, idx) => {
                      const isMe = msg.sender_id === currentUserId
                      const showDateSeparator = idx === 0 || 
                        new Date(msg.created_at).toDateString() !== new Date(messages[idx - 1].created_at).toDateString()
                      
                      return (
                        <div key={msg.id}>
                          {showDateSeparator && (
                            <div className="flex items-center justify-center my-6">
                              <div className="bg-slate-100 text-slate-500 text-[10px] font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full">
                                {new Date(msg.created_at).toLocaleDateString('fr-FR', { 
                                  weekday: 'long', 
                                  day: 'numeric', 
                                  month: 'long' 
                                })}
                              </div>
                            </div>
                          )}
                          <motion.div 
                            layout
                            initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            className={cn("flex", isMe ? "justify-end" : "justify-start")}
                          >
                            <div className={cn(
                              "group relative flex flex-col max-w-[85%] md:max-w-[75%]",
                              isMe ? "items-end" : "items-start"
                            )}>
                              <div className={cn(
                                "relative px-4 py-3 md:px-5 md:py-4 shadow-lg",
                                isMe
                                  ? "bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-3xl rounded-tr-md shadow-indigo-200/30"
                                  : "bg-white text-slate-800 border border-slate-100 rounded-3xl rounded-tl-md shadow-slate-200/30"
                              )}>
                                {/* Indicateur non lu */}
                                {!isMe && !msg.is_read && (
                                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                                )}
                                <p className="text-[14px] md:text-[14.5px] leading-relaxed font-medium whitespace-pre-wrap">
                                  {msg.content.startsWith('[Image]') ? (
                                    <span className="flex items-center gap-2 text-sm opacity-80">
                                      <Image className="w-4 h-4" />
                                      {msg.content.replace('[Image] ', '')}
                                    </span>
                                  ) : msg.content.startsWith('[Fichier]') ? (
                                    <span className="flex items-center gap-2 text-sm opacity-80">
                                      <Paperclip className="w-4 h-4" />
                                      {msg.content.replace('[Fichier] ', '')}
                                    </span>
                                  ) : msg.content}
                                </p>
                              </div>
                              <div className={cn(
                                "flex items-center gap-1 mt-1.5 px-1",
                                isMe ? "flex-row-reverse" : "flex-row"
                              )}>
                                <span className={cn(
                                  "text-[9px] font-bold uppercase tracking-wider opacity-50",
                                  isMe ? "text-indigo-900" : "text-slate-500"
                                )}>
                                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                {isMe && <MessageStatus isRead={msg.is_read} isSent={true} />}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )
                    })}
                  </AnimatePresence>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">
                      Commencez la conversation!
                    </p>
                  </div>
                )}
                <div ref={scrollRef} className="h-4" />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-white/50 backdrop-blur-xl border-t border-slate-100">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative flex items-end gap-2 md:gap-3 bg-white p-2 md:p-2.5 rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-slate-100"
              >
                <div className="flex items-center gap-1 px-1 md:px-2 mb-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 md:h-10 md:w-10 text-slate-400 hover:text-primary hover:bg-slate-50 transition-all"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Image className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 md:h-10 md:w-10 text-slate-400 hover:text-primary hover:bg-slate-50 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Écrivez votre message ici..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={1}
                  className="min-h-[40px] md:min-h-[44px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 resize-none rounded-2xl text-[14px] md:text-[15px] font-medium py-2.5 md:py-3 placeholder:text-slate-400 leading-normal"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                
                <Button
                  className={cn(
                    "rounded-full h-10 w-10 md:h-12 md:w-12 shrink-0 shadow-lg transition-all duration-300",
                    message.trim() 
                      ? "bg-primary scale-100 shadow-primary/30" 
                      : "bg-slate-100 text-slate-400 scale-90"
                  )}
                  onClick={handleSendMessage}
                  disabled={isSending || !message.trim()}
                >
                  {isSending ? (
                    <Loader2 className="animate-spin h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <Send className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                  )}
                </Button>
              </motion.div>
              <p className="text-center text-[9px] md:text-[10px] text-slate-300 mt-3 font-medium uppercase tracking-[0.2em]">
                Conversation sécurisée et cryptée
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12 overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
              <MessageSquare className="w-[400px] md:w-[600px] h-[400px] md:h-[600px] rotate-12" />
            </div>
            
            <div className="z-10 max-w-sm">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full flex items-center justify-center mb-6 md:mb-8 mx-auto ring-1 ring-indigo-100/50"
              >
                <Send className="w-8 h-8 md:w-10 md:h-10 text-primary opacity-40 -translate-x-1 translate-y-1" />
              </motion.div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-3 md:mb-4 tracking-tight">
                Vos Discussions
              </h3>
              <p className="text-sm md:text-base text-slate-400 font-medium mb-8 md:mb-10 leading-relaxed">
                Échangez en direct avec vos contacts ou contactez le Service Client Nexus pour toute assistance.
              </p>
              <Button 
                variant="outline" 
                className="rounded-full px-6 md:px-8 h-10 md:h-12 border-slate-200 font-bold hover:bg-slate-50 transition-all shadow-sm"
                onClick={handleContactSupport}
              >
                Contactez le Support
              </Button>
            </div>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={imageInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file, "image")
        }}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file, "file")
        }}
      />
    </div>
  )
}

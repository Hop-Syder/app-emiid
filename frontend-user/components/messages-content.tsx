/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de messagerie moderne avec statuts lu/non-lu et indicateur en ligne
 * @created 2025-12-24
 * @updated 2026-03-18
 */

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Send, Search, Image, Paperclip, Smile, Mic, Phone, Video, 
  MoreHorizontal, ArrowLeft, Check, CheckCheck, X, Plus,
  Settings, Bell, Pin, Trash2, Archive, Star, Filter
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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

// Donnees de demonstration
const mockUsers: UserProfile[] = [
  { id: "user-1", name: "Amara Diallo", avatar: "/african-woman-entrepreneur.jpg", role: "CEO, TechAfrica", isOnline: true, lastSeen: null },
  { id: "user-2", name: "Kofi Mensah", avatar: "/african-man-developer.jpg", role: "Lead Developer", isOnline: false, lastSeen: new Date(Date.now() - 1800000).toISOString() },
  { id: "user-3", name: "Fatou Sow", avatar: "/african-woman-ceo.jpg", role: "Designer UX/UI", isOnline: true, lastSeen: null },
  { id: "user-4", name: "Kwame Asante", avatar: "/african-man-designer.jpg", role: "Product Manager", isOnline: false, lastSeen: new Date(Date.now() - 7200000).toISOString() },
  { id: "user-5", name: "Support Nexus", avatar: "/nexus-connect-logo.jpg", role: "Assistance 24/7", isOnline: true, lastSeen: null },
]

const mockConversations: Conversation[] = [
  { id: "conv-1", otherUser: mockUsers[0], lastMessage: "Super! On se retrouve demain pour la presentation?", lastMessageAt: new Date(Date.now() - 120000).toISOString(), unreadCount: 3, isPinned: true },
  { id: "conv-2", otherUser: mockUsers[1], lastMessage: "Le code est pret pour la review", lastMessageAt: new Date(Date.now() - 3600000).toISOString(), unreadCount: 0 },
  { id: "conv-3", otherUser: mockUsers[2], lastMessage: "Voici les maquettes finales du projet", lastMessageAt: new Date(Date.now() - 7200000).toISOString(), unreadCount: 1 },
  { id: "conv-4", otherUser: mockUsers[3], lastMessage: "Meeting reporte a 15h", lastMessageAt: new Date(Date.now() - 86400000).toISOString(), unreadCount: 0 },
  { id: "conv-5", otherUser: mockUsers[4], lastMessage: "Comment puis-je vous aider?", lastMessageAt: new Date(Date.now() - 172800000).toISOString(), unreadCount: 0 },
]

const generateMockMessages = (conversationId: string, otherUserId: string): Message[] => {
  const currentUserId = "current-user"
  const baseTime = Date.now()
  
  return [
    { id: `${conversationId}-1`, conversation_id: conversationId, sender_id: otherUserId, content: "Salut! Comment vas-tu?", created_at: new Date(baseTime - 7200000).toISOString(), is_read: true },
    { id: `${conversationId}-2`, conversation_id: conversationId, sender_id: currentUserId, content: "Hey! Ca va super bien, merci! Et toi?", created_at: new Date(baseTime - 7100000).toISOString(), is_read: true },
    { id: `${conversationId}-3`, conversation_id: conversationId, sender_id: otherUserId, content: "Tres bien! J'ai une excellente nouvelle a t'annoncer concernant notre projet.", created_at: new Date(baseTime - 7000000).toISOString(), is_read: true },
    { id: `${conversationId}-4`, conversation_id: conversationId, sender_id: currentUserId, content: "Ah oui? Je t'ecoute avec attention!", created_at: new Date(baseTime - 6900000).toISOString(), is_read: true },
    { id: `${conversationId}-5`, conversation_id: conversationId, sender_id: otherUserId, content: "Notre proposition a ete acceptee! On demarre la semaine prochaine.", created_at: new Date(baseTime - 6800000).toISOString(), is_read: true },
    { id: `${conversationId}-6`, conversation_id: conversationId, sender_id: currentUserId, content: "C'est genial! Felicitations a toute l'equipe!", created_at: new Date(baseTime - 6700000).toISOString(), is_read: true },
    { id: `${conversationId}-7`, conversation_id: conversationId, sender_id: otherUserId, content: "Super! On se retrouve demain pour la presentation?", created_at: new Date(baseTime - 120000).toISOString(), is_read: false },
  ]
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
  const [filterType, setFilterType] = useState<"all" | "unread" | "pinned">("all")
  const [currentUserId] = useState("current-user")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Charger les conversations
  useEffect(() => {
    const loadConversations = async () => {
      setLoadingConv(true)
      await new Promise(resolve => setTimeout(resolve, 400))
      setConversations(mockConversations)
      setLoadingConv(false)
    }
    loadConversations()
  }, [])

  // Charger les messages
  useEffect(() => {
    if (!selectedConv) return

    const loadMessages = async () => {
      setLoadingMsgs(true)
      await new Promise(resolve => setTimeout(resolve, 250))
      const msgs = generateMockMessages(selectedConv.id, selectedConv.otherUser.id)
      setMessages(msgs)
      setLoadingMsgs(false)
      markMessagesAsRead(selectedConv.id)
    }
    loadMessages()
  }, [selectedConv])

  // Scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Marquer comme lu
  const markMessagesAsRead = useCallback((conversationId: string) => {
    setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })))
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ))
  }, [])

  // Envoyer un message
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

    setMessages(prev => [...prev, newMsg])
    setMessage("")

    setConversations(prev => prev.map(conv => 
      conv.id === selectedConv.id 
        ? { ...conv, lastMessage: newMsg.content, lastMessageAt: newMsg.created_at }
        : conv
    ))

    await new Promise(resolve => setTimeout(resolve, 400))
    
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMsg.id ? { ...msg, is_read: true } : msg
      ))
    }, 1500)

    setIsSending(false)
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
      <div className="h-[calc(100vh-8rem)] flex bg-background rounded-3xl border shadow-sm overflow-hidden">
        
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
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Nouvelle conversation</TooltipContent>
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
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl animate-pulse">
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
                          "relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all group",
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
                      <DropdownMenuItem className="rounded-lg text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer la conversation
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
                              "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                              isOwn 
                                ? "bg-primary text-primary-foreground rounded-br-md" 
                                : "bg-card border border-border rounded-bl-md"
                            )}>
                              {msg.content}
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
                      className="min-h-[44px] max-h-[120px] py-3 px-4 pr-24 resize-none rounded-2xl bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                      rows={1}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <Smile className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Emoji</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
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
      </div>
    </TooltipProvider>
  )
}

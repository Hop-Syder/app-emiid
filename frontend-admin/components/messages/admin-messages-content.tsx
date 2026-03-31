/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Interface de messagerie pour l'administration (Médiation)
 * @created 2026-03-23
*/

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Send, Search, Image, Paperclip, Smile, Mic, Phone, Video, 
  MoreHorizontal, ArrowLeft, Check, CheckCheck, X, Plus,
  Settings, Bell, Pin, Trash2, Archive, Star, Filter, Shield, Gavel, AlertTriangle,
  ExternalLink, User
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { fetchWithAuth } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const supabase = createClient()

interface AdminConversation {
  id: string
  user1: { id: string; name: string; avatar: string; role: string }
  user2: { id: string; name: string; avatar: string; role: string }
  lastMessage: string
  lastMessageAt: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export default function AdminMessagesContent() {
  const [conversations, setConversations] = useState<AdminConversation[]>([])
  const [selectedConv, setSelectedConv] = useState<AdminConversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 1. Initialisation
  useEffect(() => {
    const init = async () => {
      // Get current admin ID
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentAdminId(user.id)

      loadConversations()
    }
    init()
  }, [])

  // 2. Charger les conversations (Litiges)
  const loadConversations = async () => {
    setIsLoading(true)
    try {
      const res = await fetchWithAuth("/api/messages/admin/disputes")
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      } else {
        const errorData = await res.json().catch(() => ({ error: "Erreur de chargement des litiges" }))
        toast.error(errorData.error || "Erreur de chargement des litiges")
      }
    } catch (err) {
      toast.error("Erreur de chargement des litiges")
    } finally {
      setIsLoading(false)
    }
  }

  // 3. Charger les messages d'une conversation
  useEffect(() => {
    if (!selectedConv) return

    const loadMessages = async () => {
      setIsMessagesLoading(true)
      try {
        const res = await fetchWithAuth(`/api/messages/admin/conversation/${selectedConv.id}`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data)
          // Mark as read (Admin view)
          void fetchWithAuth(`/api/messages/admin/read/${selectedConv.id}`, { method: "POST" })
        } else {
          const errorData = await res.json().catch(() => ({ error: "Erreur de chargement des messages" }))
          toast.error(errorData.error || "Erreur de chargement des messages")
        }
      } catch (err) {
        toast.error("Erreur de chargement des messages")
      } finally {
        setIsMessagesLoading(false)
      }
    }

    loadMessages()

    // Realtime subscription
    const channel = supabase
      .channel(`admin-room-${selectedConv.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConv.id}` },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedConv])

  // 4. Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 5. Envoyer réponse admin
  const handleSendAdminReply = async () => {
    if (!message.trim() || !selectedConv || isSending) return

    setIsSending(true)
    try {
      const res = await fetchWithAuth(`/api/messages/admin/reply/${selectedConv.id}`, {
        method: "POST",
        body: JSON.stringify({ content: message })
      })

      if (res.ok) {
        const sentMessage = await res.json()
        setMessages(prev => prev.some(existingMessage => existingMessage.id === sentMessage.id) ? prev : [...prev, sentMessage])
        setConversations(prev => prev.map(conv =>
          conv.id === selectedConv.id
            ? { ...conv, lastMessage: sentMessage.content, lastMessageAt: sentMessage.created_at }
            : conv,
        ))
        setMessage("")
        inputRef.current?.focus()
      } else {
        const errorData = await res.json().catch(() => ({ error: "Erreur lors de l'envoi" }))
        toast.error(errorData.error || "Erreur lors de l'envoi")
      }
    } catch (err) {
      toast.error("Erreur de connexion")
    } finally {
      setIsSending(false)
    }
  }

  // Filtrage
  const filteredConversations = conversations.filter(conv => 
    conv.user1.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user2.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <TooltipProvider>
      <div className="flex h-full bg-slate-50">
        
        {/* Sidebar */}
        <aside className={cn(
          "w-full lg:w-96 flex flex-col border-r bg-white",
          selectedConv ? "hidden lg:flex" : "flex"
        )}>
          <header className="p-6 border-b space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Gavel className="h-6 w-6 text-primary" />
                Médiations
              </h1>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 font-bold">
                {conversations.length} Litiges
              </Badge>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Rechercher un litige..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-slate-100 border-none focus-visible:ring-primary/20 font-medium"
              />
            </div>
          </header>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-slate-50 animate-pulse m-2" />
                ))
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={cn(
                      "w-full p-4 rounded-2xl transition-all group relative border",
                      selectedConv?.id === conv.id 
                        ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" 
                        : "hover:bg-slate-50 border-transparent text-slate-600"
                    )}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="flex -space-x-3">
                        <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-slate-100 ring-offset-0 group-hover:ring-offset-2 transition-all">
                          <AvatarImage src={conv.user1.avatar} />
                          <AvatarFallback>{conv.user1.name[0]}</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-slate-100 ring-offset-0 group-hover:ring-offset-2 transition-all">
                          <AvatarImage src={conv.user2.avatar} />
                          <AvatarFallback>{conv.user2.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 text-left overflow-hidden min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className={cn(
                            "font-bold text-sm truncate pr-2",
                            selectedConv?.id === conv.id ? "text-white" : "text-slate-900"
                          )}>
                            {conv.user1.name} vs {conv.user2.name}
                          </h3>
                        </div>
                        <p className={cn(
                          "text-xs mt-0.5 truncate leading-relaxed opacity-80",
                          selectedConv?.id === conv.id ? "text-slate-200" : "text-slate-500"
                        )}>
                          {conv.lastMessage || "Pas encore de message"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 grayscale">
                  <div className="p-4 bg-slate-100 rounded-3xl mb-4">
                    <CheckCheck className="h-10 w-10" />
                  </div>
                  <p className="text-sm font-bold">Aucun litige en cours</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Chat Area */}
        <main className={cn(
          "flex-1 flex flex-col h-full bg-white lg:rounded-l-[40px] shadow-2xl relative z-10 overflow-hidden",
          !selectedConv && "hidden lg:flex lg:items-center lg:justify-center bg-slate-50 shadow-none border-l"
        )}>
          {selectedConv ? (
            <>
              {/* Header */}
              <header className="h-20 border-b flex items-center justify-between px-6 lg:px-10 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="lg:hidden rounded-xl" onClick={() => setSelectedConv(null)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-4">
                      <Avatar className="h-12 w-12 border-4 border-white shadow-md">
                        <AvatarImage src={selectedConv.user1.avatar} />
                        <AvatarFallback>{selectedConv.user1.name[0]}</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-12 w-12 border-4 border-white shadow-md">
                        <AvatarImage src={selectedConv.user2.avatar} />
                        <AvatarFallback>{selectedConv.user2.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h2 className="font-black text-slate-900 items-center gap-2 flex">
                        Conflit : {selectedConv.user1.name} & {selectedConv.user2.name}
                        <Shield className="h-4 w-4 text-amber-500" />
                      </h2>
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Médiation ACTIVE
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-slate-100">
                    <User className="h-5 w-5 text-slate-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-slate-100">
                    <MoreHorizontal className="h-5 w-5 text-slate-400" />
                  </Button>
                </div>
              </header>

              {/* Messages Area */}
              <ScrollArea className="flex-1 px-6 lg:px-10 py-8 bg-slate-50/10">
                {isMessagesLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {messages.map((msg, index) => {
                      const isOwn = msg.sender_id === currentAdminId
                      const sender = msg.sender_id === selectedConv.user1.id ? selectedConv.user1 : 
                                     msg.sender_id === selectedConv.user2.id ? selectedConv.user2 : 
                                     { name: "Nexus Admin", avatar: "", role: "admin" }

                      const isMediation = msg.content.includes("[MÉDIATION DEMANDÉE]")
                      
                      if (isMediation) {
                        return (
                          <div key={msg.id} className="flex justify-center my-8">
                            <div className="bg-amber-50 border border-amber-200 rounded-3xl px-8 py-4 flex items-center gap-4 max-w-lg shadow-sm">
                              <Shield className="h-6 w-6 text-amber-600 shrink-0" />
                              <div>
                                <p className="text-xs font-black text-amber-900 uppercase tracking-tighter mb-1">Alerte Médiation</p>
                                <p className="text-sm font-bold text-amber-800 leading-normal italic">
                                  {msg.content.replace(/⚠️ \[MÉDIATION DEMANDÉE\] Motif : .*?\. /, "")}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div key={msg.id} className={cn(
                          "flex gap-4 group",
                          isOwn ? "flex-row-reverse" : "flex-row"
                        )}>
                          <div className="shrink-0 pt-1">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                              <AvatarImage src={sender.avatar} />
                              <AvatarFallback className="text-xs bg-slate-100 font-bold">{sender.name[0]}</AvatarFallback>
                            </Avatar>
                          </div>
                          
                          <div className={cn(
                            "flex flex-col gap-1.5",
                            isOwn ? "items-end" : "items-start",
                            "max-w-[75%]"
                          )}>
                            <div className="flex items-center gap-2 px-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sender.name}</span>
                              <span className="text-[10px] text-slate-300">{format(new Date(msg.created_at), 'HH:mm', { locale: fr })}</span>
                            </div>
                            <div className={cn(
                              "px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all",
                              isOwn 
                                ? "bg-slate-900 text-white rounded-tr-none" 
                                : sender.role === "admin"
                                  ? "bg-amber-100 text-amber-900 border border-amber-200 rounded-tl-none font-bold"
                                  : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                            )}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <footer className="p-6 lg:px-10 border-t bg-white relative z-20">
                <div className="max-w-4xl mx-auto flex items-end gap-3">
                  <div className="flex-1 relative group">
                    <Textarea
                      ref={inputRef}
                      placeholder="Votre intervention en tant qu'administrateur..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendAdminReply()
                        }
                      }}
                      className="min-h-[56px] max-h-[200px] py-4 px-6 rounded-2xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-amber-400/30 text-slate-800 placeholder:text-slate-400 transition-all font-medium resize-none"
                      rows={1}
                    />
                    <div className="absolute right-3 bottom-3 flex gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200 rounded-lg">
                        <Image className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200 rounded-lg">
                        <Paperclip className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                  </div>

                  <Button 
                    size="icon" 
                    className="h-14 w-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 transition-all active:scale-95"
                    onClick={handleSendAdminReply}
                    disabled={!message.trim() || isSending}
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-5 w-5 fill-white" />
                    )}
                  </Button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-8 animate-in fade-in zoom-in duration-500">
               <div className="w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center text-slate-300 relative">
                 <Shield className="h-16 w-16" />
                 <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white ring-8 ring-slate-50">
                   <Gavel className="h-4 w-4" />
                 </div>
               </div>
               <div className="space-y-2 max-w-sm">
                 <h2 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">Centre de Médiation</h2>
                 <p className="text-sm font-bold text-slate-400 leading-relaxed">
                   Sélectionnez un litige dans la liste latérale pour analyser les échanges et rétablir l'ordre sur la plateforme.
                 </p>
               </div>
               <Button variant="outline" className="rounded-2xl border-2 border-slate-200 h-12 px-8 font-black text-slate-900 group" onClick={loadConversations}>
                 Actualiser les litiges
                 <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </Button>
            </div>
          )}
        </main>
      </div>
    </TooltipProvider>
  )
}

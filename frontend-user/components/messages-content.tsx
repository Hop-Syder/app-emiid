/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de messagerie avec Service Client et gestion d'uploads
 * @created 2025-12-24
 * @updated 2025-12-26
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Search, Image, Paperclip, Loader2, User, MessageSquare, MoreVertical, ArrowLeft } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchWithAuth } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"

export function MessagesContent() {
  const [message, setMessage] = useState("")
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loadingConv, setLoadingConv] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [supportId, setSupportId] = useState<string | null>(null)
  const [showChatMobile, setShowChatMobile] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // 1. Charger les conversations au montage
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await fetchWithAuth("/api/messages/conversations")
        if (res.ok) {
          const data = await res.json()
          setConversations(data)
          
          // Identifier ou simuler le Service Client
          const support = data.find((c: any) => c.otherUser.role?.toLowerCase().includes("admin") || c.otherUser.name.toLowerCase().includes("nexus"))
          if (support) setSupportId(support.otherUser.id)

          if (!selectedConv && data.length > 0) {
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
  }, []) // On ne dépend plus de selectedConv ici pour éviter la boucle

  // 2. Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (!selectedConv) return

    const loadMessages = async () => {
      if (selectedConv.id === 'new-support') {
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
          // Scroll to bottom
          setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        }
      } catch (err) {
        console.error("Error loading msgs:", err)
      } finally {
        setLoadingMsgs(false)
      }
    }
    loadMessages()
  }, [selectedConv])

  // 3. Souscription Temps Réel (Supabase Realtime)
  useEffect(() => {
    if (!selectedConv || selectedConv.id === 'new-support') return

    const channel = supabase
      .channel(`room-${selectedConv.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConv.id}`
        },
        (payload) => {
          const newMsg = payload.new
          // Éviter les doublons si on est l'expéditeur (le message est déjà ajouté via handleSendMessage)
          setMessages((prev) => {
            const exists = prev.some(m => m.id === newMsg.id)
            if (exists) return prev
            return [...prev, newMsg]
          })
          // Auto-scroll
          setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConv, supabase])

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConv || isSending) return

    setIsSending(true)
    try {
      const res = await fetchWithAuth("/api/messages/send", {
        method: "POST",
        body: JSON.stringify({
          receiverId: selectedConv.otherUser.id,
          content: message
        })
      })

      if (res.ok) {
        const newMsg = await res.json()
        
        // Si c'était une nouvelle conversation support, on rafraîchit la liste pour avoir le vrai ID
        if (selectedConv.id === 'new-support') {
            const convRes = await fetchWithAuth("/api/messages/conversations")
            if (convRes.ok) {
                const convs = await convRes.json()
                setConversations(convs)
                const newRealConv = convs.find((c: any) => c.otherUser.id === selectedConv.otherUser.id)
                if (newRealConv) {
                    setSelectedConv(newRealConv)
                } else {
                    // Fallback si la conv n'est pas encore listée
                    setSelectedConv({
                        id: newMsg.conversation_id,
                        otherUser: selectedConv.otherUser,
                        lastMessage: newMsg.content
                    })
                }
            }
        }
        
        setMessages(prev => [...prev, newMsg])
        setMessage("")
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    } catch (err) {
      console.error("Send error:", err)
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = async (file: File, type: "image" | "file") => {
    if (!selectedConv || !file) return

    setIsSending(true)
    try {
      const extension = file.name.split(".").pop()
      // Si c'est une nouvelle conv, on utilise un chemin générique car on n'a pas encore d'ID de conversation
      const convFolder = selectedConv.id === 'new-support' ? `initial-support-${selectedConv.otherUser.id}` : `conversation-${selectedConv.id}`
      const filePath = `${convFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

      const { data, error } = await supabase.storage.from("messages").upload(filePath, file)
      if (error) {
        console.error("Upload error:", error)
        toast.error("Erreur d'upload")
        return
      }

      const { data: publicUrlData } = supabase.storage.from("messages").getPublicUrl(filePath)
      const publicUrl = publicUrlData.publicUrl

      const placeholder =
        type === "image"
          ? `[Image] ${publicUrl}`
          : `[Fichier] ${file.name} - ${publicUrl}`

      const res = await fetchWithAuth("/api/messages/send", {
        method: "POST",
        body: JSON.stringify({
          receiverId: selectedConv.otherUser.id,
          content: placeholder,
        }),
      })

      if (res.ok) {
        const newMsg = await res.json()
        
         // Même logique de rafraîchissement pour les fichiers
        if (selectedConv.id === 'new-support') {
            const convRes = await fetchWithAuth("/api/messages/conversations")
            if (convRes.ok) {
                const convs = await convRes.json()
                setConversations(convs)
                const newRealConv = convs.find((c: any) => c.otherUser.id === selectedConv.otherUser.id)
                if (newRealConv) setSelectedConv(newRealConv)
            }
        }

        setMessages((prev) => [...prev, newMsg])
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
      }
    } catch (err) {
      console.error("Attachment send error:", err)
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
                role: "Support Technique"
            },
            lastMessage: ""
          })
          setMessages([])
        }
        setShowChatMobile(true)
      } else {
          toast.error("Impossible de contacter le support pour le moment")
      }
    } catch (err) {
      console.error("Support error:", err)
      toast.error("Erreur de connexion au service support")
    }
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
              className="pl-10 rounded-2xl bg-white/80 border-slate-200/60 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm" 
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {/* Shortcut Service Client */}
            {!supportId && (
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
                     <p className="text-[10px] text-white/80">Support technique 24/7</p>
                   </div>
                 </div>
               </motion.div>
            )}

            {loadingConv ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
                <p className="text-xs text-slate-400 font-medium">Chargement des données...</p>
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                return (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                        setSelectedConv(conv)
                        setShowChatMobile(true)
                    }}
                    className={`group relative flex items-center gap-4 p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100' 
                        : 'hover:bg-white/60'
                    }`}
                  >
                    {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[2px_0_10px_rgba(var(--primary),0.5)]" />}
                    
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                        <AvatarImage src={conv.otherUser.avatar} />
                        <AvatarFallback className="bg-slate-100 text-slate-500"><User className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                          {conv.otherUser.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString([], { day: '2-digit', month: 'short' }) : ''}
                        </span>
                      </div>
                      <p className={`text-xs truncate font-medium ${isSelected ? 'text-slate-500' : 'text-slate-400'}`}>
                        {conv.lastMessage || "Ouvrir la discussion"}
                      </p>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex p-3 bg-slate-50 rounded-2xl mb-3">
                   <MessageSquare className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 font-medium px-6 leading-relaxed">Prêt à networker ? Commencez une conversation.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Area principale - Chat */}
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
                <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-white shadow-md">
                  <AvatarImage src={selectedConv.otherUser.avatar} />
                  <AvatarFallback className="bg-primary/5 text-primary"><User /></AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 tracking-tight">
                      {selectedConv.otherUser.name || "Service Client Nexus"}
                    </h3>
                    {selectedConv.otherUser.role?.toLowerCase().includes("admin") && (
                      <Badge className="bg-blue-100 text-blue-600 border-blue-200 rounded-lg text-[9px] hover:bg-blue-100">VERIFIED</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                      {selectedConv.otherUser.role || "Membre Connecté"}
                    </p>
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
            <ScrollArea className="flex-1 bg-[url('/svg/grid-pattern.svg')] bg-[size:30px_30px] bg-fixed">
              <div className="p-8 space-y-6">
                {messages.map((msg, idx) => {
                  const isMe = msg.sender_id !== selectedConv.otherUser.id;
                  return (
                    <motion.div 
                      key={msg.id || idx}
                      initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`group relative flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                        <div className={`relative px-5 py-4 shadow-xl shadow-slate-200/30 ${
                          isMe
                            ? "bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-3xl rounded-tr-none"
                            : "bg-white text-slate-800 border border-slate-100 rounded-3xl rounded-tl-none"
                        }`}>
                          <p className="text-[14.5px] leading-relaxed font-medium">
                            {msg.content.startsWith('[Image]') ? (
                               <img src={msg.content.split(' ')[1]} className="rounded-xl max-w-full hover:scale-105 transition-transform cursor-pointer" alt="Shared attachment" />
                            ) : msg.content.startsWith('[Fichier]') ? (
                               <div className="flex items-center gap-3 bg-black/5 p-3 rounded-xl border border-white/10">
                                 <Paperclip className="h-4 w-4" />
                                 <span className="text-sm font-semibold truncate max-w-[150px]">{msg.content.split(' ')[1]}</span>
                                 <a href={msg.content.split(' - ')[1]} target="_blank" className="underline text-xs opacity-70">Ouvrir</a>
                               </div>
                            ) : msg.content }
                          </p>
                        </div>
                        <span className={`text-[9px] mt-2 font-bold uppercase tracking-wider opacity-40 px-1 ${isMe ? 'text-indigo-900' : 'text-slate-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
                <div ref={scrollRef} className="h-4" />
              </div>
            </ScrollArea>

            {/* Input Area (La bande en bas) */}
            <div className="p-6 bg-white/50 backdrop-blur-xl border-t border-slate-100">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative flex items-end gap-3 bg-white p-2.5 rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-slate-100"
              >
                <div className="flex items-center gap-1.5 px-2 mb-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 text-slate-400 hover:text-primary hover:bg-slate-50 transition-all hover:rotate-12"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Image className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 text-slate-400 hover:text-primary hover:bg-slate-50 transition-all hover:-rotate-12"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Écrivez votre message ici..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={1}
                  className="min-h-[44px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 resize-none rounded-2xl text-[15px] font-medium py-3 placeholder:text-slate-400 leading-normal"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                
                <Button
                  className={`rounded-full h-12 w-12 shrink-0 shadow-lg transition-all duration-300 ${
                    message.trim() ? "bg-primary scale-100 shadow-primary/30" : "bg-slate-100 text-slate-400 scale-90"
                  }`}
                  onClick={handleSendMessage}
                  disabled={isSending || !message.trim()}
                >
                  {isSending ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5 fill-current" />}
                </Button>
              </motion.div>
              <p className="text-center text-[10px] text-slate-300 mt-3 font-medium uppercase tracking-[0.2em]">
                Conversation sécurisée et cryptée • Nexus Partners
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                <MessageSquare className="w-[600px] h-[600px] rotate-12" />
             </div>
             
             <div className="z-10 max-w-sm">
               <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 4 }}
                 className="w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full flex items-center justify-center mb-8 mx-auto ring-1 ring-indigo-100/50"
               >
                 <Send className="w-10 h-10 text-primary opacity-40 -translate-x-1 translate-y-1" />
               </motion.div>
               <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Vos Discussions</h3>
               <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                 Échangez en direct avec vos contacts ou contactez le **Service Client Nexus** pour toute assistance technique ou commerciale.
               </p>
               <Button 
                variant="outline" 
                className="rounded-full px-8 h-12 border-slate-200 font-bold hover:bg-slate-50 transition-all shadow-sm"
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

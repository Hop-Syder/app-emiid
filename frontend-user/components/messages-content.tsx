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
import { Send, Search, Image, Paperclip, Loader2, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchWithAuth } from "@/lib/apiClient"

export function MessagesContent() {
  const [message, setMessage] = useState("")
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loadingConv, setLoadingConv] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Charger les conversations au montage
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await fetchWithAuth("/api/messages/conversations")
        if (res.ok) {
          const data = await res.json()
          setConversations(data)
        }
      } catch (err) {
        console.error("Error loading convs:", err)
      } finally {
        setLoadingConv(false)
      }
    }
    loadConversations()
  }, [])

  // 2. Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (!selectedConv) return

    const loadMessages = async () => {
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
        setMessages([...messages, newMsg])
        setMessage("")
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    } catch (err) {
      console.error("Send error:", err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,350px)_1fr] gap-6 h-[calc(100vh-12rem)]">
      {/* Conversations List */}
      <Card className="rounded-3xl shadow-sm border-none overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-9 rounded-2xl bg-muted/50 border-none" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <CardContent className="p-2">
            {loadingConv ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all mb-1 ${selectedConv?.id === conv.id ? 'bg-primary text-white' : 'hover:bg-muted'}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.otherUser.avatar} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm truncate">{conv.otherUser.name}</h4>
                    </div>
                    <p className={`text-xs truncate ${selectedConv?.id === conv.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {conv.lastMessage || "Nouveau message"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground text-sm p-8">Aucune conversation</p>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Messages Area */}
      <Card className="rounded-3xl shadow-sm border-none overflow-hidden flex flex-col">
        {selectedConv ? (
          <>
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConv.otherUser.avatar} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-primary">{selectedConv.otherUser.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedConv.otherUser.role || "Membre Nexus"}</p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-muted/5">
              <div className="space-y-4">
                {messages.map((msg, idx) => {
                  const isMe = msg.sender_id !== selectedConv.otherUser.id;
                  return (
                    <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`rounded-2xl p-4 max-w-[80%] ${isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-white border rounded-tl-none"}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[9px] mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-white">
              <div className="flex gap-2 items-center">
                <Button variant="ghost" size="icon" className="rounded-full shrink-0" onClick={() => imageInputRef.current?.click()}>
                  <Image className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Votre message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="rounded-2xl bg-muted/30 border-none"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  className="rounded-full h-11 w-11 shrink-0 bg-primary"
                  onClick={handleSendMessage}
                  disabled={isSending || !message.trim()}
                >
                  {isSending ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 opacity-20" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">Vos Messages</h3>
            <p className="max-w-[250px] mt-2">Sélectionnez une conversation pour commencer à discuter avec le réseau.</p>
          </div>
        )}
      </Card>

      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" />
    </div>
  )
}

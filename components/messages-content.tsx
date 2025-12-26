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

import { useState, useRef } from "react"
import { Send, Search, Image, Paperclip } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export function MessagesContent() {
  const [message, setMessage] = useState("")
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const messages = [
    {
      id: 1,
      sender: "Nexus Connect",
      content: "Bonjour! Bienvenue sur Nexus Connect. Comment puis-je vous aider aujourd'hui?",
      time: "10:30",
      isBot: true,
    },
    {
      id: 2,
      sender: "Vous",
      content: "Je voudrais créer mon profil artisan",
      time: "10:32",
      isBot: false,
    },
    {
      id: 3,
      sender: "Service Client",
      content:
        "Excellent! Pour créer votre profil artisan, j'ai besoin de quelques informations. Quelle est votre spécialité artisanale?",
      time: "10:32",
      isBot: true,
    },
    {
      id: 4,
      sender: "Vous",
      content: "Je suis spécialisé dans la poterie traditionnelle",
      time: "10:35",
      isBot: false,
    },
    {
      id: 5,
      sender: "Service Client",
      content:
        "Parfait! La poterie traditionnelle est très recherchée. Dans quelle ville êtes-vous basé? Cela aidera les clients à vous trouver facilement.",
      time: "10:36",
      isBot: true,
    },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      alert(`Image sélectionnée: ${file.name}`)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      alert(`Fichier sélectionné: ${file.name}`)
    }
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage("")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,350px)_1fr] gap-6 h-[calc(100vh-16rem)] overflow-y-auto">
      {/* Conversations List */}
      <Card className="rounded-3xl shadow-sm border-none">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher une conversation..." className="pl-9 rounded-2xl" />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/10 cursor-pointer border border-primary/5">
                <Avatar>
                  <AvatarImage src="/nexus-connect-logo.jpg" />
                  <AvatarFallback>NC</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Service Client</h4>
                    <Badge className="rounded-full bg-green-500 text-[10px] h-4">En ligne</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">Parfait! La poterie traditionnelle est...</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="rounded-3xl shadow-sm border-none">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/nexus-connect-logo.jpg" />
                <AvatarFallback>NC</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-primary">Service Client</h3>
                <p className="text-xs text-muted-foreground italic">En ligne • Répond en quelques minutes</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                  <div className={`flex gap-2 max-w-[75%] ${msg.isBot ? "flex-row" : "flex-row-reverse"}`}>
                    {msg.isBot && (
                      <Avatar className="h-8 w-8 mt-1 border">
                        <AvatarImage src="/nexus-connect-logo.jpg" />
                        <AvatarFallback>NC</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div
                        className={`rounded-2xl p-4 shadow-sm ${msg.isBot
                            ? "bg-muted text-foreground rounded-tl-none border border-muted-foreground/5"
                            : "bg-primary text-primary-foreground rounded-tr-none shadow-md"
                          }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <p className={`text-[10px] text-muted-foreground mt-1.5 px-2 ${msg.isBot ? "text-left" : "text-right"}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t bg-muted/20">
            <div className="flex gap-2">
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => imageInputRef.current?.click()}
              >
                <Image className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Écrivez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="rounded-2xl border-muted bg-white px-4"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage()
                  }
                }}
              />
              <Button
                className="rounded-full shadow-lg transition-transform active:scale-95"
                size="icon"
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-wider font-semibold">
              Support Nexus • Lun-Ven • 9h-18h WAT
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

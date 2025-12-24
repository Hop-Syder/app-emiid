"use client"

import { useState } from "react"
import { Send, Phone, Video, MoreVertical, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export function MessagesContent() {
  const [message, setMessage] = useState("")

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
      sender: "Nexus Connect",
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
      sender: "Nexus Connect",
      content:
        "Parfait! La poterie traditionnelle est très recherchée. Dans quelle ville êtes-vous basé? Cela aidera les clients à vous trouver facilement.",
      time: "10:36",
      isBot: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Conversations List */}
      <Card className="rounded-3xl lg:col-span-1">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher une conversation..." className="pl-9 rounded-2xl" />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/10 cursor-pointer">
                <Avatar>
                  <AvatarImage src="/nexus-connect-logo.jpg" />
                  <AvatarFallback>NC</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Service Nexus Connect</h4>
                    <Badge className="rounded-full bg-green-500">En ligne</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">Parfait! La poterie traditionnelle est...</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="rounded-3xl lg:col-span-2">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/nexus-connect-logo.jpg" />
                <AvatarFallback>NC</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Service Nexus Connect</h3>
                <p className="text-xs text-muted-foreground">En ligne • Répond généralement en quelques minutes</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                  <div className={`flex gap-2 max-w-[70%] ${msg.isBot ? "flex-row" : "flex-row-reverse"}`}>
                    {msg.isBot && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/nexus-connect-logo.jpg" />
                        <AvatarFallback>NC</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div
                        className={`rounded-2xl p-3 ${msg.isBot ? "bg-muted" : "bg-primary text-primary-foreground"}`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-2">{msg.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Écrivez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="rounded-2xl"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    // Handle send message
                    setMessage("")
                  }
                }}
              />
              <Button className="rounded-2xl" size="icon">
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 px-2">
              Notre équipe est disponible du lundi au vendredi, de 9h à 18h WAT
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Centre de médiation admin — litiges, réponses, statuts & outils modérateur.
 * @created 2026-03-23
 * @updated 2026-07-08
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import {
  Send, Search, ArrowLeft, RefreshCw, ExternalLink, Copy, Loader2,
  Gavel, Shield, CircleDot, Clock, CheckCircle2, MessageSquareText,
  ChevronDown, User, CheckCheck,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { fetchWithAuth } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { format, isSameDay, formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

const supabase = createClient()

// URL de l'app utilisateur (pour ouvrir les profils des parties)
const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com"

type MediationStatus = "pending" | "in_progress" | "resolved"

interface Party { id: string; name: string; avatar: string; role: string }

interface AdminConversation {
  id: string
  user1: Party
  user2: Party
  lastMessage: string | null
  lastMessageAt: string | null
  status: MediationStatus
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

// ─── Métadonnées de statut ───────────────────────────────────────────────────
const STATUS_META: Record<MediationStatus, { label: string; short: string; icon: typeof CircleDot; dot: string; chip: string; btn: string }> = {
  pending:     { label: "Médiation ouverte",     short: "Ouvert",   icon: CircleDot,     dot: "bg-amber-500",   chip: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",     btn: "data-[on=true]:bg-amber-500 data-[on=true]:text-white" },
  in_progress: { label: "Médiation en cours",    short: "En cours", icon: Clock,         dot: "bg-blue-500",    chip: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",       btn: "data-[on=true]:bg-[#013ff4] data-[on=true]:text-white" },
  resolved:    { label: "Médiation résolue",     short: "Résolu",   icon: CheckCircle2,  dot: "bg-emerald-500", chip: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-500", btn: "data-[on=true]:bg-emerald-500 data-[on=true]:text-white" },
}

// ─── Réponses rapides (templates de médiation) ───────────────────────────────
const QUICK_REPLIES: { label: string; text: string }[] = [
  { label: "Introduction du médiateur", text: "Bonjour, je suis médiateur EmiID. J'ai pris connaissance de votre litige et je vais vous accompagner vers une résolution équitable." },
  { label: "Demander les faits",        text: "Merci de bien vouloir détailler votre version des faits (dates, montants, prestations concernées) afin que je puisse évaluer la situation." },
  { label: "Proposer une résolution",   text: "Après analyse des échanges, voici ma recommandation : " },
  { label: "Clôturer le litige",        text: "Ce litige est désormais clos. Merci à tous les deux pour votre coopération. N'hésitez pas à recontacter le support en cas de besoin." },
]

export default function AdminMessagesContent() {
  const [conversations, setConversations] = useState<AdminConversation[]>([])
  const [selectedConv, setSelectedConv] = useState<AdminConversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<MediationStatus | "all">("all")
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ─── Chargements ───────────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetchWithAuth("/api/messages/admin/disputes")
      if (res.ok) {
        setConversations(await res.json())
      } else {
        const err = await res.json().catch(() => ({ error: "Erreur de chargement des litiges" }))
        toast.error(err.error || "Erreur de chargement des litiges")
      }
    } catch {
      toast.error("Erreur de chargement des litiges")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentAdminId(user.id)
      loadConversations()
    })()
  }, [loadConversations])

  // Messages de la conversation sélectionnée + realtime
  useEffect(() => {
    if (!selectedConv) return
    const convId = selectedConv.id

    const loadMessages = async () => {
      setIsMessagesLoading(true)
      try {
        const res = await fetchWithAuth(`/api/messages/admin/conversation/${convId}`)
        if (res.ok) {
          setMessages(await res.json())
          void fetchWithAuth(`/api/messages/admin/read/${convId}`, { method: "POST" })
        } else {
          const err = await res.json().catch(() => ({ error: "Erreur de chargement des messages" }))
          toast.error(err.error || "Erreur de chargement des messages")
        }
      } catch {
        toast.error("Erreur de chargement des messages")
      } finally {
        setIsMessagesLoading(false)
      }
    }
    loadMessages()

    const channel = supabase
      .channel(`admin-room-${convId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convId}` },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]))
        },
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [selectedConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ─── Actions ─────────────────────────────────────────────────────────────
  const handleSendAdminReply = async () => {
    if (!message.trim() || !selectedConv || isSending) return
    setIsSending(true)
    try {
      const res = await fetchWithAuth(`/api/messages/admin/reply/${selectedConv.id}`, {
        method: "POST",
        body: JSON.stringify({ content: message }),
      })
      if (res.ok) {
        const sent: Message = await res.json()
        setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]))
        setConversations((prev) => prev.map((c) => c.id === selectedConv.id ? { ...c, lastMessage: sent.content, lastMessageAt: sent.created_at } : c))
        setMessage("")
        inputRef.current?.focus()
      } else {
        const err = await res.json().catch(() => ({ error: "Erreur lors de l'envoi" }))
        toast.error(err.error || "Erreur lors de l'envoi")
      }
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdateStatus = async (status: MediationStatus) => {
    if (!selectedConv || isUpdatingStatus || selectedConv.status === status) return
    if (status === "resolved" && !confirm("Marquer ce litige comme résolu ?")) return
    setIsUpdatingStatus(true)
    try {
      const res = await fetchWithAuth(`/api/messages/admin/status/${selectedConv.id}`, {
        method: "POST",
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur de mise à jour du statut" }))
        toast.error(err.error || "Erreur de mise à jour du statut")
        return
      }
      setConversations((prev) => prev.map((c) => c.id === selectedConv.id ? { ...c, status } : c))
      setSelectedConv((prev) => (prev ? { ...prev, status } : null))
      toast.success(`Litige : ${STATUS_META[status].short.toLowerCase()}`)
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const insertTemplate = (text: string) => {
    setMessage((prev) => (prev ? `${prev.trimEnd()} ${text}` : text))
    inputRef.current?.focus()
  }

  const copyTranscript = async () => {
    if (!selectedConv) return
    const nameFor = (id: string) =>
      id === selectedConv.user1.id ? selectedConv.user1.name
        : id === selectedConv.user2.id ? selectedConv.user2.name
          : "Médiateur EmiID"
    const text = messages
      .map((m) => `[${format(new Date(m.created_at), "dd/MM HH:mm")}] ${nameFor(m.sender_id)} : ${m.content}`)
      .join("\n")
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Conversation copiée")
    } catch {
      toast.error("Copie impossible")
    }
  }

  // ─── Dérivés ────────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all: conversations.length,
    pending: conversations.filter((c) => c.status === "pending").length,
    in_progress: conversations.filter((c) => c.status === "in_progress").length,
    resolved: conversations.filter((c) => c.status === "resolved").length,
  }), [conversations])

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return conversations.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (!q) return true
      return [c.user1.name, c.user2.name, c.lastMessage].filter(Boolean).some((v) => v!.toLowerCase().includes(q))
    })
  }, [conversations, searchQuery, statusFilter])

  const openProfile = (id: string) => window.open(`${USER_APP_URL}/profil/${id}`, "_blank", "noopener,noreferrer")

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950">
      {/* ───────── Liste des litiges ───────── */}
      <aside className={cn("w-full lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900", selectedConv ? "hidden lg:flex" : "flex")}>
        <header className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Gavel className="h-5 w-5 text-[#013ff4] dark:text-[#3a6bff]" />
              Médiations
            </h1>
            <button
              onClick={loadConversations}
              className="flex items-center justify-center min-h-11 min-w-11 rounded-xl text-slate-400 dark:text-slate-500 hover:text-[#013ff4] dark:hover:text-[#3a6bff] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Actualiser"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Rechercher un litige, une partie…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus-visible:ring-[#013ff4]/20 font-medium dark:text-white"
            />
          </div>

          {/* Filtres par statut */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {([
              ["all", "Tous", counts.all],
              ["pending", "Ouverts", counts.pending],
              ["in_progress", "En cours", counts.in_progress],
              ["resolved", "Résolus", counts.resolved],
            ] as const).map(([key, label, n]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-2 min-h-9 rounded-full text-xs font-bold transition-colors",
                  statusFilter === key ? "bg-slate-900 dark:bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
                )}
              >
                {label}
                <span className={cn("min-w-[18px] text-center rounded-full px-1 text-[10px]", statusFilter === key ? "bg-white/20" : "bg-white dark:bg-slate-900")}>{n}</span>
              </button>
            ))}
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => <div key={i} className="h-[76px] rounded-2xl bg-slate-50 dark:bg-slate-800/50 animate-pulse m-1" />)
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const active = selectedConv?.id === conv.id
                const st = STATUS_META[conv.status]
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={cn(
                      "w-full p-3.5 rounded-2xl transition-all group border text-left",
                      active ? "bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-lg" : "hover:bg-slate-50 dark:hover:bg-slate-800/60 border-transparent",
                    )}
                  >
                    <div className="flex gap-3 items-center">
                      <div className="flex -space-x-3 shrink-0">
                        <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-900 ring-1 ring-slate-100 dark:ring-slate-800">
                          <AvatarImage src={conv.user1.avatar} />
                          <AvatarFallback>{conv.user1.name[0]}</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-900 ring-1 ring-slate-100 dark:ring-slate-800">
                          <AvatarImage src={conv.user2.avatar} />
                          <AvatarFallback>{conv.user2.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={cn("font-bold text-sm truncate", active ? "text-white" : "text-slate-900 dark:text-white")}>
                            {conv.user1.name} <span className="opacity-40">vs</span> {conv.user2.name}
                          </h3>
                          <span className={cn("shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase", st.chip)}>{st.short}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className={cn("text-xs truncate", active ? "text-slate-300" : "text-slate-500 dark:text-slate-400")}>
                            {conv.lastMessage || "Pas encore de message"}
                          </p>
                          {conv.lastMessageAt && (
                            <span className={cn("shrink-0 text-[10px]", active ? "text-slate-400" : "text-slate-400 dark:text-slate-500")}>
                              {formatDistanceToNow(new Date(conv.lastMessageAt), { locale: fr, addSuffix: false })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-300 dark:text-slate-700">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-3xl mb-4"><CheckCheck className="h-9 w-9" /></div>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Aucun litige {statusFilter !== "all" ? "dans ce filtre" : "en cours"}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* ───────── Zone de médiation ───────── */}
      <main className={cn("flex-1 flex flex-col h-full bg-white dark:bg-slate-900 relative", !selectedConv && "hidden lg:flex lg:items-center lg:justify-center bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800")}>
        {selectedConv ? (
          <>
            {/* En-tête */}
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-20">
              <div className="h-[68px] flex items-center justify-between px-4 lg:px-8">
                <div className="flex items-center gap-3 min-w-0">
                  <Button variant="ghost" size="icon" className="lg:hidden rounded-xl shrink-0" onClick={() => setSelectedConv(null)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex -space-x-3 shrink-0">
                    <Avatar className="h-11 w-11 border-2 border-white dark:border-slate-900 shadow-sm">
                      <AvatarImage src={selectedConv.user1.avatar} />
                      <AvatarFallback>{selectedConv.user1.name[0]}</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-11 w-11 border-2 border-white dark:border-slate-900 shadow-sm">
                      <AvatarImage src={selectedConv.user2.avatar} />
                      <AvatarFallback>{selectedConv.user2.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                      {selectedConv.user1.name} <span className="text-slate-300 dark:text-slate-600 font-normal">&amp;</span> {selectedConv.user2.name}
                      <Shield className="h-4 w-4 text-amber-500 shrink-0" />
                    </h2>
                    <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_META[selectedConv.status].dot, selectedConv.status !== "resolved" && "animate-pulse")} />
                      {STATUS_META[selectedConv.status].label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={copyTranscript} title="Copier la conversation" className="hidden sm:flex items-center justify-center min-h-11 min-w-11 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-semibold">
                        <User className="h-4 w-4" /> Parties <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Consulter un profil</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openProfile(selectedConv.user1.id)}>
                        <ExternalLink className="mr-2 h-4 w-4" /> {selectedConv.user1.name}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openProfile(selectedConv.user2.id)}>
                        <ExternalLink className="mr-2 h-4 w-4" /> {selectedConv.user2.name}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={copyTranscript} className="sm:hidden">
                        <Copy className="mr-2 h-4 w-4" /> Copier la conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Barre d'actions de statut */}
              <div className="flex items-center gap-2 px-4 lg:px-8 pb-3 overflow-x-auto no-scrollbar">
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mr-1">Statut :</span>
                {(Object.keys(STATUS_META) as MediationStatus[]).map((s) => {
                  const meta = STATUS_META[s]
                  const on = selectedConv.status === s
                  const Icon = meta.icon
                  return (
                    <button
                      key={s}
                      data-on={on}
                      onClick={() => handleUpdateStatus(s)}
                      disabled={isUpdatingStatus || on}
                      className={cn(
                        "shrink-0 inline-flex items-center gap-1.5 px-3 py-2 min-h-9 rounded-full text-xs font-bold border transition-all disabled:cursor-default",
                        on ? "border-transparent" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                        meta.btn,
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" /> {meta.short}
                    </button>
                  )
                })}
                {isUpdatingStatus && <Loader2 className="h-4 w-4 animate-spin text-slate-400 dark:text-slate-500 ml-1 shrink-0" />}
              </div>
            </header>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 lg:px-10 py-6 bg-slate-50/40 dark:bg-slate-950/40">
              {isMessagesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-[#013ff4] dark:text-[#3a6bff]" />
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages.map((msg, i) => {
                    const prev = messages[i - 1]
                    const showDay = !prev || !isSameDay(new Date(prev.created_at), new Date(msg.created_at))
                    const isOwn = msg.sender_id === currentAdminId
                    const sender = msg.sender_id === selectedConv.user1.id ? selectedConv.user1
                      : msg.sender_id === selectedConv.user2.id ? selectedConv.user2
                        : { id: "admin", name: "Médiateur EmiID", avatar: "", role: "admin" }

                    const isMediation = msg.content.includes("[MÉDIATION DEMANDÉE]")
                    const isStatusUpdate = msg.content.includes("[MÉDIATION STATUT]")

                    return (
                      <div key={msg.id}>
                        {showDay && (
                          <div className="flex justify-center my-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1">
                              {format(new Date(msg.created_at), "EEEE d MMMM", { locale: fr })}
                            </span>
                          </div>
                        )}

                        {isMediation ? (
                          <div className="flex justify-center my-4">
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl px-6 py-3.5 flex items-center gap-3 max-w-lg shadow-sm">
                              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                              <div>
                                <p className="text-[10px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-wide mb-0.5">Alerte médiation</p>
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 italic">
                                  {msg.content.replace(/⚠️ \[MÉDIATION DEMANDÉE\] Motif : .*?\. /, "")}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : isStatusUpdate ? (
                          <div className="flex justify-center my-3">
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-full px-5 py-2 text-xs font-semibold text-blue-800 dark:text-blue-400">
                              {msg.content.toLowerCase().includes("resolved") ? "Médiation marquée comme résolue"
                                : msg.content.toLowerCase().includes("in_progress") ? "Médiation prise en charge"
                                  : "Médiation rouverte"}
                            </div>
                          </div>
                        ) : (
                          <div className={cn("flex gap-3 group", isOwn ? "flex-row-reverse" : "flex-row")}>
                            <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-900 shadow-sm shrink-0 mt-1">
                              <AvatarImage src={sender.avatar} />
                              <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-800 dark:text-slate-300 font-bold">{sender.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className={cn("flex flex-col gap-1 max-w-[78%]", isOwn ? "items-end" : "items-start")}>
                              <div className="flex items-center gap-2 px-1">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{sender.name}</span>
                                <span className="text-[10px] text-slate-300 dark:text-slate-600">{format(new Date(msg.created_at), "HH:mm", { locale: fr })}</span>
                              </div>
                              <div className={cn(
                                "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                                isOwn ? "bg-[#013ff4] text-white rounded-tr-sm"
                                  : sender.role === "admin" ? "bg-amber-100 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 rounded-tl-sm font-semibold"
                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-sm",
                              )}>
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Saisie */}
            <footer className="p-4 lg:px-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-2.5">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={inputRef}
                      placeholder="Votre intervention en tant que médiateur…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendAdminReply() }
                      }}
                      className="min-h-[52px] max-h-[180px] py-3.5 pl-4 pr-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:ring-1 focus-visible:ring-[#013ff4]/40 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                      rows={1}
                    />
                    {/* Réponses rapides */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button title="Réponses rapides" className="absolute right-2.5 bottom-2.5 flex items-center justify-center h-9 w-9 rounded-lg text-slate-400 dark:text-slate-500 hover:text-[#013ff4] dark:hover:text-[#3a6bff] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          <MessageSquareText className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="top" align="end" className="w-[min(20rem,calc(100vw-2rem))]">
                        <DropdownMenuLabel>Réponses rapides</DropdownMenuLabel>
                        {QUICK_REPLIES.map((q) => (
                          <DropdownMenuItem key={q.label} onClick={() => insertTemplate(q.text)} className="flex-col items-start gap-0.5 py-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{q.label}</span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2">{q.text}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Button
                    size="icon"
                    className="h-[52px] w-[52px] rounded-2xl bg-[#013ff4] hover:bg-[#012fc0] text-white shadow-lg shadow-[#013ff4]/20 transition-all active:scale-95 shrink-0"
                    onClick={handleSendAdminReply}
                    disabled={!message.trim() || isSending}
                  >
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 pl-1">Entrée pour envoyer · Maj+Entrée pour un saut de ligne</p>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center space-y-4">
            <div className="w-28 h-28 bg-white dark:bg-slate-900 rounded-[36px] shadow-xl flex items-center justify-center text-slate-300 dark:text-slate-700 relative">
              <Shield className="h-14 w-14" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#013ff4] rounded-full flex items-center justify-center text-white ring-8 ring-slate-50 dark:ring-slate-950">
                <Gavel className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Centre de médiation</h2>
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500 leading-relaxed">
                Sélectionnez un litige pour analyser les échanges, répondre aux parties et faire évoluer le statut de la médiation.
              </p>
            </div>
            <Button variant="outline" className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 h-11 px-6 font-bold text-slate-900 dark:text-white dark:hover:bg-slate-800" onClick={loadConversations}>
              <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> Actualiser les litiges
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

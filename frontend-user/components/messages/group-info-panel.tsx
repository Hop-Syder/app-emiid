/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Panneau latéral d'information et d'administration d'un groupe (style WhatsApp).
 * @created 2026-07-11
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  Users, Pencil, Check, X, Loader2, LogOut, Trash2, UserPlus,
  MoreVertical, ShieldCheck, ShieldMinus, UserMinus, Crown, Search,
} from "lucide-react"

import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getOptimizedImageUrl } from "@/lib/image-optimization"
import type { Conversation, GroupMember, GroupRole } from "./types"
import {
  fetchGroupMembers, updateGroup, addGroupMembers, manageParticipant, leaveGroup,
  roleLabel, deleteConversation,
} from "@/features/messages/messagesApi"

type GroupPatch = Partial<Pick<Conversation, "name" | "description" | "member_count">>

interface GroupInfoPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversation: Conversation
  currentUserId: string | null
  onGroupUpdated: (patch: GroupPatch) => void
  onLeft: (conversationId: string) => void
}

interface SearchResult {
  id: string
  name: string
  avatar?: string | null
  role?: string | null
}

const roleRank: Record<GroupRole, number> = { owner: 0, admin: 1, member: 2 }

export function GroupInfoPanel({
  open, onOpenChange, conversation, currentUserId, onGroupUpdated, onLeft,
}: GroupInfoPanelProps) {
  const convId = conversation.id
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(false)

  // Édition du titre
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(conversation.name || "")
  const [savingName, setSavingName] = useState(false)

  // Édition de la description
  const [editingDesc, setEditingDesc] = useState(false)
  const [descDraft, setDescDraft] = useState(conversation.description || "")
  const [savingDesc, setSavingDesc] = useState(false)

  // Ajout de membres
  const [addOpen, setAddOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)

  // Confirmations destructives
  const [confirm, setConfirm] = useState<null | { kind: "leave" | "delete" | "remove" | "ban"; target?: GroupMember }>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const myRole: GroupRole | null = useMemo(() => {
    const me = members.find((m) => m.user_id === currentUserId)
    return me?.role ?? null
  }, [members, currentUserId])

  const isAdmin = myRole === "owner" || myRole === "admin"
  const isOwner = myRole === "owner"

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchGroupMembers(convId)
      list.sort((a, b) => (roleRank[a.role] - roleRank[b.role]))
      setMembers(list)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de chargement des membres")
    } finally {
      setLoading(false)
    }
  }, [convId])

  useEffect(() => {
    if (open) {
      setNameDraft(conversation.name || "")
      setEditingName(false)
      setDescDraft(conversation.description || "")
      setEditingDesc(false)
      setAddOpen(false)
      setQuery("")
      setResults([])
      load()
    }
  }, [open, convId, conversation.name, conversation.description, load])

  // Recherche de membres à ajouter (annuaire) — debounce léger
  useEffect(() => {
    if (!addOpen) return
    const q = query.trim()
    if (q.length < 2) { setResults([]); return }
    let active = true
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/annuaire?search=${encodeURIComponent(q)}&limit=8`)
        const data = await res.json().catch(() => ({}))
        if (!active) return
        const existing = new Set(members.map((m) => m.user_id))
        setResults((data.profiles || []).filter((p: SearchResult) => !existing.has(p.id)))
      } catch {
        if (active) setResults([])
      } finally {
        if (active) setSearching(false)
      }
    }, 300)
    return () => { active = false; clearTimeout(t) }
  }, [query, addOpen, members])

  const saveName = async () => {
    const value = nameDraft.trim()
    if (value.length < 2) {
      toast.error("Le titre doit contenir au moins 2 caractères")
      return
    }
    if (value === (conversation.name || "")) { setEditingName(false); return }
    setSavingName(true)
    try {
      await updateGroup(convId, { name: value })
      onGroupUpdated({ name: value })
      setEditingName(false)
      toast.success("Titre mis à jour")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de modifier le titre")
    } finally {
      setSavingName(false)
    }
  }

  const saveDescription = async () => {
    setSavingDesc(true)
    try {
      const value = descDraft.trim()
      await updateGroup(convId, { description: value || null })
      onGroupUpdated({ description: value || null })
      setEditingDesc(false)
      toast.success("Description mise à jour")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de modifier la description")
    } finally {
      setSavingDesc(false)
    }
  }

  const addMember = async (u: SearchResult) => {
    setAdding(u.id)
    try {
      await addGroupMembers(convId, [u.id])
      toast.success(`${u.name} ajouté(e) au groupe`)
      setResults((prev) => prev.filter((r) => r.id !== u.id))
      await load()
      onGroupUpdated({ member_count: (conversation.member_count ?? members.length) + 1 })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible d'ajouter ce membre")
    } finally {
      setAdding(null)
    }
  }

  const act = async (member: GroupMember, action: "promote" | "demote") => {
    try {
      await manageParticipant(convId, member.user_id, action)
      setMembers((prev) => prev.map((m) =>
        m.user_id === member.user_id ? { ...m, role: action === "promote" ? "admin" : "member" } : m
      ))
      toast.success(action === "promote" ? "Promu administrateur" : "Rétrogradé en membre")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action impossible")
    }
  }

  const runConfirm = async () => {
    if (!confirm) return
    setConfirmLoading(true)
    try {
      if (confirm.kind === "leave") {
        await leaveGroup(convId)
        toast.success("Vous avez quitté le groupe")
        onLeft(convId)
        onOpenChange(false)
      } else if (confirm.kind === "delete") {
        await deleteConversation(convId)
        toast.success("Groupe supprimé")
        onLeft(convId)
        onOpenChange(false)
      } else if (confirm.target) {
        await manageParticipant(convId, confirm.target.user_id, confirm.kind === "ban" ? "ban" : "remove")
        setMembers((prev) => prev.filter((m) => m.user_id !== confirm.target!.user_id))
        onGroupUpdated({ member_count: Math.max(0, (conversation.member_count ?? members.length) - 1) })
        toast.success(confirm.kind === "ban" ? "Membre banni" : "Membre retiré")
      }
      setConfirm(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action impossible")
    } finally {
      setConfirmLoading(false)
    }
  }

  const memberName = (m: GroupMember) =>
    `${m.profile?.first_name || "Membre"} ${m.profile?.last_name || ""}`.trim()

  const avatarUrl = conversation.avatar_url
    ? getOptimizedImageUrl(conversation.avatar_url, { width: 160, height: 160, quality: 85 })
    : null

  const confirmCopy = (): { title: string; description: string; confirmText: string } => {
    switch (confirm?.kind) {
      case "leave": return { title: "Quitter le groupe ?", description: "Vous ne recevrez plus les messages de ce groupe.", confirmText: "Quitter" }
      case "delete": return { title: "Supprimer le groupe ?", description: "Le groupe et tous ses messages seront supprimés pour tous les membres. Action irréversible.", confirmText: "Supprimer" }
      case "ban": return { title: "Bannir ce membre ?", description: `${confirm.target ? memberName(confirm.target) : "Ce membre"} ne pourra plus rejoindre le groupe.`, confirmText: "Bannir" }
      default: return { title: "Retirer ce membre ?", description: `${confirm?.target ? memberName(confirm.target) : "Ce membre"} sera retiré du groupe.`, confirmText: "Retirer" }
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="p-0 gap-0">
          {/* En-tête */}
          <SheetHeader className="items-center text-center gap-3 border-b border-slate-100 bg-gradient-to-b from-[#013ff4]/5 to-transparent pt-10">
            <Avatar className="h-24 w-24 rounded-3xl ring-4 ring-white shadow-lg">
              <AvatarImage src={avatarUrl || undefined} alt={conversation.name || "Groupe"} className="object-cover" />
              <AvatarFallback className="rounded-3xl bg-gradient-to-br from-[#013ff4] to-[#03b3f8] text-white">
                <Users className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            {editingName ? (
              <div className="w-full max-w-xs flex flex-col items-center gap-2">
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  maxLength={80}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false) }}
                  className="w-full text-center text-lg font-black text-slate-900 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30"
                />
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="rounded-lg h-8" onClick={() => setEditingName(false)} disabled={savingName}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="rounded-lg h-8 bg-[#013ff4] hover:bg-[#012fc0]" onClick={saveName} disabled={savingName}>
                    {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <SheetTitle className="text-xl flex items-center justify-center gap-1.5">
                <span>{conversation.name || "Groupe"}</span>
                {conversation.is_verified && (
                  <Image
                    src="/badge/badge-blue-verifation.png"
                    alt="Communauté vérifiée"
                    width={18}
                    height={18}
                    className="inline-block shrink-0"
                  />
                )}
                {isAdmin && (
                  <button
                    onClick={() => { setNameDraft(conversation.name || ""); setEditingName(true) }}
                    className="ml-0.5 text-slate-400 hover:text-[#013ff4] transition-colors p-1 rounded-lg hover:bg-[#013ff4]/5"
                    aria-label="Modifier le titre"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </SheetTitle>
            )}
            <SheetDescription className="font-semibold">
              {members.length || conversation.member_count || 0} membre{(members.length || conversation.member_count || 0) > 1 ? "s" : ""}
              {conversation.is_community && <span className="ml-2 text-[#013ff4]">· Communauté</span>}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            {/* Description (Bento / glassmorphism) */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Description</h3>
                {isAdmin && !editingDesc && (
                  <button
                    onClick={() => { setDescDraft(conversation.description || ""); setEditingDesc(true) }}
                    className="text-slate-400 hover:text-[#013ff4] transition-colors p-1 rounded-lg hover:bg-[#013ff4]/5"
                    aria-label="Modifier la description"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md p-4 shadow-sm">
                {editingDesc ? (
                  <div className="space-y-3">
                    <textarea
                      value={descDraft}
                      onChange={(e) => setDescDraft(e.target.value)}
                      maxLength={500}
                      rows={4}
                      autoFocus
                      placeholder="Présentez le groupe en quelques mots…"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setEditingDesc(false)} disabled={savingDesc}>
                        <X className="h-4 w-4 mr-1" /> Annuler
                      </Button>
                      <Button size="sm" className="rounded-xl bg-[#013ff4] hover:bg-[#012fc0]" onClick={saveDescription} disabled={savingDesc}>
                        {savingDesc ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Enregistrer</>}
                      </Button>
                    </div>
                  </div>
                ) : conversation.description ? (
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{conversation.description}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">Aucune description{isAdmin ? " — cliquez sur le crayon pour en ajouter." : "."}</p>
                )}
              </div>
            </section>

            {/* Ajout de membres (admin) */}
            {isAdmin && (
              <section>
                <button
                  onClick={() => setAddOpen((v) => !v)}
                  className="w-full flex items-center gap-3 rounded-2xl border border-dashed border-[#013ff4]/30 bg-[#013ff4]/[0.03] px-4 py-3 text-left text-sm font-bold text-[#013ff4] hover:bg-[#013ff4]/[0.06] transition-colors"
                >
                  <UserPlus className="h-4 w-4" /> Ajouter des membres
                </button>
                {addOpen && (
                  <div className="mt-3 rounded-2xl border border-slate-200/60 bg-white/60 p-3 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher un membre EmiID…"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30"
                      />
                    </div>
                    {searching && <p className="text-xs text-slate-400 px-1">Recherche…</p>}
                    {!searching && query.trim().length >= 2 && results.length === 0 && (
                      <p className="text-xs text-slate-400 px-1">Aucun résultat.</p>
                    )}
                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {results.map((u) => (
                        <div key={u.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-slate-50">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={u.avatar || undefined} alt={u.name} className="object-cover" />
                            <AvatarFallback className="bg-slate-200 text-slate-500 text-xs font-bold">{u.name?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                            {u.role && <p className="text-[11px] text-slate-400 truncate">{u.role}</p>}
                          </div>
                          <Button size="sm" variant="ghost" className="rounded-lg h-8 text-[#013ff4] hover:bg-[#013ff4]/10" disabled={adding === u.id} onClick={() => addMember(u)}>
                            {adding === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Membres */}
            <section>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Membres du groupe</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <ul className="space-y-1">
                  {members.map((m) => {
                    const isMe = m.user_id === currentUserId
                    const label = roleLabel(m.role)
                    const canManage = isAdmin && !isMe && m.role !== "owner"
                    const av = m.profile?.avatar_url
                      ? getOptimizedImageUrl(m.profile.avatar_url, { width: 80, height: 80, quality: 80 })
                      : null
                    return (
                      <li key={m.user_id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50 transition-colors">
                        <Avatar className="h-10 w-10 shrink-0 ring-1 ring-slate-100">
                          <AvatarImage src={av || undefined} alt={memberName(m)} className="object-cover" />
                          <AvatarFallback className="bg-slate-200 text-slate-500 text-xs font-bold">{(m.profile?.first_name?.[0] || "?").toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {memberName(m)} {isMe && <span className="text-slate-400 font-medium">(vous)</span>}
                          </p>
                          {m.profile?.role && <p className="text-[11px] text-slate-400 truncate">{m.profile.role}</p>}
                        </div>
                        {label && (
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0",
                            m.role === "owner" ? "bg-amber-100 text-amber-700" : "bg-[#013ff4]/10 text-[#013ff4]"
                          )}>
                            {m.role === "owner" && <Crown className="h-3 w-3" />} {label}
                          </span>
                        )}
                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0" aria-label="Options du membre">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 rounded-xl">
                              {m.role === "member" ? (
                                <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => act(m, "promote")}>
                                  <ShieldCheck className="mr-2 h-4 w-4 text-[#013ff4]" /> Nommer administrateur
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => act(m, "demote")}>
                                  <ShieldMinus className="mr-2 h-4 w-4 text-slate-500" /> Rétrograder en membre
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="rounded-lg cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => setConfirm({ kind: "remove", target: m })}>
                                <UserMinus className="mr-2 h-4 w-4" /> Retirer du groupe
                              </DropdownMenuItem>
                              {isOwner && (
                                <DropdownMenuItem className="rounded-lg cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => setConfirm({ kind: "ban", target: m })}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Bannir
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* Pied : Quitter / Supprimer */}
          <div className="border-t border-slate-100 p-4 bg-white">
            {isOwner ? (
              <Button
                variant="ghost"
                className="w-full justify-center rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
                onClick={() => setConfirm({ kind: "delete" })}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer le groupe
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-center rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
                onClick={() => setConfirm({ kind: "leave" })}
              >
                <LogOut className="h-4 w-4 mr-2" /> Quitter le groupe
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmActionDialog
        isOpen={!!confirm}
        onClose={() => !confirmLoading && setConfirm(null)}
        onConfirm={runConfirm}
        isLoading={confirmLoading}
        variant="destructive"
        {...confirmCopy()}
      />
    </>
  )
}

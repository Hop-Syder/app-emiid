/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contenu principal de messagerie en temps réel, épuré de sa logique métier.
 * @created 2026-06-05
 * @updated 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, MoreHorizontal, Gavel, Trash2, MessageSquare, Search, X, UsersRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessages } from "@/hooks/use-messages"
import type { Conversation } from "./messages/types"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ChatSidebar } from "./messages/chat-sidebar"
import { NewGroupModal } from "./messages/new-group-modal"
import { GroupInfoPanel } from "./messages/group-info-panel"
import { MessageList } from "./messages/message-list"
import { MessageInput } from "./messages/message-input"
import { MediationDialog } from "./messages/mediation-dialog"
import { ChatCallButtons } from "./messages/chat-call-buttons"

export function MessagesContent() {
  const searchParams = useSearchParams()
  const draftContact = searchParams.get("contact")
  const draftText = searchParams.get("texte")?.slice(0, 500) || undefined
  const router = useRouter()
  const {
    selectedConv,
    setSelectedConv,
    showNewGroup,
    setShowNewGroup,
    groupPanelOpen,
    setGroupPanelOpen,
    loadingConv,
    conversationsError,
    loadingMsgs,
    searchQuery,
    setSearchQuery,
    showChatMobile,
    setShowChatMobile,
    isMediationOpen,
    setIsMediationOpen,
    isMediationLoading,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    onlineUserIds,
    inChatSearchOpen,
    setInChatSearchOpen,
    inChatQuery,
    setInChatQuery,
    editingMessage,
    setEditingMessage,
    handleGroupUpdated,
    handleGroupLeft,
    handleGroupCreated,
    displayedMessages,
    handleTogglePin,
    handleToggleArchive,
    handleRequestMediation,
    handleDeleteConversation,
    confirmDeleteConversation,
    handleSendMessage,
    handleEditMessage,
    handleDeleteMessage,
    handleResendMessage,
    onStartEdit,
    realtimeConnected,
    currentUserId,
    filteredConversations,
  } = useMessages()

  return (
    <div className="flex h-full w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:bg-none dark:bg-background overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-blue-100/40 dark:bg-blue-900/40 blur-3xl opacity-50 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#d5e0ff]/40 blur-3xl opacity-50 mix-blend-multiply pointer-events-none" />

      {/* Left column: conversation list */}
      <div className={cn("relative h-full w-full shrink-0 md:w-[360px] md:block md:shrink-0", showChatMobile && "hidden md:block")}>
        {/* FAB — Nouveau groupe */}
        <button
          onClick={() => setShowNewGroup(true)}
          title="Nouveau groupe"
          aria-label="Nouveau groupe"
          className="absolute bottom-5 right-5 z-30 h-12 w-12 rounded-2xl bg-[#013ff4] text-white shadow-lg shadow-[#013ff4]/30 flex items-center justify-center hover:bg-[#012fc0] active:scale-95 transition-all"
        >
          <UsersRound className="h-5 w-5" />
        </button>
        <ChatSidebar
          conversations={filteredConversations}
          activeId={selectedConv?.id || null}
          onSelect={(conv: Conversation) => {
            setSelectedConv(conv)
            setShowChatMobile(true)
            if (conv.is_group) {
              router.push(`/messages?conv=${conv.id}`, { scroll: false })
            } else {
              const resolvedId = conv.other_participant.user_id || conv.other_participant.id
              router.push(`/messages?contact=${resolvedId}`, { scroll: false })
            }
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={loadingConv}
          hasError={conversationsError}
          onlineUserIds={onlineUserIds}
          onPin={handleTogglePin}
          onArchive={handleToggleArchive}
          onDelete={handleDeleteConversation}
        />
      </div>

      {/* Right column: chat area */}
      <div className={cn("flex-1 flex flex-col h-full relative z-10", !showChatMobile && "hidden md:block")}>
        {selectedConv ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-white/40 dark:border-white/10 flex items-center justify-between bg-card/70 backdrop-blur-xl z-20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] shrink-0">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Retour aux discussions"
                  className="md:hidden -ml-2 hover:bg-muted/50 h-11 w-11 rounded-full text-foreground dark:text-white"
                  onClick={() => { setShowChatMobile(false); router.push("/messages", { scroll: false }) }}
                >
                  <ArrowLeft className="h-4 w-4 text-foreground dark:text-white" />
                </Button>
                {/* En-tête cliquable : ouvre le panneau d'info seulement pour un groupe. */}
                <button
                  type="button"
                  disabled={!selectedConv.is_group}
                  onClick={() => selectedConv.is_group && setGroupPanelOpen(true)}
                  aria-label={selectedConv.is_group ? "Voir les informations du groupe" : undefined}
                  className={cn(
                    "flex items-center gap-3 text-left rounded-xl -m-1 p-1 transition-colors",
                    selectedConv.is_group ? "cursor-pointer hover:bg-muted/60" : "cursor-default"
                  )}
                >
                  <div className="relative group">
                    <Avatar className="h-10 w-10 ring-2 ring-[#d5e0ff] transition-transform group-hover:scale-105">
                      <AvatarImage src={selectedConv.other_participant.avatar_url || "/profil/avatar.jpg"} />
                      <AvatarFallback className="bg-gradient-to-br from-[#4d72ff] to-primary text-white font-bold text-sm">
                        {selectedConv.other_participant.first_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {!selectedConv.is_group && (
                      <span className={cn(
                        "absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full transition-colors",
                        onlineUserIds.has(selectedConv.other_participant.user_id) ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground leading-tight">
                      {selectedConv.other_participant.first_name} {selectedConv.other_participant.last_name}
                    </h2>
                    {selectedConv.is_group ? (
                      <span className="text-[11px] font-semibold text-slate-400">
                        {(selectedConv.member_count ?? 0)} membre{(selectedConv.member_count ?? 0) > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className={cn(
                        "text-[11px] font-semibold",
                        onlineUserIds.has(selectedConv.other_participant.user_id) ? "text-emerald-600" : "text-slate-400"
                      )}>
                        {onlineUserIds.has(selectedConv.other_participant.user_id) ? "En ligne" : "Hors ligne"}
                      </span>
                    )}
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-0.5">
                {!selectedConv.is_group && (
                  <ChatCallButtons
                    userId={selectedConv.other_participant.user_id}
                    name={selectedConv.other_participant.first_name}
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Rechercher dans la discussion"
                  aria-pressed={inChatSearchOpen}
                  className={cn(
                    "h-11 w-11 lg:h-9 lg:w-9 rounded-full lg:rounded-xl transition-colors",
                    inChatSearchOpen ? "text-primary bg-primary/10" : "text-slate-400 hover:text-primary hover:bg-primary/5"
                  )}
                  onClick={() => setInChatSearchOpen((v) => { const next = !v; if (!next) setInChatQuery(""); return next })}
                >
                  <Search className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Plus d'options" className="text-slate-400 hover:text-muted-foreground hover:bg-muted/50 h-11 w-11 lg:h-9 lg:w-9 rounded-full lg:rounded-xl">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-border">
                    <DropdownMenuItem className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 rounded-lg" onClick={() => setIsMediationOpen(true)}>
                      <Gavel className="mr-2 h-4 w-4" /> Demander médiation
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg animate-none cursor-pointer" onClick={() => handleDeleteConversation()}>
                      <Trash2 className="mr-2 h-4 w-4" /> Supprimer discussion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* In-chat search bar */}
            {inChatSearchOpen && (
              <div className="px-4 py-2 border-b border-white/40 dark:border-white/10 bg-card/60 backdrop-blur-xl z-10 shrink-0 flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={inChatQuery}
                  onChange={(e) => setInChatQuery(e.target.value)}
                  placeholder="Rechercher dans cette discussion..."
                  aria-label="Texte à rechercher dans la discussion"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-slate-400 outline-none"
                />
                {inChatQuery.trim() && (
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                    {displayedMessages.length} résultat{displayedMessages.length > 1 ? "s" : ""}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Fermer la recherche"
                  className="h-10 w-10 md:h-7 md:w-7 rounded-lg text-slate-400 hover:text-muted-foreground hover:bg-muted/50 shrink-0"
                  onClick={() => { setInChatSearchOpen(false); setInChatQuery("") }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {loadingMsgs ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-muted/10 backdrop-blur-sm">
                <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
                <p className="text-sm text-muted-foreground font-medium">Chargement des messages...</p>
              </div>
            ) : (
              <MessageList
                messages={displayedMessages}
                currentUserId={currentUserId || ""}
                onEditMessage={onStartEdit}
                onDeleteMessage={handleDeleteMessage}
                onResendMessage={handleResendMessage}
              />
            )}

            {!realtimeConnected && (
              <p className="text-xs text-rose-500 flex items-center justify-center gap-2 py-1.5 bg-rose-50 dark:bg-rose-950/30 font-medium shrink-0">
                <span className="inline-block h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                Connexion en direct interrompue — les nouveaux messages peuvent tarder à s&apos;afficher
              </p>
            )}
            <MessageInput
              // Le brouillon ?texte= (devis depuis une fiche profil) ne s'applique
              // qu'à la discussion ouverte avec ce contact, et n'est jamais envoyé
              // sans action de l'utilisateur.
              key={selectedConv.id}
              initialText={
                draftText && selectedConv.other_participant.user_id === draftContact ? draftText : undefined
              }
              onSend={handleSendMessage}
              isDisabled={false}
              editingMessage={editingMessage}
              onCancelEdit={() => setEditingMessage(null)}
              onEditSubmit={handleEditMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-muted/30 backdrop-blur-md p-8 text-center h-full">
            <div className="w-24 h-24 bg-card shadow-xl shadow-[#d5e0ff]/50 rounded-full flex items-center justify-center mb-6 border border-border">
              <MessageSquare className="h-10 w-10 text-primary/60" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Vos Messages</h2>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              Sélectionnez une conversation dans le panneau latéral pour commencer à échanger avec votre réseau.
            </p>
          </div>
        )}
      </div>

      <MediationDialog
        isOpen={isMediationOpen}
        onClose={() => setIsMediationOpen(false)}
        onConfirm={handleRequestMediation}
        isLoading={isMediationLoading}
      />

      <ConfirmActionDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteConversation}
        variant="destructive"
        title="Supprimer la conversation ?"
        description="Cette action supprimera tout l'historique des messages pour vous. Cette action est irréversible."
        confirmText="Supprimer définitivement"
      />

      <NewGroupModal
        open={showNewGroup}
        onOpenChange={setShowNewGroup}
        onCreated={handleGroupCreated}
      />

      {selectedConv?.is_group && (
        <GroupInfoPanel
          open={groupPanelOpen}
          onOpenChange={setGroupPanelOpen}
          conversation={selectedConv}
          currentUserId={currentUserId}
          onGroupUpdated={handleGroupUpdated}
          onLeft={handleGroupLeft}
        />
      )}
    </div>
  )
}

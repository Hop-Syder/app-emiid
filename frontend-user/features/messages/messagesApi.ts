import { fetchWithAuth, readApiError } from "@/lib/apiClient"
import type { Conversation, Message, GroupMember, GroupRole } from "@/components/messages/types"

export interface SupportUser {
  id: string
  name: string
  avatar: string | null
  role: string | null
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetchWithAuth("/api/messages/conversations")
  if (!res.ok) {
    throw new Error(await readApiError(res, "Impossible de charger les conversations"))
  }
  const data = await res.json()
  return Array.isArray(data) ? (data as Conversation[]) : []
}

export async function fetchConversationMessages(conversationId: string): Promise<Message[]> {
  const res = await fetchWithAuth(`/api/messages/conversation/${conversationId}`)
  if (!res.ok) {
    throw new Error(await readApiError(res, "Impossible de charger les messages"))
  }
  const data = await res.json()
  return Array.isArray(data) ? (data as Message[]) : []
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const res = await fetchWithAuth(`/api/messages/conversation/${conversationId}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error(await readApiError(res, "Impossible de supprimer la conversation"))
  }
}

export async function requestMediation(conversationId: string, reason: string): Promise<void> {
  const res = await fetchWithAuth(`/api/messages/dispute/${conversationId}`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  })
  if (!res.ok) {
    throw new Error(await readApiError(res, "Impossible de demander une médiation"))
  }
}

// ─── Groupes ──────────────────────────────────────────────────────────────
export async function fetchGroupMembers(conversationId: string): Promise<GroupMember[]> {
  const res = await fetchWithAuth(`/api/messages/groups/${conversationId}/members`)
  if (!res.ok) {
    throw new Error(await readApiError(res, "Impossible de charger les membres"))
  }
  const data = await res.json()
  return Array.isArray(data) ? (data as GroupMember[]) : []
}

export async function updateGroup(
  conversationId: string,
  patch: { name?: string; description?: string | null }
): Promise<void> {
  const res = await fetchWithAuth(`/api/messages/groups/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    throw new Error(await readApiError(res, "Impossible de modifier le groupe"))
  }
}

export async function addGroupMembers(conversationId: string, memberIds: string[]): Promise<void> {
  const res = await fetchWithAuth(`/api/messages/groups/${conversationId}/members`, {
    method: "POST",
    body: JSON.stringify({ member_ids: memberIds }),
  })
  if (!res.ok) {
    throw new Error(await readApiError(res, "Impossible d'ajouter des membres"))
  }
}

export async function manageParticipant(
  conversationId: string,
  userId: string,
  action: "promote" | "demote" | "remove" | "ban" | "accept"
): Promise<void> {
  const res = await fetchWithAuth(`/api/messages/groups/${conversationId}/participant`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, action }),
  })
  if (!res.ok) {
    throw new Error(await readApiError(res, "Action impossible sur ce membre"))
  }
}

export async function leaveGroup(conversationId: string): Promise<void> {
  const res = await fetchWithAuth(`/api/messages/groups/${conversationId}/leave`, {
    method: "POST",
  })
  if (!res.ok) {
    throw new Error(await readApiError(res, "Impossible de quitter le groupe"))
  }
}

export function roleLabel(role: GroupRole): string {
  return role === "owner" ? "Créateur" : role === "admin" ? "Admin" : ""
}

export async function fetchSupportUser(): Promise<SupportUser> {
  const res = await fetchWithAuth("/api/messages/support")
  if (!res.ok) {
    throw new Error(await readApiError(res, "Support indisponible"))
  }
  return (await res.json()) as SupportUser
}

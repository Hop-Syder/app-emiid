import { fetchWithAuth, readApiError } from "@/lib/apiClient"
import type { Conversation, Message } from "@/components/messages/types"

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

export async function fetchSupportUser(): Promise<SupportUser> {
  const res = await fetchWithAuth("/api/messages/support")
  if (!res.ok) {
    throw new Error(await readApiError(res, "Support indisponible"))
  }
  return (await res.json()) as SupportUser
}

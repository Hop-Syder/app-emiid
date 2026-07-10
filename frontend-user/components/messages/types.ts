/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Types et interfaces pour le module de messagerie
 * @created 2026-05-11
*/

export interface Profile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  avatar_url: string
  role?: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  is_mediation: boolean
  created_at: string
  attachment_url?: string
  status?: 'pending' | 'sent' | 'error'
  is_edited?: boolean
}

export interface Conversation {
  id: string
  participant1_id?: string
  participant2_id?: string
  last_message?: string
  last_message_at?: string
  unread_count: number
  // Pour un DM : l'autre membre. Pour un groupe : objet de compatibilité
  // (name → first_name, avatar → avatar_url) renvoyé par le backend.
  other_participant: Profile
  updated_at: string
  isPinned?: boolean
  isArchived?: boolean
  // ─── Groupes / communautés (Étape 2+) ───
  is_group?: boolean
  name?: string | null
  avatar_url?: string | null
  is_community?: boolean
  member_count?: number
}

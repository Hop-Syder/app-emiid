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
}

export interface Conversation {
  id: string
  participant1_id: string
  participant2_id: string
  last_message?: string
  last_message_at?: string
  unread_count: number
  other_participant: Profile
  updated_at: string
}

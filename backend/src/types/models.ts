/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Définitions des interfaces pour les modèles de données EmiID backend
 * @created 2026-05-11
*/

export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: string;
  pin_code?: string;
  pin_attempts?: number;
  pin_enabled?: boolean;
  is_locked?: boolean;
  locked_at?: string;
  email?: string;
  phone?: string;
}

export interface DBConversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_content?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DBMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  attachment_url?: string;
}

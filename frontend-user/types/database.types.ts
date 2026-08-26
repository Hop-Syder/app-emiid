/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Définitions de types strictes pour la base de données EmiID Supabase/PostgreSQL.
 * @created 2026-06-11
 * @updated 2026-06-21
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 *
 * ⚠️ Ce fichier doit rester synchronisé avec le schéma Supabase.
 *    Régénérer après toute migration via :  npm run gen:types
 *    (cf. script dans package.json — nécessite SUPABASE_PROJECT_ID + supabase login).
 *    Dernière modif manuelle : ajout de cover_url et is_admin (2026-06-21).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      countries: {
        Row: {
          id: string
          name: string
          iso_code: string
          is_west_africa: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          iso_code: string
          is_west_africa?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          iso_code?: string
          is_west_africa?: boolean
          created_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          avatar_url: string | null
          cover_url: string | null
          bio: string | null
          category: string
          job_title: string | null
          industry: string | null
          role: string | null
          specialty: string | null
          activity_domain: string | null
          country_id: string | null
          city: string | null
          phone: string | null
          phone_verified: boolean
          website: string | null
          slug: string | null
          pin_enabled: boolean
          pin_code: string | null
          pin_attempts: number
          is_locked: boolean
          locked_at: string | null
          is_published: boolean
          is_verified: boolean
          is_premium: boolean
          is_admin: boolean
          card_variant: string
          has_profile: boolean
          followers_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          category?: string
          job_title?: string | null
          industry?: string | null
          role?: string | null
          specialty?: string | null
          activity_domain?: string | null
          country_id?: string | null
          city?: string | null
          phone?: string | null
          phone_verified?: boolean
          website?: string | null
          slug?: string | null
          pin_enabled?: boolean
          pin_code?: string | null
          pin_attempts?: number
          is_locked?: boolean
          locked_at?: string | null
          is_published?: boolean
          is_verified?: boolean
          is_premium?: boolean
          is_admin?: boolean
          card_variant?: string
          has_profile?: boolean
          followers_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          category?: string
          job_title?: string | null
          industry?: string | null
          role?: string | null
          specialty?: string | null
          activity_domain?: string | null
          country_id?: string | null
          city?: string | null
          phone?: string | null
          phone_verified?: boolean
          website?: string | null
          slug?: string | null
          pin_enabled?: boolean
          pin_code?: string | null
          pin_attempts?: number
          is_locked?: boolean
          locked_at?: string | null
          is_published?: boolean
          is_verified?: boolean
          is_premium?: boolean
          is_admin?: boolean
          card_variant?: string
          has_profile?: boolean
          followers_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          }
        ]
      }
      profile_tags: {
        Row: {
          profile_id: string
          tag_id: string
        }
        Insert: {
          profile_id: string
          tag_id: string
        }
        Update: {
          profile_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tags_profile_id_public_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      user_follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          participant1_id: string
          participant2_id: string
          last_message_content: string | null
          last_message_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          participant1_id: string
          participant2_id: string
          last_message_content?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          participant1_id?: string
          participant2_id?: string
          last_message_content?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          message_type: string
          media_url: string | null
          is_read: boolean
          is_edited: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          message_type?: string
          media_url?: string | null
          is_read?: boolean
          is_edited?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          message_type?: string
          media_url?: string | null
          is_read?: boolean
          is_edited?: boolean
          created_at?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
          profile_id: string
          viewer_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          viewer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          viewer_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      project_gallery: {
        Row: {
          id: string
          user_id: string
          profile_id: string | null
          title: string | null
          description: string | null
          image_url: string
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          order_index: number
          created_at: string
          updated_at: string
          project_url: string | null
          drive_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          profile_id?: string | null
          title?: string | null
          description?: string | null
          image_url: string
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
          project_url?: string | null
          drive_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          profile_id?: string | null
          title?: string | null
          description?: string | null
          image_url?: string
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
          project_url?: string | null
          drive_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          content: string
          link: string | null
          is_read: boolean
          sender_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          content: string
          link?: string | null
          is_read?: boolean
          sender_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          content?: string
          link?: string | null
          is_read?: boolean
          sender_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_enabled: boolean
          push_enabled: boolean
          notify_followers: boolean
          notify_views: boolean
          notify_messages: boolean
          notify_system: boolean
          email_frequency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          push_enabled?: boolean
          notify_followers?: boolean
          notify_views?: boolean
          notify_messages?: boolean
          notify_system?: boolean
          email_frequency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          push_enabled?: boolean
          notify_followers?: boolean
          notify_views?: boolean
          notify_messages?: boolean
          notify_system?: boolean
          email_frequency?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      // Référentiel territorial + boosts (migration 20260824).
      departments: {
        Row: { id: string; name: string; created_at: string }
        Insert: { name: string }
        Update: { name?: string }
        Relationships: []
      }
      communes: {
        Row: { id: string; name: string; department_id: string; created_at: string }
        Insert: { name: string; department_id: string }
        Update: { name?: string; department_id?: string }
        Relationships: []
      }
      profile_boosts: {
        Row: {
          id: string
          profile_id: string
          scope: 'COMMUNE' | 'DEPARTMENT'
          commune_id: string | null
          department_id: string | null
          starts_at: string
          expires_at: string
          status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
          price_paid: number
          transaction_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          scope?: string
          commune_id?: string | null
          expires_at: string
          price_paid: number
          transaction_id?: string | null
        }
        Update: { status?: string; starts_at?: string; expires_at?: string }
        Relationships: []
      }
      // Monétisation (migration 20260823). Lecture seule côté client (RLS).
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'B2B'
          status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING'
          start_date: string
          end_date: string | null
          auto_renew: boolean
          created_at: string
          updated_at: string
        }
        Insert: { user_id: string; tier?: string; status?: string; end_date?: string | null }
        Update: { tier?: string; status?: string; end_date?: string | null; auto_renew?: boolean }
        Relationships: []
      }
      profile_analytics: {
        Row: {
          profile_id: string
          views_count: number
          whatsapp_clicks: number
          call_clicks: number
          shares_count: number
          updated_at: string
        }
        Insert: { profile_id: string }
        Update: { views_count?: number; whatsapp_clicks?: number; call_clicks?: number; shares_count?: number }
        Relationships: []
      }
      // Traçabilité paiements (migration 20260823). Lecture seule côté client
      // (RLS select_own) — écritures réservées au backend (service role).
      payment_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          provider: 'FEDAPAY' | 'KKIAPAY'
          provider_ref: string | null
          type: 'SUBSCRIPTION_PRO' | 'PROFILE_BOOST'
          status: 'PENDING' | 'SUCCESS' | 'FAILED'
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: { user_id: string; amount: number; type: string }
        Update: never
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string | null
          auth: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh?: string | null
          auth?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string | null
          auth?: string | null
          created_at?: string
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          id: string
          subject_type: string
          subject_id: string
          reporter_id: string
          reason: string
          status: string
          resolved_at: string | null
          resolved_by: string | null
          admin_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subject_type: string
          subject_id: string
          reporter_id: string
          reason: string
          status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          admin_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          subject_type?: string
          subject_id?: string
          reporter_id?: string
          reason?: string
          status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          admin_note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
          created_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      industries: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      activity_sectors: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
      professions: {
        Row: {
          id: string
          sector_id: string | null
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          sector_id?: string | null
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          sector_id?: string | null
          name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professions_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "activity_sectors"
            referencedColumns: ["id"]
          }
        ]
      }
      phone_verifications: {
        Row: {
          id: string
          user_id: string
          phone: string
          otp_code: string
          expires_at: string
          verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          phone: string
          otp_code: string
          expires_at: string
          verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          phone?: string
          otp_code?: string
          expires_at?: string
          verified?: boolean
          created_at?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          id: string | null
          user_id: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          cover_url: string | null
          bio: string | null
          category: string | null
          job_title: string | null
          industry: string | null
          role: string | null
          specialty: string | null
          activity_domain: string | null
          country_id: string | null
          city: string | null
          website: string | null
          is_published: boolean | null
          is_verified: boolean | null
          is_premium: boolean | null
          card_variant: string | null
          followers_count: number | null
          created_at: string | null
          slug: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      // Enregistre un clic de campagne et renvoie la destination stockée.
      // Cf. migration 20260829. La destination vient de la base et jamais de
      // l'URL appelante : voir app/api/t/[recipient]/[link]/route.ts.
      record_email_click: {
        Args: { p_recipient_id: string; p_link_id: string }
        Returns: string | null
      }
      get_network_stats: {
        Args: Record<string, never>
        Returns: Json
      }
      // Profil public complet (contact inclus), un seul à la fois. Cf. migration H1.
      get_public_profile: {
        Args: { identifier: string }
        Returns: Json
      }
      // Recherche annuaire classée (FTS français + trigram + tags). Cf. migration 20260820.
      search_profile_ids: {
        Args: { q: string; max_results?: number }
        Returns: { profile_id: string; rank: number }[]
      }
      // Recherche sémantique par similarité vectorielle (pgvector). Cf. migration 20260821.
      match_profiles_semantic: {
        Args: { query_embedding: number[]; match_count?: number; min_similarity?: number }
        Returns: { profile_id: string; similarity: number }[]
      }
      // Statistiques de l'annuaire (pays / tags). Cf. migration 20260826.
      get_top_countries: {
        Args: Record<string, never>
        Returns: { id: string; iso_code: string; name: string; count: number }[]
      }
      get_popular_tags: {
        Args: { max_results?: number }
        Returns: { id: string; name: string; count: number }[]
      }
      // Boosts communaux et référentiel territorial. Cf. migration 20260824.
      resolve_commune_id: {
        Args: { p_label: string }
        Returns: string | null
      }
      active_boosted_profile_ids: {
        Args: { p_commune_id: string }
        Returns: { profile_id: string }[]
      }
      // Tracking des métriques profil (vues / clics). Cf. migration 20260823.
      increment_profile_metric: {
        Args: { p_profile_id: string; p_metric: string }
        Returns: void
      }
    }
    Enums: { [_ in never]: never }
  }
}

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
      get_network_stats: {
        Args: Record<string, never>
        Returns: Json
      }
      // Profil public complet (contact inclus), un seul à la fois. Cf. migration H1.
      get_public_profile: {
        Args: { identifier: string }
        Returns: Json
      }
    }
    Enums: { [_ in never]: never }
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_sectors: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_email: string | null
          admin_id: string
          created_at: string
          details: Json
          id: string
          target_id: string | null
          target_label: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_email?: string | null
          admin_id: string
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_label?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_email?: string | null
          admin_id?: string
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_label?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      ads: {
        Row: {
          budget_limit: number | null
          category: string | null
          content: string | null
          created_at: string | null
          description: string | null
          id: string
          status: string | null
          target_audience: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_limit?: number | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_limit?: number | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      boost_compensations: {
        Row: {
          boost_id: string
          granted_at: string
          id: string
          lost_duration: string
          new_expires_at: string
          previous_expires_at: string
          previous_status: Database["public"]["Enums"]["boost_status"]
          reason: string
        }
        Insert: {
          boost_id: string
          granted_at?: string
          id?: string
          lost_duration: string
          new_expires_at: string
          previous_expires_at: string
          previous_status: Database["public"]["Enums"]["boost_status"]
          reason?: string
        }
        Update: {
          boost_id?: string
          granted_at?: string
          id?: string
          lost_duration?: string
          new_expires_at?: string
          previous_expires_at?: string
          previous_status?: Database["public"]["Enums"]["boost_status"]
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "boost_compensations_boost_id_fkey"
            columns: ["boost_id"]
            isOneToOne: true
            referencedRelation: "profile_boosts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_links: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          label: string | null
          url: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          label?: string | null
          url: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          label?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          click_count: number
          clicked_at: string | null
          email: string
          id: string
          sent_at: string
          user_id: string | null
        }
        Insert: {
          campaign_id: string
          click_count?: number
          clicked_at?: string | null
          email: string
          id?: string
          sent_at?: string
          user_id?: string | null
        }
        Update: {
          campaign_id?: string
          click_count?: number
          clicked_at?: string | null
          email?: string
          id?: string
          sent_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          channel: string
          created_at: string
          created_by: string | null
          failed_count: number
          id: string
          sent_count: number
          subject: string
          template_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          created_by?: string | null
          failed_count?: number
          id?: string
          sent_count?: number
          subject: string
          template_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          created_by?: string | null
          failed_count?: number
          id?: string
          sent_count?: number
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      communes: {
        Row: {
          created_at: string
          department_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          department_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          department_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "communes_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string | null
          id: string
          receiver_id: string
          sender_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          receiver_id: string
          sender_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string | null
          last_read_at: string | null
          role: string
          show_on_profile: boolean
          status: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          last_read_at?: string | null
          role?: string
          show_on_profile?: boolean
          status?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          last_read_at?: string | null
          role?: string
          show_on_profile?: boolean
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "public_communities"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          avatar_url: string | null
          badge_style: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_community: boolean
          is_group: boolean
          is_verified: boolean
          join_policy: string
          last_message_at: string | null
          last_message_content: string | null
          member_count: number
          name: string | null
          participant1_id: string | null
          participant2_id: string | null
          slug: string | null
        }
        Insert: {
          avatar_url?: string | null
          badge_style?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_community?: boolean
          is_group?: boolean
          is_verified?: boolean
          join_policy?: string
          last_message_at?: string | null
          last_message_content?: string | null
          member_count?: number
          name?: string | null
          participant1_id?: string | null
          participant2_id?: string | null
          slug?: string | null
        }
        Update: {
          avatar_url?: string | null
          badge_style?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_community?: boolean
          is_group?: boolean
          is_verified?: boolean
          join_policy?: string
          last_message_at?: string | null
          last_message_content?: string | null
          member_count?: number
          name?: string | null
          participant1_id?: string | null
          participant2_id?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          created_at: string | null
          id: string
          is_west_africa: boolean | null
          iso_code: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_west_africa?: boolean | null
          iso_code: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_west_africa?: boolean | null
          iso_code?: string
          name?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      industries: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          channel: string
          content: string
          created_at: string
          created_by: string | null
          criteria: Json | null
          id: string
          last_used_at: string | null
          link: string | null
          name: string
          segment: string | null
          subject: string
          updated_at: string
          use_count: number
        }
        Insert: {
          channel: string
          content: string
          created_at?: string
          created_by?: string | null
          criteria?: Json | null
          id?: string
          last_used_at?: string | null
          link?: string | null
          name: string
          segment?: string | null
          subject: string
          updated_at?: string
          use_count?: number
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          created_by?: string | null
          criteria?: Json | null
          id?: string
          last_used_at?: string | null
          link?: string | null
          name?: string
          segment?: string | null
          subject?: string
          updated_at?: string
          use_count?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string | null
          id: string
          is_edited: boolean | null
          is_read: boolean | null
          media_url: string | null
          message_type: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "public_communities"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          email_frequency: string | null
          id: string
          notify_followers: boolean | null
          notify_messages: boolean | null
          notify_system: boolean | null
          notify_views: boolean | null
          push_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          email_frequency?: string | null
          id?: string
          notify_followers?: boolean | null
          notify_messages?: boolean | null
          notify_system?: boolean | null
          notify_views?: boolean | null
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          email_frequency?: string | null
          id?: string
          notify_followers?: boolean | null
          notify_messages?: boolean | null
          notify_system?: boolean | null
          notify_views?: boolean | null
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          broadcast_id: string | null
          content: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          broadcast_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          broadcast_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_ref: string | null
          status: Database["public"]["Enums"]["payment_status"]
          type: Database["public"]["Enums"]["payment_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          type: Database["public"]["Enums"]["payment_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          type?: Database["public"]["Enums"]["payment_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_verifications: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          otp_code: string
          phone: string
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          otp_code: string
          phone: string
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          otp_code?: string
          phone?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      pin_reset_verifications: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          otp_code: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          otp_code: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          otp_code?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      professions: {
        Row: {
          created_at: string | null
          id: string
          name: string
          sector_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          sector_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          sector_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professions_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "activity_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_analytics: {
        Row: {
          call_clicks: number
          profile_id: string
          shares_count: number
          updated_at: string
          views_count: number
          whatsapp_clicks: number
        }
        Insert: {
          call_clicks?: number
          profile_id: string
          shares_count?: number
          updated_at?: string
          views_count?: number
          whatsapp_clicks?: number
        }
        Update: {
          call_clicks?: number
          profile_id?: string
          shares_count?: number
          updated_at?: string
          views_count?: number
          whatsapp_clicks?: number
        }
        Relationships: []
      }
      profile_boosts: {
        Row: {
          commune_id: string | null
          created_at: string
          department_id: string | null
          expires_at: string
          id: string
          price_paid: number
          profile_id: string
          scope: Database["public"]["Enums"]["boost_scope"]
          starts_at: string
          status: Database["public"]["Enums"]["boost_status"]
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          commune_id?: string | null
          created_at?: string
          department_id?: string | null
          expires_at: string
          id?: string
          price_paid: number
          profile_id: string
          scope?: Database["public"]["Enums"]["boost_scope"]
          starts_at?: string
          status?: Database["public"]["Enums"]["boost_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          commune_id?: string | null
          created_at?: string
          department_id?: string | null
          expires_at?: string
          id?: string
          price_paid?: number
          profile_id?: string
          scope?: Database["public"]["Enums"]["boost_scope"]
          starts_at?: string
          status?: Database["public"]["Enums"]["boost_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_boosts_commune_id_fkey"
            columns: ["commune_id"]
            isOneToOne: false
            referencedRelation: "communes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_boosts_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_boosts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_voice: boolean
          profile_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content?: string
          created_at?: string
          id?: string
          is_voice?: boolean
          profile_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_voice?: boolean
          profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          is_hidden: boolean
          owner_reply: string | null
          profile_id: string
          rating: number
          replied_at: string | null
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          owner_reply?: string | null
          profile_id: string
          rating: number
          replied_at?: string | null
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          owner_reply?: string | null
          profile_id?: string
          rating?: number
          replied_at?: string | null
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: []
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
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      project_gallery: {
        Row: {
          created_at: string | null
          description: string | null
          drive_url: string | null
          id: string
          image_url: string
          order_index: number | null
          profile_id: string
          project_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          drive_url?: string | null
          id?: string
          image_url: string
          order_index?: number | null
          profile_id: string
          project_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          drive_url?: string | null
          id?: string
          image_url?: string
          order_index?: number | null
          profile_id?: string
          project_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_gallery_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_gallery_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_gallery_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_broadcasts: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          created_by_email: string | null
          error: string | null
          id: string
          link: string | null
          result_count: number | null
          result_total: number | null
          scheduled_for: string
          segment: string
          sent_at: string | null
          status: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          error?: string | null
          id?: string
          link?: string | null
          result_count?: number | null
          result_total?: number | null
          scheduled_for: string
          segment: string
          sent_at?: string | null
          status?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          error?: string | null
          id?: string
          link?: string | null
          result_count?: number | null
          result_total?: number | null
          scheduled_for?: string
          segment?: string
          sent_at?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean
          created_at: string
          end_date: string | null
          id: string
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_auth_providers: {
        Row: {
          first_connected_at: string | null
          id: string
          last_used_at: string | null
          provider: string
          provider_metadata: Json | null
          provider_user_id: string | null
          user_id: string
        }
        Insert: {
          first_connected_at?: string | null
          id?: string
          last_used_at?: string | null
          provider: string
          provider_metadata?: Json | null
          provider_user_id?: string | null
          user_id: string
        }
        Update: {
          first_connected_at?: string | null
          id?: string
          last_used_at?: string | null
          provider?: string
          provider_metadata?: Json | null
          provider_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          activity_domain: string | null
          address: string | null
          avatar_url: string | null
          bio: string | null
          business_name: string | null
          card_variant: string | null
          category: string | null
          city: string | null
          commune_id: string | null
          country_id: string | null
          cover_url: string | null
          created_at: string | null
          district: string | null
          email: string | null
          embedding: string | null
          embedding_stale: boolean
          experiences: Json | null
          facebook_url: string | null
          first_name: string | null
          followers_count: number | null
          has_profile: boolean | null
          id: string
          identity_verified: boolean | null
          industry: string | null
          instagram_url: string | null
          is_admin: boolean
          is_demo: boolean
          is_locked: boolean | null
          is_nomad: boolean | null
          is_premium: boolean | null
          is_published: boolean | null
          is_suspended: boolean
          is_verified: boolean | null
          job_title: string | null
          last_name: string | null
          latitude: number | null
          linkedin_url: string | null
          locked_at: string | null
          longitude: number | null
          opening_hours: Json | null
          phone: string | null
          phone_verified: boolean | null
          pin_attempts: number | null
          pin_code: string | null
          pin_enabled: boolean | null
          public_email: string | null
          role: string | null
          search_vector: unknown
          secondary_phone: string | null
          services: Json | null
          show_contact: boolean
          slogan: string | null
          slug: string | null
          specialty: string | null
          suspended_at: string | null
          suspended_by: string | null
          suspended_reason: string | null
          suspended_until: string | null
          tiktok_url: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
          website: string | null
          years_experience: number | null
        }
        Insert: {
          activity_domain?: string | null
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          card_variant?: string | null
          category?: string | null
          city?: string | null
          commune_id?: string | null
          country_id?: string | null
          cover_url?: string | null
          created_at?: string | null
          district?: string | null
          email?: string | null
          embedding?: string | null
          embedding_stale?: boolean
          experiences?: Json | null
          facebook_url?: string | null
          first_name?: string | null
          followers_count?: number | null
          has_profile?: boolean | null
          id?: string
          identity_verified?: boolean | null
          industry?: string | null
          instagram_url?: string | null
          is_admin?: boolean
          is_demo?: boolean
          is_locked?: boolean | null
          is_nomad?: boolean | null
          is_premium?: boolean | null
          is_published?: boolean | null
          is_suspended?: boolean
          is_verified?: boolean | null
          job_title?: string | null
          last_name?: string | null
          latitude?: number | null
          linkedin_url?: string | null
          locked_at?: string | null
          longitude?: number | null
          opening_hours?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          pin_attempts?: number | null
          pin_code?: string | null
          pin_enabled?: boolean | null
          public_email?: string | null
          role?: string | null
          search_vector?: unknown
          secondary_phone?: string | null
          services?: Json | null
          show_contact?: boolean
          slogan?: string | null
          slug?: string | null
          specialty?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_reason?: string | null
          suspended_until?: string | null
          tiktok_url?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          activity_domain?: string | null
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          card_variant?: string | null
          category?: string | null
          city?: string | null
          commune_id?: string | null
          country_id?: string | null
          cover_url?: string | null
          created_at?: string | null
          district?: string | null
          email?: string | null
          embedding?: string | null
          embedding_stale?: boolean
          experiences?: Json | null
          facebook_url?: string | null
          first_name?: string | null
          followers_count?: number | null
          has_profile?: boolean | null
          id?: string
          identity_verified?: boolean | null
          industry?: string | null
          instagram_url?: string | null
          is_admin?: boolean
          is_demo?: boolean
          is_locked?: boolean | null
          is_nomad?: boolean | null
          is_premium?: boolean | null
          is_published?: boolean | null
          is_suspended?: boolean
          is_verified?: boolean | null
          job_title?: string | null
          last_name?: string | null
          latitude?: number | null
          linkedin_url?: string | null
          locked_at?: string | null
          longitude?: number | null
          opening_hours?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          pin_attempts?: number | null
          pin_code?: string | null
          pin_enabled?: boolean | null
          public_email?: string | null
          role?: string | null
          search_vector?: unknown
          secondary_phone?: string | null
          services?: Json | null
          show_contact?: boolean
          slogan?: string | null
          slug?: string | null
          specialty?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_reason?: string | null
          suspended_until?: string | null
          tiktok_url?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_commune_id_fkey"
            columns: ["commune_id"]
            isOneToOne: false
            referencedRelation: "communes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_documents: {
        Row: {
          created_at: string | null
          doc_type: string
          file_path: string
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          doc_type: string
          file_path: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          doc_type?: string
          file_path?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_communities: {
        Row: {
          avatar_url: string | null
          badge_style: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_verified: boolean | null
          member_count: number | null
          name: string | null
          slug: string | null
        }
        Insert: {
          avatar_url?: string | null
          badge_style?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_verified?: boolean | null
          member_count?: number | null
          name?: string | null
          slug?: string | null
        }
        Update: {
          avatar_url?: string | null
          badge_style?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_verified?: boolean | null
          member_count?: number | null
          name?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          activity_domain: string | null
          avatar_url: string | null
          bio: string | null
          card_variant: string | null
          category: string | null
          city: string | null
          commune_id: string | null
          country_id: string | null
          cover_url: string | null
          created_at: string | null
          first_name: string | null
          followers_count: number | null
          id: string | null
          industry: string | null
          is_nomad: boolean | null
          is_premium: boolean | null
          is_published: boolean | null
          is_verified: boolean | null
          job_title: string | null
          last_name: string | null
          latitude: number | null
          longitude: number | null
          role: string | null
          slug: string | null
          specialty: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          activity_domain?: string | null
          avatar_url?: string | null
          bio?: string | null
          card_variant?: string | null
          category?: string | null
          city?: string | null
          commune_id?: string | null
          country_id?: string | null
          cover_url?: string | null
          created_at?: string | null
          first_name?: string | null
          followers_count?: number | null
          id?: string | null
          industry?: string | null
          is_nomad?: boolean | null
          is_premium?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          job_title?: string | null
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          role?: string | null
          slug?: string | null
          specialty?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          activity_domain?: string | null
          avatar_url?: string | null
          bio?: string | null
          card_variant?: string | null
          category?: string | null
          city?: string | null
          commune_id?: string | null
          country_id?: string | null
          cover_url?: string | null
          created_at?: string | null
          first_name?: string | null
          followers_count?: number | null
          id?: string | null
          industry?: string | null
          is_nomad?: boolean | null
          is_premium?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          job_title?: string | null
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          role?: string | null
          slug?: string | null
          specialty?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_commune_id_fkey"
            columns: ["commune_id"]
            isOneToOne: false
            referencedRelation: "communes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles_with_providers: {
        Row: {
          auth_providers: Json | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          has_profile: boolean | null
          id: string | null
          last_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      active_boosted_profile_ids: {
        Args: { p_commune_id: string }
        Returns: {
          profile_id: string
          scope: string
        }[]
      }
      campaign_stats: {
        Args: { p_campaign_id: string }
        Returns: {
          click_rate: number
          clicked: number
          not_clicked: number
          total: number
        }[]
      }
      can_review_profile: {
        Args: { p_profile_owner_id: string; p_reviewer_id: string }
        Returns: boolean
      }
      count_demo_profiles: { Args: never; Returns: number }
      expire_boosts: { Args: never; Returns: number }
      expire_subscriptions: { Args: never; Returns: number }
      get_community_badges: {
        Args: { p_user_ids: string[] }
        Returns: {
          badges: Json
          user_id: string
        }[]
      }
      get_network_stats: { Args: never; Returns: Json }
      get_popular_tags: {
        Args: { max_results?: number }
        Returns: {
          count: number
          id: string
          name: string
        }[]
      }
      get_profile_review_stats: {
        Args: { p_profile_id: string }
        Returns: Json
      }
      get_public_profile: { Args: { identifier: string }; Returns: Json }
      get_top_countries: {
        Args: never
        Returns: {
          count: number
          id: string
          iso_code: string
          name: string
        }[]
      }
      get_user_providers: {
        Args: { p_user_id: string }
        Returns: {
          first_connected_at: string
          last_used_at: string
          provider: string
        }[]
      }
      increment_profile_metric: {
        Args: { p_metric: string; p_profile_id: string }
        Returns: undefined
      }
      is_conversation_admin: {
        Args: { p_conv: string; p_user: string }
        Returns: boolean
      }
      is_conversation_member: {
        Args: { p_conv: string; p_user: string }
        Returns: boolean
      }
      match_profiles_semantic: {
        Args: {
          match_count?: number
          min_similarity?: number
          query_embedding: string
        }
        Returns: {
          profile_id: string
          similarity: number
        }[]
      }
      normalize_place: { Args: { txt: string }; Returns: string }
      record_email_click: {
        Args: { p_link_id: string; p_recipient_id: string }
        Returns: string
      }
      request_join_community: { Args: { p_slug: string }; Returns: Json }
      resolve_commune_id: { Args: { p_label: string }; Returns: string }
      resolve_department_id: { Args: { p_label: string }; Returns: string }
      save_profile_card: {
        Args: {
          p_bio: string
          p_category: string
          p_city: string
          p_country_id: string
          p_first_name: string
          p_is_published: boolean
          p_last_name: string
          p_phone: string
          p_role: string
          p_specialty: string
          p_tags: string[]
          p_user_id: string
          p_website: string
        }
        Returns: Json
      }
      search_profile_ids: {
        Args: { max_results?: number; q: string }
        Returns: {
          profile_id: string
          rank: number
        }[]
      }
      search_profiles_by_proximity: {
        Args: { p_lat: number; p_lng: number; p_radius_km?: number }
        Returns: {
          distance_km: number
          profile_id: string
        }[]
      }
      set_participant_status: {
        Args: { p_conv: string; p_status: string; p_user: string }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      boost_scope: "COMMUNE" | "DEPARTMENT"
      boost_status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED"
      payment_provider: "FEDAPAY" | "KKIAPAY"
      payment_status: "PENDING" | "SUCCESS" | "FAILED"
      payment_type: "SUBSCRIPTION_PRO" | "PROFILE_BOOST"
      subscription_status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING"
      subscription_tier: "FREE" | "PRO_MONTHLY" | "PRO_ANNUAL" | "B2B"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      boost_scope: ["COMMUNE", "DEPARTMENT"],
      boost_status: ["PENDING", "ACTIVE", "EXPIRED", "CANCELLED"],
      payment_provider: ["FEDAPAY", "KKIAPAY"],
      payment_status: ["PENDING", "SUCCESS", "FAILED"],
      payment_type: ["SUBSCRIPTION_PRO", "PROFILE_BOOST"],
      subscription_status: ["ACTIVE", "EXPIRED", "CANCELLED", "PENDING"],
      subscription_tier: ["FREE", "PRO_MONTHLY", "PRO_ANNUAL", "B2B"],
    },
  },
} as const

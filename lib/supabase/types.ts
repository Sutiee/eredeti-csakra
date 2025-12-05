/**
 * Supabase Database TypeScript Types
 * Auto-generated from database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          admin_user_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          last_activity_at: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_activity_at?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity_at?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          failed_login_attempts: number | null
          id: string
          last_login_at: string | null
          locked_until: string | null
          login_count: number | null
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string | null
          failed_login_attempts?: number | null
          id?: string
          last_login_at?: string | null
          locked_until?: string | null
          login_count?: number | null
          password_hash: string
          username?: string
        }
        Update: {
          created_at?: string | null
          failed_login_attempts?: number | null
          id?: string
          last_login_at?: string | null
          locked_until?: string | null
          login_count?: number | null
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_category: string | null
          event_data: Json | null
          event_name: string
          id: string
          ip_address: string | null
          page_path: string | null
          referrer: string | null
          result_id: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_name: string
          id?: string
          ip_address?: string | null
          page_path?: string | null
          referrer?: string | null
          result_id?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_name?: string
          id?: string
          ip_address?: string | null
          page_path?: string | null
          referrer?: string | null
          result_id?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "quiz_results"
            referencedColumns: ["id"]
          },
        ]
      }
      meditation_access: {
        Row: {
          access_count: number | null
          access_granted_at: string | null
          access_token: string
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_accessed_at: string | null
          product_type: string | null
          purchase_id: string | null
        }
        Insert: {
          access_count?: number | null
          access_granted_at?: string | null
          access_token: string
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          product_type?: string | null
          purchase_id?: string | null
        }
        Update: {
          access_count?: number | null
          access_granted_at?: string | null
          access_token?: string
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          product_type?: string | null
          purchase_id?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          email: string
          id: string
          pdf_url: string | null
          product_id: string
          product_name: string
          result_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          email: string
          id?: string
          pdf_url?: string | null
          product_id: string
          product_name: string
          result_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          email?: string
          id?: string
          pdf_url?: string | null
          product_id?: string
          product_name?: string
          result_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "quiz_results"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          age: number | null
          answers: Json
          chakra_scores: Json
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          answers: Json
          chakra_scores: Json
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          answers?: Json
          chakra_scores?: Json
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_sessions: {
        Row: {
          age: number | null
          answers: Json | null
          completed_at: string | null
          current_question_index: number | null
          email: string | null
          id: string
          ip_address: string | null
          last_activity_at: string | null
          name: string | null
          referrer: string | null
          session_id: string
          started_at: string | null
          status: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          age?: number | null
          answers?: Json | null
          completed_at?: string | null
          current_question_index?: number | null
          email?: string | null
          id?: string
          ip_address?: string | null
          last_activity_at?: string | null
          name?: string | null
          referrer?: string | null
          session_id: string
          started_at?: string | null
          status?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          age?: number | null
          answers?: Json | null
          completed_at?: string | null
          current_question_index?: number | null
          email?: string | null
          id?: string
          ip_address?: string | null
          last_activity_at?: string | null
          name?: string | null
          referrer?: string | null
          session_id?: string
          started_at?: string | null
          status?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          id: string
          name: string
          subject: string
          status: string
          total_recipients: number
          sent_count: number
          failed_count: number
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          status?: string
          total_recipients?: number
          sent_count?: number
          failed_count?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          status?: string
          total_recipients?: number
          sent_count?: number
          failed_count?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      newsletter_sends: {
        Row: {
          id: string
          campaign_id: string
          email: string
          name: string
          variant: string
          status: string
          resend_email_id: string | null
          error_message: string | null
          sent_at: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          email: string
          name: string
          variant: string
          status?: string
          resend_email_id?: string | null
          error_message?: string | null
          sent_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          email?: string
          name?: string
          variant?: string
          status?: string
          resend_email_id?: string | null
          error_message?: string | null
          sent_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "newsletter_campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      recipient_lists: {
        Row: {
          id: string
          name: string
          description: string | null
          total_recipients: number
          variant_distribution: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          total_recipients?: number
          variant_distribution?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          total_recipients?: number
          variant_distribution?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipients: {
        Row: {
          id: string
          recipient_list_id: string
          name: string
          email: string
          variant: string
          result_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_list_id: string
          name: string
          email: string
          variant: string
          result_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipient_list_id?: string
          name?: string
          email?: string
          variant?: string
          result_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipients_recipient_list_id_fkey"
            columns: ["recipient_list_id"]
            isOneToOne: false
            referencedRelation: "recipient_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipients_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "quiz_results"
            referencedColumns: ["id"]
          }
        ]
      }
      bulk_sender_settings: {
        Row: {
          id: string
          resend_api_key: string | null
          from_email: string | null
          from_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resend_api_key?: string | null
          from_email?: string | null
          from_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resend_api_key?: string | null
          from_email?: string | null
          from_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bulk_sender_unsubscribes: {
        Row: {
          id: string
          email: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          reason?: string | null
          created_at?: string
        }
        Relationships: []
      }
      bulk_sender_templates: {
        Row: {
          id: string
          name: string
          subject: string
          html_content: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          html_content: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          html_content?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bulk_sender_history: {
        Row: {
          id: string
          subject: string
          recipient_count: number
          sent_count: number
          failed_count: number
          skipped_count: number
          status: string
          template_id: string | null
          error_log: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          subject: string
          recipient_count: number
          sent_count: number
          failed_count: number
          skipped_count: number
          status: string
          template_id?: string | null
          error_log?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          subject?: string
          recipient_count?: number
          sent_count?: number
          failed_count?: number
          skipped_count?: number
          status?: string
          template_id?: string | null
          error_log?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      bulk_sender_jobs: {
        Row: {
          id: string
          subject: string
          html_content: string
          total_recipients: number
          sent_count: number
          failed_count: number
          skipped_count: number
          status: string
          current_batch: number
          total_batches: number
          batch_size: number
          delay_between_batches_ms: number
          error_log: Json | null
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject: string
          html_content: string
          total_recipients?: number
          sent_count?: number
          failed_count?: number
          skipped_count?: number
          status?: string
          current_batch?: number
          total_batches?: number
          batch_size?: number
          delay_between_batches_ms?: number
          error_log?: Json | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject?: string
          html_content?: string
          total_recipients?: number
          sent_count?: number
          failed_count?: number
          skipped_count?: number
          status?: string
          current_batch?: number
          total_batches?: number
          batch_size?: number
          delay_between_batches_ms?: number
          error_log?: Json | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bulk_sender_job_recipients: {
        Row: {
          id: string
          job_id: string
          email: string
          name: string | null
          batch_number: number
          status: string
          error_message: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          email: string
          name?: string | null
          batch_number: number
          status?: string
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          email?: string
          name?: string | null
          batch_number?: number
          status?: string
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulk_sender_job_recipients_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "bulk_sender_jobs"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_admin_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/**
 * Quiz result row from database
 */
export type QuizResultRow = Database['public']['Tables']['quiz_results']['Row'];

/**
 * Quiz result insert payload
 */
export type QuizResultInsert = Database['public']['Tables']['quiz_results']['Insert'];

/**
 * Quiz result update payload
 */
export type QuizResultUpdate = Database['public']['Tables']['quiz_results']['Update'];

/**
 * Supabase Database TypeScript Types
 * Simplified types for PostgreSQL schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      quiz_results: {
        Row: {
          id: string;
          name: string;
          email: string;
          age: number | null;
          answers: Json; // JSONB stored as array
          chakra_scores: Json; // JSONB stored as object
          created_at: string;
        };
        Insert: {
          id?: string; // UUID auto-generated
          name: string;
          email: string;
          age?: number | null;
          answers: Json;
          chakra_scores: Json;
          created_at?: string; // Timestamp auto-generated
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          age?: number | null;
          answers?: Json;
          chakra_scores?: Json;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
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

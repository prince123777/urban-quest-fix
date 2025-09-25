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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      civic_coin_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          issue_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          issue_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          issue_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "civic_coin_transactions_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "civic_coin_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "civic_coin_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_categories: {
        Row: {
          civic_coins_reward: number
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          civic_coins_reward?: number
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          civic_coins_reward?: number
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      issues: {
        Row: {
          address: string | null
          assigned_department: string | null
          assigned_to: string | null
          category: string
          civic_coins_awarded: number | null
          created_at: string
          description: string | null
          government_notes: string | null
          id: string
          is_anonymous: boolean | null
          location_lat: number | null
          location_lng: number | null
          photo_urls: string[] | null
          priority: string
          proof_of_fix_urls: string[] | null
          reporter_id: string
          resolved_at: string | null
          status: string
          title: string
          updated_at: string
          upvotes: number
          voice_description_url: string | null
        }
        Insert: {
          address?: string | null
          assigned_department?: string | null
          assigned_to?: string | null
          category: string
          civic_coins_awarded?: number | null
          created_at?: string
          description?: string | null
          government_notes?: string | null
          id?: string
          is_anonymous?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          photo_urls?: string[] | null
          priority?: string
          proof_of_fix_urls?: string[] | null
          reporter_id: string
          resolved_at?: string | null
          status?: string
          title: string
          updated_at?: string
          upvotes?: number
          voice_description_url?: string | null
        }
        Update: {
          address?: string | null
          assigned_department?: string | null
          assigned_to?: string | null
          category?: string
          civic_coins_awarded?: number | null
          created_at?: string
          description?: string | null
          government_notes?: string | null
          id?: string
          is_anonymous?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          photo_urls?: string[] | null
          priority?: string
          proof_of_fix_urls?: string[] | null
          reporter_id?: string
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          upvotes?: number
          voice_description_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_uploads: {
        Row: {
          created_at: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          issue_id: string | null
          upload_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          issue_id?: string | null
          upload_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          issue_id?: string | null
          upload_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_uploads_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          issue_id: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_id?: string | null
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_verifications: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          is_verified: boolean | null
          otp_code: string
          phone_number: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_verified?: boolean | null
          otp_code: string
          phone_number: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_verified?: boolean | null
          otp_code?: string
          phone_number?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          civic_coins: number
          created_at: string
          department: string | null
          email: string
          full_name: string
          government_id: string | null
          government_id_url: string | null
          id: string
          is_government_verified: boolean | null
          is_phone_verified: boolean | null
          location_lat: number | null
          location_lng: number | null
          phone_number: string | null
          profile_photo_url: string | null
          rank: string | null
          resolved_reports: number
          total_reports: number
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          address?: string | null
          civic_coins?: number
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          government_id?: string | null
          government_id_url?: string | null
          id?: string
          is_government_verified?: boolean | null
          is_phone_verified?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          phone_number?: string | null
          profile_photo_url?: string | null
          rank?: string | null
          resolved_reports?: number
          total_reports?: number
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          address?: string | null
          civic_coins?: number
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          government_id?: string | null
          government_id_url?: string | null
          id?: string
          is_government_verified?: boolean | null
          is_phone_verified?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          phone_number?: string | null
          profile_photo_url?: string | null
          rank?: string | null
          resolved_reports?: number
          total_reports?: number
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          civic_coins: number | null
          full_name: string | null
          id: string | null
          position: number | null
          profile_photo_url: string | null
          rank: string | null
          resolved_reports: number | null
          total_reports: number | null
          user_type: string | null
        }
        Relationships: []
      }
      platform_stats: {
        Row: {
          active_citizens: number | null
          avg_resolution_hours: number | null
          in_progress_issues: number | null
          pending_issues: number | null
          resolved_issues: number | null
          total_issues: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_civic_coins: {
        Args: {
          coin_amount: number
          description_text: string
          related_issue_id?: string
          user_profile_id: string
        }
        Returns: undefined
      }
      send_notification: {
        Args: {
          notification_message: string
          notification_title: string
          notification_type?: string
          related_issue_id?: string
          user_profile_id: string
        }
        Returns: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

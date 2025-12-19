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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_allowed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      project_pages: {
        Row: {
          content_draft: Json | null
          content_published: Json | null
          created_at: string
          id: string
          is_published: boolean
          project_id: string
          updated_at: string
        }
        Insert: {
          content_draft?: Json | null
          content_published?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean
          project_id: string
          updated_at?: string
        }
        Update: {
          content_draft?: Json | null
          content_published?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_pages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          deleted_at: string | null
          description_draft: string | null
          description_published: string | null
          display_order: number
          external_url: string | null
          github_url: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          is_visible: boolean
          slug: string
          technologies: Json | null
          thumbnail_url: string | null
          title_draft: string
          title_published: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description_draft?: string | null
          description_published?: string | null
          display_order?: number
          external_url?: string | null
          github_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          is_visible?: boolean
          slug: string
          technologies?: Json | null
          thumbnail_url?: string | null
          title_draft: string
          title_published?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description_draft?: string | null
          description_published?: string | null
          display_order?: number
          external_url?: string | null
          github_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          is_visible?: boolean
          slug?: string
          technologies?: Json | null
          thumbnail_url?: string | null
          title_draft?: string
          title_published?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resume_assets: {
        Row: {
          created_at: string
          external_url_draft: string | null
          external_url_published: string | null
          file_url_draft: string | null
          file_url_published: string | null
          filename: string | null
          id: string
          is_active: boolean
          is_published: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_url_draft?: string | null
          external_url_published?: string | null
          file_url_draft?: string | null
          file_url_published?: string | null
          filename?: string | null
          id?: string
          is_active?: boolean
          is_published?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_url_draft?: string | null
          external_url_published?: string | null
          file_url_draft?: string | null
          file_url_published?: string | null
          filename?: string | null
          id?: string
          is_active?: boolean
          is_published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      section_bullets: {
        Row: {
          content_draft: string | null
          content_published: string | null
          created_at: string
          deleted_at: string | null
          display_order: number
          id: string
          is_published: boolean
          section_id: string
          updated_at: string
        }
        Insert: {
          content_draft?: string | null
          content_published?: string | null
          created_at?: string
          deleted_at?: string | null
          display_order?: number
          id?: string
          is_published?: boolean
          section_id: string
          updated_at?: string
        }
        Update: {
          content_draft?: string | null
          content_published?: string | null
          created_at?: string
          deleted_at?: string | null
          display_order?: number
          id?: string
          is_published?: boolean
          section_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_bullets_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          content_draft: Json | null
          content_published: Json | null
          created_at: string
          deleted_at: string | null
          display_order: number
          id: string
          is_published: boolean
          is_visible: boolean
          slug: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content_draft?: Json | null
          content_published?: Json | null
          created_at?: string
          deleted_at?: string | null
          display_order?: number
          id?: string
          is_published?: boolean
          is_visible?: boolean
          slug: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content_draft?: Json | null
          content_published?: Json | null
          created_at?: string
          deleted_at?: string | null
          display_order?: number
          id?: string
          is_published?: boolean
          is_visible?: boolean
          slug?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          key: string
          updated_at: string
          value_draft: Json | null
          value_published: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          key: string
          updated_at?: string
          value_draft?: Json | null
          value_published?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          key?: string
          updated_at?: string
          value_draft?: Json | null
          value_published?: Json | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          deleted_at: string | null
          display_order: number
          icon: string | null
          id: string
          is_published: boolean
          is_visible: boolean
          platform: string
          updated_at: string
          url_draft: string | null
          url_published: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_published?: boolean
          is_visible?: boolean
          platform: string
          updated_at?: string
          url_draft?: string | null
          url_published?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_published?: boolean
          is_visible?: boolean
          platform?: string
          updated_at?: string
          url_draft?: string | null
          url_published?: string | null
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          key: string
          updated_at: string
          value_draft: Json | null
          value_published: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          key: string
          updated_at?: string
          value_draft?: Json | null
          value_published?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          key?: string
          updated_at?: string
          value_draft?: Json | null
          value_published?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_email: { Args: { check_email: string }; Returns: boolean }
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

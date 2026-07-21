export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      waitlist: {
        Row: {
          birth_date: string | null;
          city: string | null;
          created_at: string;
          email: string;
          experience: string | null;
          frequency: string | null;
          full_name: string | null;
          id: string;
          italian_level: string | null;
          message: string | null;
          nationality: string | null;
          phone: string | null;
          services: string[] | null;
          source: string;
          urgency: string | null;
          user_type: string;
          status: string;
          score: number | null;
          auth_id: string | null;
          has_active_package: boolean | null;
          id_front_url: string | null;
          documenti: string | null;
          avatar_url: string | null;
          bio: string | null;
          privacy_accepted_at: string | null;
          marketing_consent: boolean;
          marketing_consent_at: string | null;
          consent_policy_version: string | null;
          plan_tier: string | null;
          subscription_status: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan_current_period_end: string | null;
          gender: string | null;
          video_url: string | null;
          criminal_check_verified: boolean;
          references_verified: boolean;
          certificates_verified: boolean;
        };
        Insert: {
          birth_date?: string | null;
          city?: string | null;
          created_at?: string;
          email: string;
          experience?: string | null;
          frequency?: string | null;
          full_name?: string | null;
          id?: string;
          italian_level?: string | null;
          message?: string | null;
          nationality?: string | null;
          phone?: string | null;
          services?: string[] | null;
          source?: string;
          urgency?: string | null;
          user_type?: string;
          status?: string;
          score?: number | null;
          auth_id?: string | null;
          has_active_package?: boolean | null;
          id_front_url?: string | null;
          documenti?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          privacy_accepted_at?: string | null;
          marketing_consent?: boolean;
          marketing_consent_at?: string | null;
          consent_policy_version?: string | null;
          plan_tier?: string | null;
          subscription_status?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan_current_period_end?: string | null;
          gender?: string | null;
          video_url?: string | null;
          criminal_check_verified?: boolean;
          references_verified?: boolean;
          certificates_verified?: boolean;
        };
        Update: {
          birth_date?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string;
          experience?: string | null;
          frequency?: string | null;
          full_name?: string | null;
          id?: string;
          italian_level?: string | null;
          message?: string | null;
          nationality?: string | null;
          phone?: string | null;
          services?: string[] | null;
          source?: string;
          urgency?: string | null;
          user_type?: string;
          status?: string;
          score?: number | null;
          auth_id?: string | null;
          has_active_package?: boolean | null;
          id_front_url?: string | null;
          documenti?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          privacy_accepted_at?: string | null;
          marketing_consent?: boolean;
          marketing_consent_at?: string | null;
          consent_policy_version?: string | null;
          plan_tier?: string | null;
          subscription_status?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan_current_period_end?: string | null;
          gender?: string | null;
          video_url?: string | null;
          criminal_check_verified?: boolean;
          references_verified?: boolean;
          certificates_verified?: boolean;
        };
        Relationships: [];
      };
      professional_interests: {
        Row: {
          id: string;
          created_at: string;
          professional_id: string;
          family_id: string;
          status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          professional_id: string;
          family_id: string;
          status: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          professional_id?: string;
          family_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "professional_interests_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "waitlist";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_interests_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "waitlist";
            referencedColumns: ["id"];
          },
        ];
      };
      family_contacts: {
        Row: {
          id: string;
          family_id: string;
          professional_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          professional_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          professional_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          family_id: string;
          professional_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          professional_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          professional_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_auth_id: string;
          body: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_auth_id: string;
          body: string;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_auth_id?: string;
          body?: string;
          created_at?: string;
          read_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

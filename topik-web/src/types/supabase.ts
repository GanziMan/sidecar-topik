export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          thinking_mode: string;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          id: string;
          thinking_mode?: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          id?: string;
          thinking_mode?: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
      prompt_history: {
        Row: {
          content: Json;
          created_at: string;
          created_by: string | null;
          id: string;
          prompt_id: string;
          version: number;
        };
        Insert: {
          content: Json;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          prompt_id: string;
          version: number;
        };
        Update: {
          content?: Json;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          prompt_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_history_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          }
        ];
      };
      prompts: {
        Row: {
          content: Json;
          created_at: string;
          id: string;
          prompt_key: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          content: Json;
          created_at?: string;
          id?: string;
          prompt_key: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          content?: Json;
          created_at?: string;
          id?: string;
          prompt_key?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [];
      };
      question_types: {
        Row: {
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          content: Json | null;
          created_at: string;
          exam_round: number;
          exam_year: number;
          id: string;
          question_number: number;
          question_type: string | null;
        };
        Insert: {
          content?: Json | null;
          created_at?: string;
          exam_round: number;
          exam_year: number;
          id?: string;
          question_number: number;
          question_type?: string | null;
        };
        Update: {
          content?: Json | null;
          created_at?: string;
          exam_round?: number;
          exam_year?: number;
          id?: string;
          question_number?: number;
          question_type?: string | null;
        };
        Relationships: [];
      };
      submission_results: {
        Row: {
          correction: Json | null;
          created_at: string;
          evaluation: Json | null;
          id: string;
          prompt_snapshot: Json | null;
          submission_id: string;
        };
        Insert: {
          correction?: Json | null;
          created_at?: string;
          evaluation?: Json | null;
          id?: string;
          prompt_snapshot?: Json | null;
          submission_id: string;
        };
        Update: {
          correction?: Json | null;
          created_at?: string;
          evaluation?: Json | null;
          id?: string;
          prompt_snapshot?: Json | null;
          submission_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submission_results_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: true;
            referencedRelation: "user_submissions";
            referencedColumns: ["id"];
          }
        ];
      };
      user_submissions: {
        Row: {
          attempt_no: number;
          created_at: string;
          id: string;
          question_id: string;
          user_answer: Json;
          user_id: string;
        };
        Insert: {
          attempt_no?: number;
          created_at?: string;
          id?: string;
          question_id: string;
          user_answer: Json;
          user_id: string;
        };
        Update: {
          attempt_no?: number;
          created_at?: string;
          id?: string;
          question_id?: string;
          user_answer?: Json;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_submissions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          }
        ];
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
    : never = never
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
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
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
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
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
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
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
    : never = never
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

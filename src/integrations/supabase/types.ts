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
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity: string | null
          entity_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cigarette_dependence_scores: {
        Row: {
          category: string
          created_at: string
          id: string
          participant_id: string
          q1_time_to_first: number
          q2_difficulty_refrain: number
          q3_hardest_to_give_up: number
          q4_cigs_per_day: number
          q5_more_in_morning: number
          q6_smoking_when_ill: number
          total_score: number
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          participant_id: string
          q1_time_to_first: number
          q2_difficulty_refrain: number
          q3_hardest_to_give_up: number
          q4_cigs_per_day: number
          q5_more_in_morning: number
          q6_smoking_when_ill: number
          total_score: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          participant_id?: string
          q1_time_to_first?: number
          q2_difficulty_refrain?: number
          q3_hardest_to_give_up?: number
          q4_cigs_per_day?: number
          q5_more_in_morning?: number
          q6_smoking_when_ill?: number
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "cigarette_dependence_scores_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          created_at: string
          created_by: string | null
          follow_up_level: string | null
          id: string
          note: string
          outcome_status: string | null
          participant_id: string
          risk_review: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          follow_up_level?: string | null
          id?: string
          note: string
          outcome_status?: string | null
          participant_id: string
          risk_review?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          follow_up_level?: string | null
          id?: string
          note?: string
          outcome_status?: string | null
          participant_id?: string
          risk_review?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_assignment: {
        Row: {
          cohort: Database["public"]["Enums"]["cohort_code"]
          created_at: string
          doctor_review_needed: boolean
          id: string
          participant_id: string
          reason: string | null
        }
        Insert: {
          cohort: Database["public"]["Enums"]["cohort_code"]
          created_at?: string
          doctor_review_needed?: boolean
          id?: string
          participant_id: string
          reason?: string | null
        }
        Update: {
          cohort?: Database["public"]["Enums"]["cohort_code"]
          created_at?: string
          doctor_review_needed?: boolean
          id?: string
          participant_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cohort_assignment_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          consent_assessment: boolean
          consent_contact: boolean
          consent_educational: boolean
          consent_research: boolean
          consent_service_eval: boolean
          created_at: string
          guardian_notice_shown: boolean
          id: string
          participant_id: string
        }
        Insert: {
          consent_assessment: boolean
          consent_contact: boolean
          consent_educational: boolean
          consent_research?: boolean
          consent_service_eval: boolean
          created_at?: string
          guardian_notice_shown?: boolean
          id?: string
          participant_id: string
        }
        Update: {
          consent_assessment?: boolean
          consent_contact?: boolean
          consent_educational?: boolean
          consent_research?: boolean
          consent_service_eval?: boolean
          created_at?: string
          guardian_notice_shown?: boolean
          id?: string
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      export_logs: {
        Row: {
          created_at: string
          export_type: string
          filters: Json | null
          id: string
          row_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          export_type: string
          filters?: Json | null
          id?: string
          row_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          export_type?: string
          filters?: Json | null
          id?: string
          row_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      follow_up_preferences: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          preference: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          preference: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          preference?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_preferences_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_records: {
        Row: {
          channel: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          outcome: string | null
          participant_id: string
        }
        Insert: {
          channel?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          participant_id: string
        }
        Update: {
          channel?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_records_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      nicotine_control_scores: {
        Row: {
          answers: Json
          category: string
          created_at: string
          id: string
          participant_id: string
          yes_count: number
          youth_flag: boolean
        }
        Insert: {
          answers: Json
          category: string
          created_at?: string
          id?: string
          participant_id: string
          yes_count: number
          youth_flag?: boolean
        }
        Update: {
          answers?: Json
          category?: string
          created_at?: string
          id?: string
          participant_id?: string
          yes_count?: number
          youth_flag?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "nicotine_control_scores_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      outcome_tracking: {
        Row: {
          abstinent: boolean | null
          baseline_date: string
          co_reading: number | null
          current_product_use: string | null
          id: string
          lost_to_follow_up: boolean | null
          participant_id: string
          quit_date: string | null
          reduced_use: boolean | null
          relapsed: boolean | null
          status_12m: string | null
          status_12w: string | null
          status_1w: string | null
          status_4w: string | null
          status_6m: string | null
          updated_at: string
        }
        Insert: {
          abstinent?: boolean | null
          baseline_date?: string
          co_reading?: number | null
          current_product_use?: string | null
          id?: string
          lost_to_follow_up?: boolean | null
          participant_id: string
          quit_date?: string | null
          reduced_use?: boolean | null
          relapsed?: boolean | null
          status_12m?: string | null
          status_12w?: string | null
          status_1w?: string | null
          status_4w?: string | null
          status_6m?: string | null
          updated_at?: string
        }
        Update: {
          abstinent?: boolean | null
          baseline_date?: string
          co_reading?: number | null
          current_product_use?: string | null
          id?: string
          lost_to_follow_up?: boolean | null
          participant_id?: string
          quit_date?: string | null
          reduced_use?: boolean | null
          relapsed?: boolean | null
          status_12m?: string | null
          status_12w?: string | null
          status_1w?: string | null
          status_4w?: string | null
          status_6m?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcome_tracking_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: true
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          affiliation: string | null
          age: number | null
          appointment_requested: boolean
          city: string | null
          cohort: Database["public"]["Enums"]["cohort_code"] | null
          cohort_reason: string | null
          contact_date: string | null
          contacted: boolean
          created_at: string
          date_of_birth: string | null
          doctor_review_needed: boolean
          email: string | null
          follow_up_status: string | null
          full_name: string
          gender: string | null
          guardian_consent_flag: boolean
          id: string
          is_minor: boolean | null
          main_reason: string | null
          mobile: string
          participant_code: string
          preferred_contact: Database["public"]["Enums"]["contact_method"]
          preferred_language: Database["public"]["Enums"]["preferred_language"]
          previous_quit_attempts: string | null
          previously_tried_quit: boolean | null
          receptionist_notes: string | null
          self_completing: boolean
          updated_at: string
          urgent_symptom: boolean
        }
        Insert: {
          affiliation?: string | null
          age?: number | null
          appointment_requested?: boolean
          city?: string | null
          cohort?: Database["public"]["Enums"]["cohort_code"] | null
          cohort_reason?: string | null
          contact_date?: string | null
          contacted?: boolean
          created_at?: string
          date_of_birth?: string | null
          doctor_review_needed?: boolean
          email?: string | null
          follow_up_status?: string | null
          full_name: string
          gender?: string | null
          guardian_consent_flag?: boolean
          id?: string
          is_minor?: boolean | null
          main_reason?: string | null
          mobile: string
          participant_code?: string
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          preferred_language?: Database["public"]["Enums"]["preferred_language"]
          previous_quit_attempts?: string | null
          previously_tried_quit?: boolean | null
          receptionist_notes?: string | null
          self_completing?: boolean
          updated_at?: string
          urgent_symptom?: boolean
        }
        Update: {
          affiliation?: string | null
          age?: number | null
          appointment_requested?: boolean
          city?: string | null
          cohort?: Database["public"]["Enums"]["cohort_code"] | null
          cohort_reason?: string | null
          contact_date?: string | null
          contacted?: boolean
          created_at?: string
          date_of_birth?: string | null
          doctor_review_needed?: boolean
          email?: string | null
          follow_up_status?: string | null
          full_name?: string
          gender?: string | null
          guardian_consent_flag?: boolean
          id?: string
          is_minor?: boolean | null
          main_reason?: string | null
          mobile?: string
          participant_code?: string
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          preferred_language?: Database["public"]["Enums"]["preferred_language"]
          previous_quit_attempts?: string | null
          previously_tried_quit?: boolean | null
          receptionist_notes?: string | null
          self_completing?: boolean
          updated_at?: string
          urgent_symptom?: boolean
        }
        Relationships: []
      }
      product_use: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          products: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          products: string[]
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          products?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "product_use_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      readiness_stage: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          stage: Database["public"]["Enums"]["readiness_code"]
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          stage: Database["public"]["Enums"]["readiness_code"]
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          stage?: Database["public"]["Enums"]["readiness_code"]
        }
        Relationships: [
          {
            foreignKeyName: "readiness_stage_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_flags: {
        Row: {
          created_at: string
          flags: string[]
          id: string
          participant_id: string
          urgent: boolean
        }
        Insert: {
          created_at?: string
          flags: string[]
          id?: string
          participant_id: string
          urgent?: boolean
        }
        Update: {
          created_at?: string
          flags?: string[]
          id?: string
          participant_id?: string
          urgent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "risk_flags_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          academic_level: string | null
          affiliation: string | null
          age: number | null
          application_code: string
          availability: string | null
          city: string | null
          contact_date: string | null
          contacted: boolean
          created_at: string
          email: string | null
          full_name: string
          gender: string | null
          id: string
          mobile: string
          motivation: string | null
          preferred_contact: Database["public"]["Enums"]["contact_method"]
          preferred_language: Database["public"]["Enums"]["preferred_language"]
          prior_awareness_work: boolean | null
          smoking_status: Database["public"]["Enums"]["smoking_status"] | null
          status: Database["public"]["Enums"]["volunteer_status"]
          updated_at: string
        }
        Insert: {
          academic_level?: string | null
          affiliation?: string | null
          age?: number | null
          application_code?: string
          availability?: string | null
          city?: string | null
          contact_date?: string | null
          contacted?: boolean
          created_at?: string
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          mobile: string
          motivation?: string | null
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          preferred_language?: Database["public"]["Enums"]["preferred_language"]
          prior_awareness_work?: boolean | null
          smoking_status?: Database["public"]["Enums"]["smoking_status"] | null
          status?: Database["public"]["Enums"]["volunteer_status"]
          updated_at?: string
        }
        Update: {
          academic_level?: string | null
          affiliation?: string | null
          age?: number | null
          application_code?: string
          availability?: string | null
          city?: string | null
          contact_date?: string | null
          contacted?: boolean
          created_at?: string
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          mobile?: string
          motivation?: string | null
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          preferred_language?: Database["public"]["Enums"]["preferred_language"]
          prior_awareness_work?: boolean | null
          smoking_status?: Database["public"]["Enums"]["smoking_status"] | null
          status?: Database["public"]["Enums"]["volunteer_status"]
          updated_at?: string
        }
        Relationships: []
      }
      volunteer_interests: {
        Row: {
          application_id: string
          created_at: string
          id: string
          interest: Database["public"]["Enums"]["volunteer_interest"]
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          interest: Database["public"]["Enums"]["volunteer_interest"]
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          interest?: Database["public"]["Enums"]["volunteer_interest"]
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_interests_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "volunteer_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_notes: {
        Row: {
          application_id: string
          created_at: string
          created_by: string | null
          id: string
          note: string
        }
        Insert: {
          application_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note: string
        }
        Update: {
          application_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "volunteer_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_screening: {
        Row: {
          agree_clinical_referral: boolean
          agree_complete_training: boolean
          agree_professional_boundaries: boolean
          application_id: string
          created_at: string
          id: string
          understand_no_medical_advice: boolean
        }
        Insert: {
          agree_clinical_referral: boolean
          agree_complete_training: boolean
          agree_professional_boundaries: boolean
          application_id: string
          created_at?: string
          id?: string
          understand_no_medical_advice: boolean
        }
        Update: {
          agree_clinical_referral?: boolean
          agree_complete_training?: boolean
          agree_professional_boundaries?: boolean
          application_id?: string
          created_at?: string
          id?: string
          understand_no_medical_advice?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_screening_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "volunteer_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_status_history: {
        Row: {
          application_id: string
          changed_by: string | null
          created_at: string
          id: string
          reason: string | null
          status: Database["public"]["Enums"]["volunteer_status"]
        }
        Insert: {
          application_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          status: Database["public"]["Enums"]["volunteer_status"]
        }
        Update: {
          application_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["volunteer_status"]
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "volunteer_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_training_records: {
        Row: {
          application_id: string
          assigned_at: string
          completed_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          training_name: string
        }
        Insert: {
          application_id: string
          assigned_at?: string
          completed_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          training_name: string
        }
        Update: {
          application_id?: string
          assigned_at?: string
          completed_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          training_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_training_records_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "volunteer_applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_user: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "receptionist" | "physician"
      cohort_code: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H"
      contact_method: "whatsapp" | "phone" | "sms" | "email"
      preferred_language: "ar" | "en"
      readiness_code:
        | "quit_now"
        | "quit_prepare"
        | "reduce_first"
        | "not_ready_score"
        | "discuss_alternatives"
        | "score_only"
        | "helping_someone"
      smoking_status: "smoker" | "former_smoker" | "non_smoker"
      volunteer_interest:
        | "awareness_campaigns"
        | "smoker_support"
        | "data_entry"
        | "follow_up_coordination"
        | "content_creation"
        | "events"
      volunteer_status:
        | "new_applicant"
        | "awaiting_review"
        | "accepted_for_training"
        | "in_training"
        | "active_volunteer"
        | "needs_follow_up"
        | "not_accepted"
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
    Enums: {
      app_role: ["receptionist", "physician"],
      cohort_code: ["A", "B", "C", "D", "E", "F", "G", "H"],
      contact_method: ["whatsapp", "phone", "sms", "email"],
      preferred_language: ["ar", "en"],
      readiness_code: [
        "quit_now",
        "quit_prepare",
        "reduce_first",
        "not_ready_score",
        "discuss_alternatives",
        "score_only",
        "helping_someone",
      ],
      smoking_status: ["smoker", "former_smoker", "non_smoker"],
      volunteer_interest: [
        "awareness_campaigns",
        "smoker_support",
        "data_entry",
        "follow_up_coordination",
        "content_creation",
        "events",
      ],
      volunteer_status: [
        "new_applicant",
        "awaiting_review",
        "accepted_for_training",
        "in_training",
        "active_volunteer",
        "needs_follow_up",
        "not_accepted",
      ],
    },
  },
} as const

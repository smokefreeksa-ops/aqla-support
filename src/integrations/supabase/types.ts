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
      challenge_events: {
        Row: {
          anonymous_session_id: string | null
          challenge_type: string
          city: string | null
          created_at: string
          event_type: string
          id: string
          region: string | null
          value_label: string | null
          value_numeric: number | null
        }
        Insert: {
          anonymous_session_id?: string | null
          challenge_type: string
          city?: string | null
          created_at?: string
          event_type: string
          id?: string
          region?: string | null
          value_label?: string | null
          value_numeric?: number | null
        }
        Update: {
          anonymous_session_id?: string | null
          challenge_type?: string
          city?: string | null
          created_at?: string
          event_type?: string
          id?: string
          region?: string | null
          value_label?: string | null
          value_numeric?: number | null
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
      cigarette_module: {
        Row: {
          cigarettes_per_day: number | null
          created_at: string
          hsi_score: number | null
          id: string
          participant_id: string
          time_to_first_cig: string | null
        }
        Insert: {
          cigarettes_per_day?: number | null
          created_at?: string
          hsi_score?: number | null
          id?: string
          participant_id: string
          time_to_first_cig?: string | null
        }
        Update: {
          cigarettes_per_day?: number | null
          created_at?: string
          hsi_score?: number | null
          id?: string
          participant_id?: string
          time_to_first_cig?: string | null
        }
        Relationships: []
      }
      city_challenge_events: {
        Row: {
          anonymous_session_id: string | null
          city: string | null
          created_at: string
          event_type: string
          id: string
          region: string | null
        }
        Insert: {
          anonymous_session_id?: string | null
          city?: string | null
          created_at?: string
          event_type: string
          id?: string
          region?: string | null
        }
        Update: {
          anonymous_session_id?: string | null
          city?: string | null
          created_at?: string
          event_type?: string
          id?: string
          region?: string | null
        }
        Relationships: []
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
      community_exposure: {
        Row: {
          close_friend_smoking_or_nicotine_use: string | null
          created_at: string
          easy_access_to_products: string | null
          family_smoking_exposure: string | null
          id: string
          influencer_or_online_promotion_exposure: string | null
          main_source_of_products: string | null
          online_purchase_or_delivery_exposure: string | null
          participant_id: string
          purchase_attempt_underage_if_applicable: string | null
          secondhand_smoke_exposure_home: string | null
          secondhand_smoke_exposure_public_places: string | null
          seen_tobacco_or_nicotine_ads_shops: string | null
          seen_tobacco_or_nicotine_ads_social_media: string | null
        }
        Insert: {
          close_friend_smoking_or_nicotine_use?: string | null
          created_at?: string
          easy_access_to_products?: string | null
          family_smoking_exposure?: string | null
          id?: string
          influencer_or_online_promotion_exposure?: string | null
          main_source_of_products?: string | null
          online_purchase_or_delivery_exposure?: string | null
          participant_id: string
          purchase_attempt_underage_if_applicable?: string | null
          secondhand_smoke_exposure_home?: string | null
          secondhand_smoke_exposure_public_places?: string | null
          seen_tobacco_or_nicotine_ads_shops?: string | null
          seen_tobacco_or_nicotine_ads_social_media?: string | null
        }
        Update: {
          close_friend_smoking_or_nicotine_use?: string | null
          created_at?: string
          easy_access_to_products?: string | null
          family_smoking_exposure?: string | null
          id?: string
          influencer_or_online_promotion_exposure?: string | null
          main_source_of_products?: string | null
          online_purchase_or_delivery_exposure?: string | null
          participant_id?: string
          purchase_attempt_underage_if_applicable?: string | null
          secondhand_smoke_exposure_home?: string | null
          secondhand_smoke_exposure_public_places?: string | null
          seen_tobacco_or_nicotine_ads_shops?: string | null
          seen_tobacco_or_nicotine_ads_social_media?: string | null
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          consent_assessment: boolean
          consent_contact: boolean
          consent_educational: boolean
          consent_research: boolean
          consent_research_publication: boolean
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
          consent_research_publication?: boolean
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
          consent_research_publication?: boolean
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
      educational_modules: {
        Row: {
          content_ar: string | null
          content_en: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean
          slug: string
          sort_order: number
          source_links: Json
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          content_ar?: string | null
          content_en?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          slug: string
          sort_order?: number
          source_links?: Json
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          content_ar?: string | null
          content_en?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          slug?: string
          sort_order?: number
          source_links?: Json
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      engagement_events: {
        Row: {
          anonymous_session_id: string
          created_at: string
          event_label: string | null
          event_type: string
          id: string
          page_path: string | null
        }
        Insert: {
          anonymous_session_id: string
          created_at?: string
          event_label?: string | null
          event_type: string
          id?: string
          page_path?: string | null
        }
        Update: {
          anonymous_session_id?: string
          created_at?: string
          event_label?: string | null
          event_type?: string
          id?: string
          page_path?: string | null
        }
        Relationships: []
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
      follow_up_visits: {
        Row: {
          abstinence_duration_days: number | null
          abstinent: boolean | null
          cigarettes_per_day: number | null
          co_reading: number | null
          confidence_0_10: number | null
          contacted: boolean | null
          craving_0_10: number | null
          created_at: string
          created_by: string | null
          current_product_use: string | null
          id: string
          lost_to_follow_up: boolean | null
          notes: string | null
          participant_id: string
          percent_reduction_estimate: number | null
          pouches_per_day: number | null
          quit_attempt_made: boolean | null
          reduced_use: boolean | null
          relapsed: boolean | null
          satisfaction_with_support_0_10: number | null
          vaping_frequency: string | null
          visit_date: string
          visit_point: string
          withdrawal_severity_0_10: number | null
        }
        Insert: {
          abstinence_duration_days?: number | null
          abstinent?: boolean | null
          cigarettes_per_day?: number | null
          co_reading?: number | null
          confidence_0_10?: number | null
          contacted?: boolean | null
          craving_0_10?: number | null
          created_at?: string
          created_by?: string | null
          current_product_use?: string | null
          id?: string
          lost_to_follow_up?: boolean | null
          notes?: string | null
          participant_id: string
          percent_reduction_estimate?: number | null
          pouches_per_day?: number | null
          quit_attempt_made?: boolean | null
          reduced_use?: boolean | null
          relapsed?: boolean | null
          satisfaction_with_support_0_10?: number | null
          vaping_frequency?: string | null
          visit_date?: string
          visit_point: string
          withdrawal_severity_0_10?: number | null
        }
        Update: {
          abstinence_duration_days?: number | null
          abstinent?: boolean | null
          cigarettes_per_day?: number | null
          co_reading?: number | null
          confidence_0_10?: number | null
          contacted?: boolean | null
          craving_0_10?: number | null
          created_at?: string
          created_by?: string | null
          current_product_use?: string | null
          id?: string
          lost_to_follow_up?: boolean | null
          notes?: string | null
          participant_id?: string
          percent_reduction_estimate?: number | null
          pouches_per_day?: number | null
          quit_attempt_made?: boolean | null
          reduced_use?: boolean | null
          relapsed?: boolean | null
          satisfaction_with_support_0_10?: number | null
          vaping_frequency?: string | null
          visit_date?: string
          visit_point?: string
          withdrawal_severity_0_10?: number | null
        }
        Relationships: []
      }
      honc_screening: {
        Row: {
          any_yes: boolean
          category: string
          created_at: string
          id: string
          participant_id: string
          positive_count: number
          q1_tried_quit_failed: boolean | null
          q10_stopping_difficult: boolean | null
          q2_strong_cravings: boolean | null
          q3_felt_addicted: boolean | null
          q4_hard_in_restricted: boolean | null
          q5_withdrawal: boolean | null
          q6_needed_to_feel_normal: boolean | null
          q7_increased_use: boolean | null
          q8_felt_controlled: boolean | null
          q9_continued_despite_health: boolean | null
        }
        Insert: {
          any_yes?: boolean
          category?: string
          created_at?: string
          id?: string
          participant_id: string
          positive_count?: number
          q1_tried_quit_failed?: boolean | null
          q10_stopping_difficult?: boolean | null
          q2_strong_cravings?: boolean | null
          q3_felt_addicted?: boolean | null
          q4_hard_in_restricted?: boolean | null
          q5_withdrawal?: boolean | null
          q6_needed_to_feel_normal?: boolean | null
          q7_increased_use?: boolean | null
          q8_felt_controlled?: boolean | null
          q9_continued_despite_health?: boolean | null
        }
        Update: {
          any_yes?: boolean
          category?: string
          created_at?: string
          id?: string
          participant_id?: string
          positive_count?: number
          q1_tried_quit_failed?: boolean | null
          q10_stopping_difficult?: boolean | null
          q2_strong_cravings?: boolean | null
          q3_felt_addicted?: boolean | null
          q4_hard_in_restricted?: boolean | null
          q5_withdrawal?: boolean | null
          q6_needed_to_feel_normal?: boolean | null
          q7_increased_use?: boolean | null
          q8_felt_controlled?: boolean | null
          q9_continued_despite_health?: boolean | null
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          badge: string | null
          city: string | null
          consent_public_display: boolean
          consent_social_tag: boolean
          created_at: string
          display_name: string | null
          duration_seconds: number | null
          id: string
          is_approved: boolean
          is_hidden: boolean
          is_under_18: boolean
          module_slug: string | null
          quiz_attempt_id: string | null
          score: number
          social_handle: string | null
        }
        Insert: {
          badge?: string | null
          city?: string | null
          consent_public_display?: boolean
          consent_social_tag?: boolean
          created_at?: string
          display_name?: string | null
          duration_seconds?: number | null
          id?: string
          is_approved?: boolean
          is_hidden?: boolean
          is_under_18?: boolean
          module_slug?: string | null
          quiz_attempt_id?: string | null
          score: number
          social_handle?: string | null
        }
        Update: {
          badge?: string | null
          city?: string | null
          consent_public_display?: boolean
          consent_social_tag?: boolean
          created_at?: string
          display_name?: string | null
          duration_seconds?: number | null
          id?: string
          is_approved?: boolean
          is_hidden?: boolean
          is_under_18?: boolean
          module_slug?: string | null
          quiz_attempt_id?: string | null
          score?: number
          social_handle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_quiz_attempt_id_fkey"
            columns: ["quiz_attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      motivation_assessment: {
        Row: {
          barriers: string[] | null
          confidence_0_10: number | null
          created_at: string
          id: string
          importance_0_10: number | null
          main_reason: string | null
          participant_id: string
        }
        Insert: {
          barriers?: string[] | null
          confidence_0_10?: number | null
          created_at?: string
          id?: string
          importance_0_10?: number | null
          main_reason?: string | null
          participant_id: string
        }
        Update: {
          barriers?: string[] | null
          confidence_0_10?: number | null
          created_at?: string
          id?: string
          importance_0_10?: number | null
          main_reason?: string | null
          participant_id?: string
        }
        Relationships: []
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
      notification_log: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          export_type: string | null
          id: string
          participant_code: string | null
          provider_response: string | null
          recipient_email: string
          sent_at: string | null
          sent_status: string
          staff_email: string | null
          subject: string | null
          volunteer_code: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          export_type?: string | null
          id?: string
          participant_code?: string | null
          provider_response?: string | null
          recipient_email: string
          sent_at?: string | null
          sent_status: string
          staff_email?: string | null
          subject?: string | null
          volunteer_code?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          export_type?: string | null
          id?: string
          participant_code?: string | null
          provider_response?: string | null
          recipient_email?: string
          sent_at?: string | null
          sent_status?: string
          staff_email?: string | null
          subject?: string | null
          volunteer_code?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          notification_type: string
          recipient_email: string
          send_full_data: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          notification_type: string
          recipient_email?: string
          send_full_data?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          notification_type?: string
          recipient_email?: string
          send_full_data?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      nrt_product_catalog: {
        Row: {
          available_options: Json | null
          category: string
          created_at: string
          description_ar: string | null
          description_en: string | null
          display_order: number
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          product_slug: string
        }
        Insert: {
          available_options?: Json | null
          category: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
          product_slug: string
        }
        Update: {
          available_options?: Json | null
          category?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          product_slug?: string
        }
        Relationships: []
      }
      nrt_request_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          note: string | null
          old_status: string | null
          request_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          note?: string | null
          old_status?: string | null
          request_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          note?: string | null
          old_status?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nrt_request_status_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "nrt_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      nrt_requests: {
        Row: {
          acknowledgement_not_prescription: boolean
          age_group: string | null
          chest_pain_or_heart_condition: string | null
          city: string | null
          completed_aqla_assessment: string | null
          consent_to_contact: boolean
          created_at: string
          delivery_address: string | null
          district: string | null
          email: string | null
          full_name: string
          id: string
          internal_notes: string | null
          mobile_number: string
          notes: string | null
          order_status: string
          preferred_contact_method: string | null
          preferred_language: string | null
          pregnant_or_breastfeeding: string | null
          quantity_requested: Json | null
          request_code: string
          requires_clinician_review: boolean
          selected_products: Json
          severe_breathing_problem: string | null
          taking_regular_medications: string | null
          updated_at: string
        }
        Insert: {
          acknowledgement_not_prescription?: boolean
          age_group?: string | null
          chest_pain_or_heart_condition?: string | null
          city?: string | null
          completed_aqla_assessment?: string | null
          consent_to_contact?: boolean
          created_at?: string
          delivery_address?: string | null
          district?: string | null
          email?: string | null
          full_name: string
          id?: string
          internal_notes?: string | null
          mobile_number: string
          notes?: string | null
          order_status?: string
          preferred_contact_method?: string | null
          preferred_language?: string | null
          pregnant_or_breastfeeding?: string | null
          quantity_requested?: Json | null
          request_code: string
          requires_clinician_review?: boolean
          selected_products: Json
          severe_breathing_problem?: string | null
          taking_regular_medications?: string | null
          updated_at?: string
        }
        Update: {
          acknowledgement_not_prescription?: boolean
          age_group?: string | null
          chest_pain_or_heart_condition?: string | null
          city?: string | null
          completed_aqla_assessment?: string | null
          consent_to_contact?: boolean
          created_at?: string
          delivery_address?: string | null
          district?: string | null
          email?: string | null
          full_name?: string
          id?: string
          internal_notes?: string | null
          mobile_number?: string
          notes?: string | null
          order_status?: string
          preferred_contact_method?: string | null
          preferred_language?: string | null
          pregnant_or_breastfeeding?: string | null
          quantity_requested?: Json | null
          request_code?: string
          requires_clinician_review?: boolean
          selected_products?: Json
          severe_breathing_problem?: string | null
          taking_regular_medications?: string | null
          updated_at?: string
        }
        Relationships: []
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
      page_analytics: {
        Row: {
          anonymous_session_id: string
          created_at: string
          duration_seconds: number | null
          entry_time: string
          exit_time: string | null
          id: string
          language: string | null
          page_path: string
          page_title: string | null
          referrer_type: string | null
        }
        Insert: {
          anonymous_session_id: string
          created_at?: string
          duration_seconds?: number | null
          entry_time?: string
          exit_time?: string | null
          id?: string
          language?: string | null
          page_path: string
          page_title?: string | null
          referrer_type?: string | null
        }
        Update: {
          anonymous_session_id?: string
          created_at?: string
          duration_seconds?: number | null
          entry_time?: string
          exit_time?: string | null
          id?: string
          language?: string | null
          page_path?: string
          page_title?: string | null
          referrer_type?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          anonymous_session_hash: string | null
          created_at: string
          id: string
          page_path: string
          visit_date: string
        }
        Insert: {
          anonymous_session_hash?: string | null
          created_at?: string
          id?: string
          page_path: string
          visit_date?: string
        }
        Update: {
          anonymous_session_hash?: string | null
          created_at?: string
          id?: string
          page_path?: string
          visit_date?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          affiliation: string | null
          affiliation_type: string | null
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
          education_level: string | null
          email: string | null
          follow_up_status: string | null
          full_name: string
          gender: string | null
          guardian_consent_flag: boolean
          id: string
          is_minor: boolean | null
          main_reason: string | null
          mobile: string
          nationality: string | null
          participant_code: string
          preferred_contact: Database["public"]["Enums"]["contact_method"]
          preferred_language: Database["public"]["Enums"]["preferred_language"]
          pregnancy: boolean | null
          previous_quit_attempts: string | null
          previously_tried_quit: boolean | null
          receptionist_notes: string | null
          research_consent_status: string
          school_university_workplace: string | null
          self_completing: boolean
          updated_at: string
          urgent_symptom: boolean
        }
        Insert: {
          affiliation?: string | null
          affiliation_type?: string | null
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
          education_level?: string | null
          email?: string | null
          follow_up_status?: string | null
          full_name: string
          gender?: string | null
          guardian_consent_flag?: boolean
          id?: string
          is_minor?: boolean | null
          main_reason?: string | null
          mobile: string
          nationality?: string | null
          participant_code?: string
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          preferred_language?: Database["public"]["Enums"]["preferred_language"]
          pregnancy?: boolean | null
          previous_quit_attempts?: string | null
          previously_tried_quit?: boolean | null
          receptionist_notes?: string | null
          research_consent_status?: string
          school_university_workplace?: string | null
          self_completing?: boolean
          updated_at?: string
          urgent_symptom?: boolean
        }
        Update: {
          affiliation?: string | null
          affiliation_type?: string | null
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
          education_level?: string | null
          email?: string | null
          follow_up_status?: string | null
          full_name?: string
          gender?: string | null
          guardian_consent_flag?: boolean
          id?: string
          is_minor?: boolean | null
          main_reason?: string | null
          mobile?: string
          nationality?: string | null
          participant_code?: string
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          preferred_language?: Database["public"]["Enums"]["preferred_language"]
          pregnancy?: boolean | null
          previous_quit_attempts?: string | null
          previously_tried_quit?: boolean | null
          receptionist_notes?: string | null
          research_consent_status?: string
          school_university_workplace?: string | null
          self_completing?: boolean
          updated_at?: string
          urgent_symptom?: boolean
        }
        Relationships: []
      }
      pouch_module: {
        Row: {
          created_at: string
          days_30d: number | null
          flavors: string | null
          id: string
          nicotine_strength: string | null
          participant_id: string
          pouches_per_day: number | null
          source: string | null
          time_to_first: string | null
          tried_to_stop: boolean | null
          used_at_institution: boolean | null
          wants_counseling: boolean | null
        }
        Insert: {
          created_at?: string
          days_30d?: number | null
          flavors?: string | null
          id?: string
          nicotine_strength?: string | null
          participant_id: string
          pouches_per_day?: number | null
          source?: string | null
          time_to_first?: string | null
          tried_to_stop?: boolean | null
          used_at_institution?: boolean | null
          wants_counseling?: boolean | null
        }
        Update: {
          created_at?: string
          days_30d?: number | null
          flavors?: string | null
          id?: string
          nicotine_strength?: string | null
          participant_id?: string
          pouches_per_day?: number | null
          source?: string | null
          time_to_first?: string | null
          tried_to_stop?: boolean | null
          used_at_institution?: boolean | null
          wants_counseling?: boolean | null
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
      product_use_details: {
        Row: {
          ad_exposure: boolean | null
          age_first_use: number | null
          age_regular_use: number | null
          created_at: string
          current_use_30d: boolean | null
          days_used_30d: number | null
          ever_use: boolean | null
          family_peer_use: boolean | null
          id: string
          is_main_product: boolean | null
          participant_id: string
          product: string
          source: string | null
          usual_place: string | null
        }
        Insert: {
          ad_exposure?: boolean | null
          age_first_use?: number | null
          age_regular_use?: number | null
          created_at?: string
          current_use_30d?: boolean | null
          days_used_30d?: number | null
          ever_use?: boolean | null
          family_peer_use?: boolean | null
          id?: string
          is_main_product?: boolean | null
          participant_id: string
          product: string
          source?: string | null
          usual_place?: string | null
        }
        Update: {
          ad_exposure?: boolean | null
          age_first_use?: number | null
          age_regular_use?: number | null
          created_at?: string
          current_use_30d?: boolean | null
          days_used_30d?: number | null
          ever_use?: boolean | null
          family_peer_use?: boolean | null
          id?: string
          is_main_product?: boolean | null
          participant_id?: string
          product?: string
          source?: string | null
          usual_place?: string | null
        }
        Relationships: []
      }
      quit_history: {
        Row: {
          attempts_count: number | null
          created_at: string
          ever_tried: boolean | null
          id: string
          longest_quit_duration: string | null
          main_relapse_reason: string | null
          methods_used: string[] | null
          participant_id: string
        }
        Insert: {
          attempts_count?: number | null
          created_at?: string
          ever_tried?: boolean | null
          id?: string
          longest_quit_duration?: string | null
          main_relapse_reason?: string | null
          methods_used?: string[] | null
          participant_id: string
        }
        Update: {
          attempts_count?: number | null
          created_at?: string
          ever_tried?: boolean | null
          id?: string
          longest_quit_duration?: string | null
          main_relapse_reason?: string | null
          methods_used?: string[] | null
          participant_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          anonymous_session_id: string | null
          city: string | null
          correct_answers: number
          created_at: string
          duration_seconds: number | null
          id: string
          module_id: string | null
          module_slug: string | null
          score: number
          total_questions: number
        }
        Insert: {
          anonymous_session_id?: string | null
          city?: string | null
          correct_answers: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          module_id?: string | null
          module_slug?: string | null
          score: number
          total_questions: number
        }
        Update: {
          anonymous_session_id?: string | null
          city?: string | null
          correct_answers?: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          module_id?: string | null
          module_slug?: string | null
          score?: number
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "educational_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_option_index: number
          created_at: string
          difficulty: string
          explanation_ar: string | null
          explanation_en: string | null
          id: string
          is_active: boolean
          module_id: string
          options_ar: Json
          options_en: Json
          question_ar: string
          question_en: string
        }
        Insert: {
          correct_option_index: number
          created_at?: string
          difficulty?: string
          explanation_ar?: string | null
          explanation_en?: string | null
          id?: string
          is_active?: boolean
          module_id: string
          options_ar: Json
          options_en: Json
          question_ar: string
          question_en: string
        }
        Update: {
          correct_option_index?: number
          created_at?: string
          difficulty?: string
          explanation_ar?: string | null
          explanation_en?: string | null
          id?: string
          is_active?: boolean
          module_id?: string
          options_ar?: Json
          options_en?: Json
          question_ar?: string
          question_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "educational_modules"
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
      safety_flags: {
        Row: {
          alt_product_request: boolean | null
          clinician_request: boolean | null
          coughing_blood: boolean | null
          created_at: string
          id: string
          medication_request: boolean | null
          mental_health_concern: boolean | null
          multi_product_use: boolean | null
          participant_id: string
          pregnancy: boolean | null
          repeated_failed_attempts: boolean | null
          severe_breathlessness: boolean | null
          severe_chest_pain: boolean | null
          severe_withdrawal: boolean | null
        }
        Insert: {
          alt_product_request?: boolean | null
          clinician_request?: boolean | null
          coughing_blood?: boolean | null
          created_at?: string
          id?: string
          medication_request?: boolean | null
          mental_health_concern?: boolean | null
          multi_product_use?: boolean | null
          participant_id: string
          pregnancy?: boolean | null
          repeated_failed_attempts?: boolean | null
          severe_breathlessness?: boolean | null
          severe_chest_pain?: boolean | null
          severe_withdrawal?: boolean | null
        }
        Update: {
          alt_product_request?: boolean | null
          clinician_request?: boolean | null
          coughing_blood?: boolean | null
          created_at?: string
          id?: string
          medication_request?: boolean | null
          mental_health_concern?: boolean | null
          multi_product_use?: boolean | null
          participant_id?: string
          pregnancy?: boolean | null
          repeated_failed_attempts?: boolean | null
          severe_breathlessness?: boolean | null
          severe_chest_pain?: boolean | null
          severe_withdrawal?: boolean | null
        }
        Relationships: []
      }
      shisha_module: {
        Row: {
          also_uses_other: boolean | null
          avg_session_minutes: number | null
          created_at: string
          days_30d: number | null
          id: string
          participant_id: string
          quit_interest: string | null
          sessions_per_week: number | null
          setting: string | null
          shared_mouthpiece: boolean | null
          tobacco_type: string | null
        }
        Insert: {
          also_uses_other?: boolean | null
          avg_session_minutes?: number | null
          created_at?: string
          days_30d?: number | null
          id?: string
          participant_id: string
          quit_interest?: string | null
          sessions_per_week?: number | null
          setting?: string | null
          shared_mouthpiece?: boolean | null
          tobacco_type?: string | null
        }
        Update: {
          also_uses_other?: boolean | null
          avg_session_minutes?: number | null
          created_at?: string
          days_30d?: number | null
          id?: string
          participant_id?: string
          quit_interest?: string | null
          sessions_per_week?: number | null
          setting?: string | null
          shared_mouthpiece?: boolean | null
          tobacco_type?: string | null
        }
        Relationships: []
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
      vape_module: {
        Row: {
          created_at: string
          days_30d: number | null
          device_type: string | null
          flavors: string | null
          id: string
          nicotine_concentration: string | null
          participant_id: string
          refillable: string | null
          time_to_first: string | null
          times_per_day: number | null
          tried_to_stop: boolean | null
          used_at_institution: boolean | null
        }
        Insert: {
          created_at?: string
          days_30d?: number | null
          device_type?: string | null
          flavors?: string | null
          id?: string
          nicotine_concentration?: string | null
          participant_id: string
          refillable?: string | null
          time_to_first?: string | null
          times_per_day?: number | null
          tried_to_stop?: boolean | null
          used_at_institution?: boolean | null
        }
        Update: {
          created_at?: string
          days_30d?: number | null
          device_type?: string | null
          flavors?: string | null
          id?: string
          nicotine_concentration?: string | null
          participant_id?: string
          refillable?: string | null
          time_to_first?: string | null
          times_per_day?: number | null
          tried_to_stop?: boolean | null
          used_at_institution?: boolean | null
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
      admin_list_leaderboard: { Args: { p_status?: string }; Returns: Json }
      get_admin_analytics_dashboard: { Args: never; Returns: Json }
      get_admin_challenge_analytics: { Args: never; Returns: Json }
      get_admin_learn_analytics: { Args: never; Returns: Json }
      get_challenge_public_stats: { Args: never; Returns: Json }
      get_city_challenge_stats: { Args: never; Returns: Json }
      get_learn_public_stats: { Args: never; Returns: Json }
      get_learn_top_leaderboard: {
        Args: { p_city?: string; p_window?: string }
        Returns: Json
      }
      get_public_impact_stats: { Args: never; Returns: Json }
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

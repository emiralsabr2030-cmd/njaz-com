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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name_ar: string
          name_en: string | null
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name_ar: string
          name_en?: string | null
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string | null
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string
          credential_id: string | null
          credential_url: string | null
          expiry_date: string | null
          file_path: string | null
          id: string
          issue_date: string | null
          issuer: string | null
          name: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cover_url: string | null
          cr_number: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          industry_id: string | null
          is_active: boolean
          location_id: string | null
          logo_url: string | null
          name: string
          name_en: string | null
          owner_id: string
          phone: string | null
          size_range: string | null
          slug: string
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          website: string | null
        }
        Insert: {
          cover_url?: string | null
          cr_number?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          industry_id?: string | null
          is_active?: boolean
          location_id?: string | null
          logo_url?: string | null
          name: string
          name_en?: string | null
          owner_id: string
          phone?: string | null
          size_range?: string | null
          slug: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Update: {
          cover_url?: string | null
          cr_number?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          industry_id?: string | null
          is_active?: boolean
          location_id?: string | null
          logo_url?: string | null
          name?: string
          name_en?: string | null
          owner_id?: string
          phone?: string | null
          size_range?: string | null
          slug?: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["company_member_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["company_member_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["company_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      educations: {
        Row: {
          created_at: string
          degree: string | null
          description: string | null
          end_date: string | null
          field_of_study: string | null
          grade: string | null
          id: string
          institution: string
          profile_id: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          degree?: string | null
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution: string
          profile_id: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          degree?: string | null
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution?: string
          profile_id?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "educations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          company_name: string
          created_at: string
          description: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          end_date: string | null
          id: string
          is_current: boolean
          location: string | null
          profile_id: string
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          description?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          profile_id: string
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          profile_id?: string
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string
          employer_notes: string | null
          id: string
          job_id: string
          resume_id: string | null
          status: Database["public"]["Enums"]["application_status"]
          status_changed_at: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string
          employer_notes?: string | null
          id?: string
          job_id: string
          resume_id?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          status_changed_at?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string
          employer_notes?: string | null
          id?: string
          job_id?: string
          resume_id?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          status_changed_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_skills: {
        Row: {
          is_required: boolean
          job_id: string
          skill_id: string
        }
        Insert: {
          is_required?: boolean
          job_id: string
          skill_id: string
        }
        Update: {
          is_required?: boolean
          job_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          applications_count: number
          benefits: string | null
          category_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          experience_min_years: number | null
          expires_at: string | null
          id: string
          is_featured: boolean
          location_id: string | null
          published_at: string | null
          requirements: string | null
          salary_currency: string
          salary_max: number | null
          salary_min: number | null
          show_salary: boolean
          slug: string
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          work_mode: Database["public"]["Enums"]["work_mode"]
        }
        Insert: {
          applications_count?: number
          benefits?: string | null
          category_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          experience_min_years?: number | null
          expires_at?: string | null
          id?: string
          is_featured?: boolean
          location_id?: string | null
          published_at?: string | null
          requirements?: string | null
          salary_currency?: string
          salary_max?: number | null
          salary_min?: number | null
          show_salary?: boolean
          slug: string
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          work_mode?: Database["public"]["Enums"]["work_mode"]
        }
        Update: {
          applications_count?: number
          benefits?: string | null
          category_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          experience_min_years?: number | null
          expires_at?: string | null
          id?: string
          is_featured?: boolean
          location_id?: string | null
          published_at?: string | null
          requirements?: string | null
          salary_currency?: string
          salary_max?: number | null
          salary_min?: number | null
          show_salary?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          work_mode?: Database["public"]["Enums"]["work_mode"]
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          created_at: string
          id: string
          language_code: string
          proficiency: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language_code: string
          proficiency?: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language_code?: string
          proficiency?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "languages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_consents: {
        Row: {
          accepted_at: string
          document: string
          id: string
          user_agent: string | null
          user_id: string
          version: string
        }
        Insert: {
          accepted_at?: string
          document: string
          id?: string
          user_agent?: string | null
          user_id: string
          version: string
        }
        Update: {
          accepted_at?: string
          document?: string
          id?: string
          user_agent?: string | null
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          city_ar: string
          city_en: string | null
          country_code: string
          created_at: string
          id: string
          is_active: boolean
          region_ar: string | null
          region_en: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          city_ar: string
          city_en?: string | null
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          region_ar?: string | null
          region_en?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          city_ar?: string
          city_en?: string | null
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          region_ar?: string | null
          region_en?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          cover_path: string | null
          created_at: string
          description: string | null
          id: string
          profile_id: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          cover_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          profile_id: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          cover_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          profile_id?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_skills: {
        Row: {
          created_at: string
          level: number | null
          profile_id: string
          skill_id: string
        }
        Insert: {
          created_at?: string
          level?: number | null
          profile_id: string
          skill_id: string
        }
        Update: {
          created_at?: string
          level?: number | null
          profile_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          headline: string | null
          id: string
          is_public: boolean
          locale: string
          location_id: string | null
          open_to_work: boolean
          phone: string | null
          preferred_work_mode: Database["public"]["Enums"]["work_mode"] | null
          updated_at: string
          username: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          id: string
          is_public?: boolean
          locale?: string
          location_id?: string | null
          open_to_work?: boolean
          phone?: string | null
          preferred_work_mode?: Database["public"]["Enums"]["work_mode"] | null
          updated_at?: string
          username?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          id?: string
          is_public?: boolean
          locale?: string
          location_id?: string | null
          open_to_work?: boolean
          phone?: string | null
          preferred_work_mode?: Database["public"]["Enums"]["work_mode"] | null
          updated_at?: string
          username?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          handled_by: string | null
          id: string
          reason: string
          reporter_id: string
          resolution_note: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          handled_by?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolution_note?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          handled_by?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolution_note?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          file_path: string
          file_size: number | null
          id: string
          is_default: boolean
          mime_type: string | null
          profile_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size?: number | null
          id?: string
          is_default?: boolean
          mime_type?: string | null
          profile_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_default?: boolean
          mime_type?: string | null
          profile_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string
          id: string
          name_ar: string
          name_en: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_ar: string
          name_en?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name_ar?: string
          name_en?: string | null
          slug?: string
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
      verification_requests: {
        Row: {
          company_id: string | null
          created_at: string
          document_paths: string[]
          id: string
          notes: string | null
          requester_id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status"]
          subject_type: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          document_paths?: string[]
          id?: string
          notes?: string | null
          requester_id: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          subject_type: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          document_paths?: string[]
          id?: string
          notes?: string | null
          requester_id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          subject_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_job: {
        Args: { _job_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_applicant_visible_to: {
        Args: { _profile_id: string; _user_id: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_company_owner: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_job_public: { Args: { _job_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      try_uuid: { Args: { _t: string }; Returns: string }
    }
    Enums: {
      app_role:
        | "SUPER_ADMIN"
        | "ADMIN"
        | "MODERATOR"
        | "SUPPORT"
        | "COMPANY_OWNER"
        | "COMPANY_RECRUITER"
        | "JOB_SEEKER"
        | "FREELANCER"
      application_status:
        | "APPLIED"
        | "REVIEWING"
        | "SHORTLISTED"
        | "INTERVIEW"
        | "OFFER"
        | "HIRED"
        | "REJECTED"
        | "WITHDRAWN"
      company_member_role: "OWNER" | "RECRUITER"
      employment_type:
        | "FULL_TIME"
        | "PART_TIME"
        | "TEMPORARY"
        | "SEASONAL"
        | "PROJECT"
      job_status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED"
      report_status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED"
      verification_status:
        | "UNVERIFIED"
        | "PENDING"
        | "VERIFIED"
        | "REJECTED"
        | "SUSPENDED"
      work_mode: "ONSITE" | "REMOTE" | "HYBRID"
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
      app_role: [
        "SUPER_ADMIN",
        "ADMIN",
        "MODERATOR",
        "SUPPORT",
        "COMPANY_OWNER",
        "COMPANY_RECRUITER",
        "JOB_SEEKER",
        "FREELANCER",
      ],
      application_status: [
        "APPLIED",
        "REVIEWING",
        "SHORTLISTED",
        "INTERVIEW",
        "OFFER",
        "HIRED",
        "REJECTED",
        "WITHDRAWN",
      ],
      company_member_role: ["OWNER", "RECRUITER"],
      employment_type: [
        "FULL_TIME",
        "PART_TIME",
        "TEMPORARY",
        "SEASONAL",
        "PROJECT",
      ],
      job_status: ["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"],
      report_status: ["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"],
      verification_status: [
        "UNVERIFIED",
        "PENDING",
        "VERIFIED",
        "REJECTED",
        "SUSPENDED",
      ],
      work_mode: ["ONSITE", "REMOTE", "HYBRID"],
    },
  },
} as const

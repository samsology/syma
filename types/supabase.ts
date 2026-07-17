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
      enrollments: {
        Row: {
          id: string;
          created_at: string;
          full_name: string;
          email: string;
          phone: string;
          program: string;
          experience: string;
          motivation: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          full_name: string;
          email: string;
          phone: string;
          program: string;
          experience: string;
          motivation: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          program?: string;
          experience?: string;
          motivation?: string;
        };
        Relationships: [];
      };
      consultations: {
        Row: {
          id: string;
          created_at: string;
          full_name: string;
          email: string;
          company_name: string;
          consultation_type: string;
          message: string;
          preferred_date: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          full_name: string;
          email: string;
          company_name: string;
          consultation_type: string;
          message: string;
          preferred_date: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          full_name?: string;
          email?: string;
          company_name?: string;
          consultation_type?: string;
          message?: string;
          preferred_date?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          subject: string;
          message: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          subject: string;
          message: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
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
}

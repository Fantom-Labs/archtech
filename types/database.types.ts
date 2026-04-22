export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WorkspacePlan = "trial" | "starter" | "pro" | "studio";
export type MemberRole = "owner" | "admin" | "member";
export type ProjectStatus = "active" | "paused" | "completed" | "archived";
export type PhaseStatus = "pending" | "active" | "completed";
export type CardPriority = "low" | "normal" | "high" | "urgent";
export type CalendarCategory = "personal" | "work" | "project";

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: WorkspacePlan;
          trial_ends_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          logo_url: string | null;
          portal_primary_color: string | null;
          white_label: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: WorkspacePlan;
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          logo_url?: string | null;
          portal_primary_color?: string | null;
          white_label?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          plan?: WorkspacePlan;
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          logo_url?: string | null;
          portal_primary_color?: string | null;
          white_label?: boolean;
        };
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: MemberRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: MemberRole;
          created_at?: string;
        };
        Update: {
          role?: MemberRole;
        };
      };
      workspace_invites: {
        Row: {
          id: string;
          workspace_id: string;
          email: string;
          token: string;
          role: string;
          accepted_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          token: string;
          role?: string;
          accepted_at?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          accepted_at?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          slug: string;
          status: ProjectStatus;
          description: string | null;
          briefing_json: Json | null;
          client_name: string | null;
          client_email: string | null;
          area_m2: number | null;
          location: string | null;
          style: string | null;
          budget_estimated: number | null;
          start_date: string | null;
          end_date: string | null;
          cover_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          slug: string;
          status?: ProjectStatus;
          description?: string | null;
          briefing_json?: Json | null;
          client_name?: string | null;
          client_email?: string | null;
          area_m2?: number | null;
          location?: string | null;
          style?: string | null;
          budget_estimated?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          status?: ProjectStatus;
          description?: string | null;
          briefing_json?: Json | null;
          client_name?: string | null;
          client_email?: string | null;
          area_m2?: number | null;
          location?: string | null;
          style?: string | null;
          budget_estimated?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          cover_image_url?: string | null;
        };
      };
      project_phases: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          status: PhaseStatus;
          order: number;
          start_date: string | null;
          end_date: string | null;
          description: string | null;
          visible_in_portal: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          status?: PhaseStatus;
          order: number;
          start_date?: string | null;
          end_date?: string | null;
          description?: string | null;
          visible_in_portal?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          status?: PhaseStatus;
          order?: number;
          start_date?: string | null;
          end_date?: string | null;
          description?: string | null;
          visible_in_portal?: boolean;
        };
      };
      kanban_columns: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          order: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          order?: number;
        };
      };
      kanban_cards: {
        Row: {
          id: string;
          column_id: string;
          project_id: string;
          title: string;
          description: string | null;
          assignee_id: string | null;
          due_date: string | null;
          tags: string[];
          priority: CardPriority;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          column_id: string;
          project_id: string;
          title: string;
          description?: string | null;
          assignee_id?: string | null;
          due_date?: string | null;
          tags?: string[];
          priority?: CardPriority;
          order: number;
          created_at?: string;
        };
        Update: {
          column_id?: string;
          title?: string;
          description?: string | null;
          assignee_id?: string | null;
          due_date?: string | null;
          tags?: string[];
          priority?: CardPriority;
          order?: number;
        };
      };
      drive_files: {
        Row: {
          id: string;
          project_id: string;
          drive_file_id: string;
          name: string;
          mime_type: string | null;
          visible_in_portal: boolean;
          added_by: string | null;
          synced_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          drive_file_id: string;
          name: string;
          mime_type?: string | null;
          visible_in_portal?: boolean;
          added_by?: string | null;
          synced_at?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          visible_in_portal?: boolean;
          synced_at?: string;
        };
      };
      project_links: {
        Row: {
          id: string;
          project_id: string;
          token: string;
          active: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          token: string;
          active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          active?: boolean;
          expires_at?: string | null;
        };
      };
      drive_tokens: {
        Row: {
          id: string;
          workspace_id: string;
          access_token_encrypted: string;
          refresh_token_encrypted: string;
          expires_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          access_token_encrypted: string;
          refresh_token_encrypted: string;
          expires_at?: string | null;
          updated_at?: string;
        };
        Update: {
          access_token_encrypted?: string;
          refresh_token_encrypted?: string;
          expires_at?: string | null;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          workspace_id: string;
          project_id: string | null;
          sender_id: string | null;
          content: string | null;
          file_url: string | null;
          file_name: string | null;
          file_size_bytes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          project_id?: string | null;
          sender_id?: string | null;
          content?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          file_size_bytes?: number | null;
          created_at?: string;
        };
        Update: {
          content?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          file_size_bytes?: number | null;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          workspace_id: string;
          project_id: string | null;
          title: string;
          start_at: string;
          end_at: string;
          all_day: boolean;
          category: CalendarCategory;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          project_id?: string | null;
          title: string;
          start_at: string;
          end_at: string;
          all_day?: boolean;
          category?: CalendarCategory;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          project_id?: string | null;
          title?: string;
          start_at?: string;
          end_at?: string;
          all_day?: boolean;
          category?: CalendarCategory;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

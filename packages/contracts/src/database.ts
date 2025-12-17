import type { Note } from "./note";
import type { Profile } from "./user";
import type { Workspace, WorkspaceMember } from "./workspace";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Profile;
        Update: Partial<Omit<Profile, "id" | "email">>;
        Relationships: [];
      };
      notes: {
        Row: Note;
        Insert: Omit<Note, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<
            Note,
            "id" | "workspace_id" | "user_id" | "created_at" | "updated_at"
          >
        >;
        Relationships: [];
      };
      workspaces: {
        Row: Workspace;
        Insert: Omit<Workspace, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Workspace, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      workspace_members: {
        Row: WorkspaceMember;
        Insert: Omit<WorkspaceMember, "joined_at">;
        Update: Partial<
          Omit<WorkspaceMember, "workspace_id" | "user_id" | "joined_at">
        >;
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
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

import type { Note } from "./note";
import type { Profile } from "./user";

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
          Omit<Note, "id" | "user_id" | "created_at" | "updated_at">
        >;
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

import type { Database } from "@pickle/contracts";
import {
  type CreateNoteInput,
  type Note,
  noteSchema,
} from "@pickle/contracts/src/note";
import { createClient } from "@/shared/lib/supabase/client";

export const createNote = async (newNote: CreateNoteInput): Promise<Note> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. 사용자의 워크스페이스 정보 조회
  const { data: workspace } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!workspace) throw new Error("No Workspace Found");

  const insertPayload: Database["public"]["Tables"]["notes"]["Insert"] = {
    workspace_id: workspace.workspace_id,
    user_id: user.id,
    type: newNote.type,
    url: newNote.meta.url, // [Fix] URL is nested in meta for input
    memo: newNote.memo ?? null, // [Fix] Column name is 'memo'
    data: newNote.data,
    tags: newNote.tags ?? [],
  };

  // Supabase는 INSERT 후 결과를 반환할 때 select()를 체이닝하면 해당 로우를 반환합니다.
  const { data, error } = await supabase
    .from("notes")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Zod 스키마를 사용하여 반환된 데이터(JSON)가 애플리케이션의 Note 타입과 일치하는지 검증합니다.
  // 이는 런타임에 DB 데이터 무결성을 보장하는 중요한 단계입니다.
  const parsed = noteSchema.safeParse(data);

  if (!parsed.success) {
    console.error("Note creation validation failed:", parsed.error);
    throw new Error("Invalid note data returned from database");
  }

  return parsed.data;
};

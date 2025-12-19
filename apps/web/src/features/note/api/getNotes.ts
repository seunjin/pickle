import type { Database } from "@pickle/contracts";
import {
  type NoteWithAsset,
  noteWithAssetSchema,
} from "@pickle/contracts/src/note";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/shared/lib/supabase/client";

export const getNotes = async (
  client?: SupabaseClient<Database>,
): Promise<NoteWithAsset[]> => {
  const supabase = client ?? createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. 사용자의 워크스페이스 정보 조회
  // TODO: 다중 워크스페이스 지원 필요 (현재는 첫 번째 워크스페이스만 가져옴)
  const { data: workspace } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!workspace) return [];

  // 2. 노트와 연결된 에셋 정보 함께 조회
  const { data, error } = await supabase
    .from("notes")
    .select("*, assets(*)")
    .eq("workspace_id", workspace.workspace_id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  // Zod 스키마를 확장하여 Note + Assets 구조를 정의합니다.
  // DB 조인 쿼리 결과(Note & { assets: Asset | null })를 안전하게 검증합니다.
  const parsed = noteWithAssetSchema.array().safeParse(data);

  if (!parsed.success) {
    console.error("Notes fetch validation failed:", parsed.error);
    // 검증 실패 시 빈 배열을 반환하거나, 에러를 던질 수 있습니다.
    // 여기서는 안전하게 실패 로그를 남기고 빈 배열을 반환하는 정책을 따릅니다.
    return [];
  }

  return parsed.data;
};

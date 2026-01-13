import type { Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/shared/lib/supabase/client";

/**
 * 워크스페이스의 스토리지 사용량(바이트 합계)을 조회합니다.
 * assets 테이블의 full_size_bytes와 thumb_size_bytes를 합산합니다.
 */
export const getWorkspaceUsage = async (
  workspaceId: string,
  client?: SupabaseClient<Database>,
): Promise<number> => {
  const supabase = client ?? createClient();

  const { data, error } = await supabase
    .from("assets")
    .select("full_size_bytes, thumb_size_bytes")
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(error.message);
  }

  const totalBytes = data.reduce((acc, asset) => {
    return acc + (asset.full_size_bytes || 0) + (asset.thumb_size_bytes || 0);
  }, 0);

  return totalBytes;
};

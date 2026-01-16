import type { Database, WorkspaceStorageUsage } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/shared/lib/supabase/client";

/**
 * 워크스페이스의 통합 스토리지 사용량 및 한도 정보를 조회합니다.
 * 파일(Assets)과 DB 데이터(Notes)의 용량을 합산합니다.
 */
export const getWorkspaceUsage = async (
  workspaceId: string,
  client?: SupabaseClient<Database>,
): Promise<WorkspaceStorageUsage> => {
  const supabase = client ?? createClient();

  // DB에 생성한 RPC 함수 호출
  const { data, error } = await supabase.rpc("get_workspace_storage_info", {
    p_workspace_id: workspaceId,
  });

  if (error) {
    throw new Error(error.message);
  }

  // RPC 결과가 배열로 반환되므로 첫 번째 아이템 사용
  const usageInfo = Array.isArray(data) ? data[0] : null;

  if (!usageInfo) {
    throw new Error("Failed to fetch storage usage info");
  }

  return {
    asset_bytes: Number(usageInfo.asset_bytes || 0),
    bookmark_bytes: Number(usageInfo.bookmark_bytes || 0),
    text_bytes: Number(usageInfo.text_bytes || 0),
    total_used_bytes: Number(usageInfo.total_used_bytes || 0),
    limit_bytes: Number(usageInfo.limit_bytes || 0),
  };
};

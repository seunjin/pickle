import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase";

/**
 * 사용자의 계정을 탈퇴(삭제) 처리합니다.
 * 1. 사용자의 모든 storage 자산을 조회하고 삭제합니다.
 * 2. DB RPC를 호출하여 계정과 관련 데이터를 삭제합니다.
 * 3. 로그아웃을 수행합니다.
 */
export async function deleteAccount() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authenticated user not found");

  const { data: assets } = await supabase
    .from("assets")
    .select("full_path")
    .eq("owner_id", user.id);

  if (assets && assets.length > 0) {
    const paths = assets.map((a) => a.full_path);
    const { error: storageError } = await supabase.storage
      .from("bitmaps")
      .remove(paths);

    if (storageError) {
      logger.error("Failed to cleanup storage before account deletion", {
        userId: user.id,
        error: storageError,
      });
    }
  }

  const { error: rpcError } = await supabase.rpc("delete_user_account" as any);

  if (rpcError) {
    throw new Error(rpcError.message);
  }

  await supabase.auth.signOut();

  return true;
}

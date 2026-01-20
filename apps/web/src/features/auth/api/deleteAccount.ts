import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase/client";

/**
 * 사용자의 계정을 탈퇴(삭제) 처리합니다.
 * 1. 사용자의 모든 storage 자산을 조회하고 삭제합니다.
 * 2. DB RPC를 호출하여 계정과 관련 데이터를 삭제합니다.
 * 3. 로그아웃을 수행합니다.
 */
export async function deleteAccount() {
  const supabase = createClient();

  // 1. 현재 사용자 아이디 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authenticated user not found");

  // 2. 사용자의 모든 Asset 조회 (Storage 파일 삭제를 위함)
  const { data: assets } = await supabase
    .from("assets")
    .select("full_path")
    .eq("owner_id", user.id);

  // 3. Storage 파일들 삭제
  if (assets && assets.length > 0) {
    const paths = assets.map((a) => a.full_path);
    const { error: storageError } = await supabase.storage
      .from("bitmaps")
      .remove(paths);

    if (storageError) {
      // 스토리지 삭제 실패는 로깅만 하고 진행 (이미 계정 탈퇴를 결정한 상태이므로)
      logger.error("Failed to cleanup storage before account deletion", {
        userId: user.id,
        error: storageError,
      });
    }
  }

  // 4. RPC 호출하여 계정 삭제
  const { error: rpcError } = await supabase.rpc(
    "delete_user_account" as "complete_signup",
  ); // 타입에 누락되었으나 대등한 타입으로 우회 (또는 타입 확장)

  if (rpcError) {
    throw new Error(rpcError.message);
  }

  // 5. 로그아웃 처리 (세션 정리)
  await supabase.auth.signOut();

  return true;
}

-- 20260116000000_add_delete_user_rpc.sql
-- 계정 탈퇴를 위한 RPC 생성

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 현재 요청한 사용자의 ID 가져오기
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '인증된 사용자가 아닙니다.';
  END IF;

  -- auth.users 테이블에서 사용자 삭제
  -- SECURITY DEFINER로 인해 높은 권한으로 실행되어 삭제가 가능합니다.
  -- ON DELETE CASCADE 설정에 의해 public.users 및 연관 데이터들이 연쇄 삭제됩니다.
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

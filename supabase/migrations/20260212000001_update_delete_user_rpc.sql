-- 20260212000001_update_delete_user_rpc.sql
-- 계정 탈퇴 시 베타 관련 데이터(화이트리스트, 신청내역) 연쇄 삭제 로직 추가

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- 1. 현재 요청한 사용자의 ID 가져오기
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '인증된 사용자가 아닙니다.';
  END IF;

  -- 2. 삭제 전 유저의 이메일 백업 (화이트리스트/신청내역 삭제용)
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  -- 3. 베타 관련 데이터 삭제 (이메일 기준)
  -- 이메일이 존재할 경우에만 삭제 시도
  IF v_user_email IS NOT NULL THEN
    -- 화이트리스트(allowed_emails)에서 제거
    DELETE FROM public.allowed_emails WHERE email = v_user_email;
    
    -- 베타 신청 내역(beta_applications)에서 제거 (또는 상태를 'withdrawn' 등으로 변경할 수도 있지만, 완전 삭제가 개인정보 보호에 유리)
    DELETE FROM public.beta_applications WHERE email = v_user_email;
  END IF;

  -- 4. auth.users 테이블에서 사용자 삭제
  -- ON DELETE CASCADE 설정에 의해 public.users 및 연관 데이터들이 연쇄 삭제됩니다.
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

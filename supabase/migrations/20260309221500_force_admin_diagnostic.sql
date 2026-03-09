-- 1. [진단] 현재 로그인한 사용자의 ID와 권한 상태를 직접 확인
-- (SQL Editor에서 실행 시 'Your UID' 부분은 무시하고 아래를 먼저 실행하세요)
SELECT id, email, authority, status FROM public.users 
WHERE email = '지니님의_이메일'; -- 여기에 실제 로그인한 이메일을 넣어주세요.

-- 2. [강제 복구] 만약 authority가 'admin'이 아니라면 강제로 부여
UPDATE public.users 
SET authority = 'super_admin' 
WHERE email = '지니님의_이메일';

-- 3. [RLS 점검] 정책이 꼬였를 때를 대비해 beta_applications의 RLS를 잠시 끄고 테스트
-- (만약 아래를 실행하고 데이터가 잘 나온다면 100% RLS 정책 문제입니다)
-- ALTER TABLE public.beta_applications DISABLE ROW LEVEL SECURITY; -- (테스트용)
-- ALTER TABLE public.beta_applications ENABLE ROW LEVEL SECURITY;  -- (복구용)

-- 4. [최후의 수단] RLS 정책의 서브쿼리 순환 참조 등을 방지하기 위해 
-- 이메일이 아닌 ID 기반 전문 어드민 권한 체크 함수로 교체 (Security Definer)
CREATE OR REPLACE FUNCTION public.is_admin_safe()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND authority IN ('admin', 'super_admin')
  );
END;
$$;

-- 5. beta_applications 정책에 위 함수 적용
DROP POLICY IF EXISTS "Admins can manage beta applications" ON public.beta_applications;
CREATE POLICY "Admins can manage beta applications"
    ON public.beta_applications
    FOR ALL
    TO authenticated
    USING ( public.is_admin_safe() );

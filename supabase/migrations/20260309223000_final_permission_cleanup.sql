-- 20260309223000_final_permission_cleanup.sql
-- 'permission denied for table users' 오류를 근본적으로 해결하기 위해 auth.users 직접 참조를 제거하고 RLS를 최적화합니다.

-- 1. 모든 관련 테이블에 대한 기본 권한 재설정 (확실하게)
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON public.users TO authenticated, anon;
GRANT SELECT ON public.beta_applications TO authenticated, anon;
GRANT SELECT ON public.allowed_emails TO authenticated, anon;

-- 2. 관리자 확인 함수 최적화 (보안 정의 함수로 유지)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- auth.uid()는 SECURITY DEFINER 함수 내에서도 현재 호출자(인증된 사용자)의 ID를 올바르게 반환합니다.
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND authority IN ('admin', 'super_admin')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 3. beta_applications RLS 정책 재작성 (auth.users 대신 auth.jwt() 사용)
ALTER TABLE public.beta_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage beta applications" ON public.beta_applications;
DROP POLICY IF EXISTS "Anyone can submit beta application" ON public.beta_applications;
DROP POLICY IF EXISTS "Users can view own beta application" ON public.beta_applications;
DROP POLICY IF EXISTS "Users can view their own beta application" ON public.beta_applications;

-- 관리자: 무제한 권한
CREATE POLICY "Admins can manage beta applications"
ON public.beta_applications FOR ALL 
TO authenticated 
USING (public.is_admin());

-- 일반 유저: 본인 데이터 조회 (JWT에서 이메일 추출하여 비교)
CREATE POLICY "Users can view own beta application"
ON public.beta_applications FOR SELECT 
TO authenticated 
USING (
  email = (auth.jwt() ->> 'email') 
  OR public.is_admin()
);

-- 누구나 신청 가능
CREATE POLICY "Anyone can submit beta application"
ON public.beta_applications FOR INSERT 
TO authenticated, anon 
WITH CHECK (true);

-- 4. users 테이블 RLS 정책 정리 (자기 프로필 조회 권한)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.users;

CREATE POLICY "Allow users to read profiles"
ON public.users FOR SELECT 
TO authenticated 
USING (
  id = auth.uid() 
  OR public.is_admin()
);

-- 5. allowed_emails RLS 정책 정리
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage allowed emails" ON public.allowed_emails;
CREATE POLICY "Admins can manage allowed emails"
ON public.allowed_emails FOR ALL 
TO authenticated 
USING (public.is_admin());

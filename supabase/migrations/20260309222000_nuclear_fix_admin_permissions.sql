-- 20260309222000_nuclear_fix_admin_permissions.sql
-- 관리자 페이지 403 Forbidden (permission denied for table users) 오류를 해결하기 위한 전방위적 권한 복구 스크립트입니다.

-- 1. 기본 테이블 권한 부여 (PostgREST가 RLS를 평가하기 위해 필요함)
GRANT SELECT ON public.users TO authenticated, anon;
GRANT SELECT ON public.beta_applications TO authenticated, anon;
GRANT SELECT ON public.allowed_emails TO authenticated, anon;

-- 2. 관리자 확인 함수 최적화 및 권한 부여
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- 생성자(postgres) 권한으로 실행되어 RLS를 우회함
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

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 3. users 테이블 RLS 정책 정리 (자기 자신 조회 보장)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.users;

CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
TO authenticated 
USING (auth.uid() = id OR public.is_admin());

-- 4. beta_applications RLS 정책 정리
ALTER TABLE public.beta_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit beta application" ON public.beta_applications;
DROP POLICY IF EXISTS "Admins can manage beta applications" ON public.beta_applications;
DROP POLICY IF EXISTS "Users can view their own beta application" ON public.beta_applications;

-- 관리자: 전체 제어
CREATE POLICY "Admins can manage beta applications"
ON public.beta_applications FOR ALL 
TO authenticated 
USING (public.is_admin());

-- 일반 유저: 신청(Insert) 및 자기 것 조회(Select)
CREATE POLICY "Anyone can submit beta application"
ON public.beta_applications FOR INSERT 
TO authenticated, anon 
WITH CHECK (true);

CREATE POLICY "Users can view own beta application"
ON public.beta_applications FOR SELECT 
TO authenticated 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR public.is_admin());

-- 5. allowed_emails RLS 정책 정리
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view allowed emails" ON public.allowed_emails;
DROP POLICY IF EXISTS "Admins can insert allowed emails" ON public.allowed_emails;
DROP POLICY IF EXISTS "Admins can delete allowed emails" ON public.allowed_emails;

CREATE POLICY "Admins can manage allowed emails"
ON public.allowed_emails FOR ALL 
TO authenticated 
USING (public.is_admin());

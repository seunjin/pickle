-- 20260309221000_fix_permission_denied_users.sql
-- 관리자 페이지에서 'permission denied for table users' 오류가 발생하는 문제를 해결합니다.

-- 1. authenticated 역할에 대해 users 및 beta_applications 테이블 조회 권한 명시적 부여
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.beta_applications TO authenticated;

-- 2. is_admin() 함수가 모든 인증된 사용자에게 실행 가능하도록 설정
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. users 테이블의 RLS 정책이 유효한지 확인 및 보강
-- (모든 인증된 사용자가 자신의 프로필을 볼 수 있어야 하며, 어드민은 타인의 프로필 기반 권한 체크가 가능해야 함)
DO $$ 
BEGIN
    -- profiles에서 users로 이름이 바뀌었으므로 정책이 누락되었을 가능성 체크
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Allow authenticated users to read profiles'
    ) THEN
        CREATE POLICY "Allow authenticated users to read profiles" 
        ON public.users FOR SELECT 
        TO authenticated 
        USING (true); -- 모든 인증된 유저는 유저 테이블의 기본 정보(authority 등)를 읽을 수 있어야 함
    END IF;
END $$;

-- 4. beta_applications 정책 재확인 (이미 존재하겠지만 확실히 함)
DROP POLICY IF EXISTS "Admins can manage beta applications" ON public.beta_applications;
CREATE POLICY "Admins can manage beta applications"
    ON public.beta_applications
    FOR ALL
    TO authenticated
    USING ( public.is_admin() );

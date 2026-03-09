-- 20260309175500_allow_select_own_beta_application.sql

-- 사용자가 자신의 베타 신청 내역을 조회할 수 있도록 RLS 정책을 추가합니다.
-- 이메일 기반으로 조회를 허용하며, 인증된 사용자만 가능합니다.

create policy "Users can view their own beta application"
    on public.beta_applications
    for select
    to authenticated
    using ( email = auth.jwt()->>'email' );

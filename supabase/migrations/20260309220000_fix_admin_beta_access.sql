-- 20260309220000_fix_admin_beta_access.sql
-- 관리자(admin, super_admin)가 베타 신청 내역 및 화이트리스트를 조회하지 못하는 문제를 해결합니다.
-- RLS 정책에서 서브쿼리 대신 성능이 더 좋고 안전한 보안 정의 함수(is_admin)를 사용합니다.

-- 1. 관리자 확인 함수 생성 (Security Definer)
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer -- 함수 생성자의 권한(일반적으로 postgres/admin)으로 실행
set search_path = public
as $$
declare
  v_authority text;
begin
  select authority into v_authority
  from public.users
  where id = auth.uid();
  
  return v_authority in ('admin', 'super_admin');
end;
$$;

-- 2. 기존 beta_applications 정책 삭제 및 재생성
drop policy if exists "Admins can manage beta applications" on public.beta_applications;
drop policy if exists "Users can view their own beta application" on public.beta_applications;

-- 관리자 정책: 모든 행에 대해 모든 작업 허용
create policy "Admins can manage beta applications"
    on public.beta_applications
    for all
    to authenticated
    using ( public.is_admin() );

-- 일반 유저 정책: 자신의 신청 내역만 조회 허용
create policy "Users can view their own beta application"
    on public.beta_applications
    for select
    to authenticated
    using ( 
      email = auth.jwt()->>'email' 
      OR (select email from auth.users where id = auth.uid()) = email -- JWT와 auth.users 이메일 모두 확인 (안전장치)
    );

-- 3. 기존 allowed_emails 정책 수정
drop policy if exists "Admins can view allowed emails" on public.allowed_emails;
drop policy if exists "Admins can insert allowed emails" on public.allowed_emails;
drop policy if exists "Admins can delete allowed emails" on public.allowed_emails;

create policy "Admins can view allowed emails"
    on public.allowed_emails
    for select
    to authenticated
    using ( public.is_admin() );

create policy "Admins can insert allowed emails"
    on public.allowed_emails
    for insert
    to authenticated
    with check ( public.is_admin() );

create policy "Admins can delete allowed emails"
    on public.allowed_emails
    for delete
    to authenticated
    using ( public.is_admin() );

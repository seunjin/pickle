-- 20260309174500_cleanup_unauthorized_beta_users.sql

-- 1. 현재 active 상태인 유저 중 화이트리스트(allowed_emails)에 없는 일반 멤버(member)를 모두 pending으로 전환합니다.
-- Admin이나 Super Admin은 시스템 관리를 위해 제외하며, 화이트리스트에 있는 유저는 건드리지 않습니다.

update public.users
set status = 'pending'
where status = 'active'
  and authority = 'member'
  and email not in (
    select email from public.allowed_emails
  );

-- 2. 로그 확인 (영향을 받은 유저 수 확인용 - Supabase 콘솔에서 실행 시 출력됨)
-- do $$ 
-- declare 
--   v_count int;
-- begin
--   get diagnostics v_count = row_count;
--   raise notice 'Cleaned up % unauthorized beta users.', v_count;
-- end $$;

-- 20260213163000_fix_allowed_emails_rls.sql
-- allowed_emails 테이블에 대한 어드민(admin, super_admin) INSERT/DELETE 권한 추가

-- 어드민은 화이트리스트에 이메일을 추가할 수 있음
create policy "Admins can insert allowed emails"
    on public.allowed_emails
    for insert
    to authenticated
    with check ( (select authority from public.users where id = auth.uid()) in ('admin', 'super_admin') );

-- 어드민은 화이트리스트에서 이메일을 삭제할 수 있음
create policy "Admins can delete allowed emails"
    on public.allowed_emails
    for delete
    to authenticated
    using ( (select authority from public.users where id = auth.uid()) in ('admin', 'super_admin') );

-- 20260128151500_fix_complete_signup_ambiguity.sql

drop function if exists public.complete_signup(boolean);
drop function if exists public.complete_signup(boolean, boolean);

create or replace function public.complete_signup(
  p_marketing_agreed boolean default false,
  p_is_over_14 boolean default false
)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid;
  v_user_email text;
  v_full_name text;
  v_avatar_url text;
  v_workspace_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception '인증이 필요합니다.'; end if;

  select email, (raw_user_meta_data->>'full_name'), (raw_user_meta_data->>'avatar_url')
  into v_user_email, v_full_name, v_avatar_url
  from auth.users where id = v_user_id;

  if v_user_email is null then
    return json_build_object(
      'status', 'error',
      'message', '인증 정보가 유효하지 않습니다. 다시 로그인해 주세요.',
      'detail', 'AUTH_USER_NOT_FOUND',
      'hint', 'The user ID from JWT does not exist in auth.users. Please log out and sign in again.'
    );
  end if;

  v_full_name := coalesce(v_full_name, v_user_email);

  insert into public.users (
    id, full_name, avatar_url, email, status, 
    is_terms_agreed, is_privacy_agreed, is_marketing_agreed, is_over_14
  )
  values (
    v_user_id, v_full_name, v_avatar_url, v_user_email, 'active', 
    true, true, p_marketing_agreed, p_is_over_14
  )
  on conflict (id) do update set
    status = 'active',
    is_terms_agreed = true,
    is_privacy_agreed = true,
    is_marketing_agreed = excluded.is_marketing_agreed,
    is_over_14 = excluded.is_over_14;

  if not exists (select 1 from workspace_members where user_id = v_user_id) then
    insert into workspaces (name)
    values (v_full_name || '''s Workspace')
    returning id into v_workspace_id;

    insert into workspace_members (workspace_id, user_id, role)
    values (v_workspace_id, v_user_id, 'owner');
  end if;

  return json_build_object('status', 'success');
exception when others then
  return json_build_object(
    'status', 'error',
    'message', SQLERRM,
    'detail', SQLSTATE,
    'hint', 'Conflict detected during signup completion'
  );
end;
$$;

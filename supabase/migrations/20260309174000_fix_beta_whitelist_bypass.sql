-- 20260309174000_fix_beta_whitelist_bypass.sql

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
  v_is_allowed boolean;
  v_status public.user_status;
begin
  -- 1. 인증 확인
  v_user_id := auth.uid();
  if v_user_id is null then raise exception '인증이 필요합니다.'; end if;

  -- 2. 유저 정보 추출
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

  -- 3. 베타 화이트리스트 확인 (보안 강화)
  select exists(select 1 from public.allowed_emails where email = v_user_email) into v_is_allowed;

  if v_is_allowed then
    v_status := 'active';
  else
    v_status := 'pending';
  end if;

  -- 4. 유저 프로필 생성/업데이트
  insert into public.users (
    id, full_name, avatar_url, email, status, 
    is_terms_agreed, is_privacy_agreed, is_marketing_agreed, is_over_14
  )
  values (
    v_user_id, v_full_name, v_avatar_url, v_user_email, v_status, 
    true, true, p_marketing_agreed, p_is_over_14
  )
  on conflict (id) do update set
    status = excluded.status, -- v_status 반영
    is_terms_agreed = true,
    is_privacy_agreed = true,
    is_marketing_agreed = excluded.is_marketing_agreed,
    is_over_14 = excluded.is_over_14;

  -- 5. active 상태일 때만 기본 워크스페이스 생성
  if v_status = 'active' and not exists (select 1 from workspace_members where user_id = v_user_id) then
    insert into workspaces (name)
    values (v_full_name || '''s Workspace')
    returning id into v_workspace_id;

    insert into workspace_members (workspace_id, user_id, role)
    values (v_workspace_id, v_user_id, 'owner');
  end if;

  -- 6. 응답 반환
  if v_status = 'active' then
    return json_build_object('status', 'success');
  else
    return json_build_object(
      'status', 'pending',
      'message', '베타 승인 대기 중입니다. 관리자의 승인이 완료된 후 이용하실 수 있습니다.'
    );
  end if;

exception when others then
  return json_build_object(
    'status', 'error',
    'message', SQLERRM,
    'detail', SQLSTATE,
    'hint', 'Conflict detected during signup completion'
  );
end;
$$;

-- 20260116000003_refine_signup_logic.sql

-- 1. handle_new_user 트리거 수정: 필수 약관 동의가 없으면 public.users에 인서트하지 않음
-- (유저 정보가 없는 상태를 유지하여 '유령 pending 유저' 방지)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_is_terms_agreed boolean;
  v_is_privacy_agreed boolean;
  v_is_marketing_agreed boolean;
  v_workspace_id uuid;
begin
  v_is_terms_agreed := coalesce((new.raw_user_meta_data->>'is_terms_agreed')::boolean, false);
  v_is_privacy_agreed := coalesce((new.raw_user_meta_data->>'is_privacy_agreed')::boolean, false);
  v_is_marketing_agreed := coalesce((new.raw_user_meta_data->>'is_marketing_agreed')::boolean, false);

  -- 필수 약관 동의가 있을 때만 인서트 (회원가입 경로로 들어온 경우)
  if v_is_terms_agreed and v_is_privacy_agreed then
    insert into public.users (
      id, 
      full_name, 
      avatar_url, 
      email, 
      authority, 
      status, 
      is_terms_agreed, 
      is_privacy_agreed, 
      is_marketing_agreed
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', new.email),
      new.raw_user_meta_data->>'avatar_url',
      new.email,
      NULL,
      'active',
      true,
      true,
      v_is_marketing_agreed
    )
    on conflict (id) do update set
      status = 'active',
      is_terms_agreed = true,
      is_privacy_agreed = true,
      is_marketing_agreed = excluded.is_marketing_agreed;

    -- 워크스페이스 생성
    if not exists (select 1 from workspace_members where user_id = new.id) then
        insert into workspaces (name)
        values (coalesce(new.raw_user_meta_data->>'full_name', 'My Workspace'))
        returning id into v_workspace_id;

        insert into workspace_members (workspace_id, user_id, role)
        values (v_workspace_id, new.id, 'owner');
    end if;
  end if;

  return new;
end;
$$;

-- 2. complete_signup RPC 수정: 유저가 public.users에 없는 경우(인증만 된 상태)도 처리 가능하도록 보완
create or replace function public.complete_signup(
  marketing_agreed boolean default false
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
  
  if v_user_id is null then
    raise exception '인증이 필요합니다.';
  end if;

  -- auth.users에서 정보 가져오기
  select email, (raw_user_meta_data->>'full_name'), (raw_user_meta_data->>'avatar_url')
  into v_user_email, v_full_name, v_avatar_url
  from auth.users
  where id = v_user_id;

  -- 1. 유저 정보 삽입 또는 업데이트
  insert into public.users (
    id, full_name, avatar_url, email, status, 
    is_terms_agreed, is_privacy_agreed, is_marketing_agreed
  )
  values (
    v_user_id, 
    coalesce(v_full_name, v_user_email), 
    v_avatar_url, 
    v_user_email, 
    'active', 
    true, true, marketing_agreed
  )
  on conflict (id) do update set
    status = 'active',
    is_terms_agreed = true,
    is_privacy_agreed = true,
    is_marketing_agreed = marketing_agreed;

  -- 2. 기본 워크스페이스 생성 (중복 체크)
  if not exists (select 1 from workspace_members where user_id = v_user_id) then
    insert into workspaces (name)
    values (coalesce(v_full_name, 'My Workspace'))
    returning id into v_workspace_id;

    insert into workspace_members (workspace_id, user_id, role)
    values (v_workspace_id, v_user_id, 'owner');
  end if;

  return json_build_object(
    'status', 'success'
  );
end;
$$;

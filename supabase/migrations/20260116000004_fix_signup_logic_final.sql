-- 20260116000004_fix_signup_logic_final.sql

-- 1. handle_new_user 트리거 최종 수정
-- 지적하신 대로 is_terms_agreed와 is_privacy_agreed "둘 다" true일 때만 가입 의도가 있는 것으로 판단.
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
  -- 메타데이터 추출
  v_is_terms_agreed := coalesce((new.raw_user_meta_data->>'is_terms_agreed')::boolean, false);
  v_is_privacy_agreed := coalesce((new.raw_user_meta_data->>'is_privacy_agreed')::boolean, false);
  v_is_marketing_agreed := coalesce((new.raw_user_meta_data->>'is_marketing_agreed')::boolean, false);

  -- [핵심] 필수 약관 2종이 모두 체크된 경우에만 가입자로 간주하여 프로필 생성
  if v_is_terms_agreed and v_is_privacy_agreed then
    insert into public.users (
      id, full_name, avatar_url, email, status, 
      is_terms_agreed, is_privacy_agreed, is_marketing_agreed
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', new.email),
      new.raw_user_meta_data->>'avatar_url',
      new.email,
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

    -- 기본 워크스페이스 생성
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

-- 2. complete_signup RPC 정교화
-- 이미 인증된 세션이 있는 유저가 약관 동의 후 호출하는 용도
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

  -- auth.users에서 최신 메타데이터 포함 정보 가져오기
  select email, (raw_user_meta_data->>'full_name'), (raw_user_meta_data->>'avatar_url')
  into v_user_email, v_full_name, v_avatar_url
  from auth.users
  where id = v_user_id;

  -- 프로필 생성 또는 업데이트
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

  -- 워크스페이스 생성 (중복 체크)
  if not exists (select 1 from workspace_members where user_id = v_user_id) then
    insert into workspaces (name)
    values (coalesce(v_full_name, 'My Workspace'))
    returning id into v_workspace_id;

    insert into workspace_members (workspace_id, user_id, role)
    values (v_workspace_id, v_user_id, 'owner');
  end if;

  return json_build_object('status', 'success');
end;
$$;

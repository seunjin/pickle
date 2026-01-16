-- 20260116000006_robust_signup_v2.sql

-- 1. handle_new_user 트리거 수정 (Robust Version)
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
  v_full_name text;
begin
  -- 메타데이터 추출 (String "true"와 Boolean true 모두 대응)
  v_is_terms_agreed := (new.raw_user_meta_data->>'is_terms_agreed')::text = 'true';
  v_is_privacy_agreed := (new.raw_user_meta_data->>'is_privacy_agreed')::text = 'true';
  v_is_marketing_agreed := (new.raw_user_meta_data->>'is_marketing_agreed')::text = 'true';

  -- 필수 약관 동의 확인
  if v_is_terms_agreed and v_is_privacy_agreed then
    v_full_name := coalesce(new.raw_user_meta_data->>'full_name', new.email);
    
    insert into public.users (
      id, full_name, avatar_url, email, status, 
      is_terms_agreed, is_privacy_agreed, is_marketing_agreed
    )
    values (
      new.id,
      v_full_name,
      new.raw_user_meta_data->>'avatar_url',
      new.email,
      'active',
      true, true, v_is_marketing_agreed
    )
    on conflict (id) do update set
      status = 'active',
      is_terms_agreed = true,
      is_privacy_agreed = true,
      is_marketing_agreed = excluded.is_marketing_agreed;

    -- 워크스페이스 보장
    if not exists (select 1 from workspace_members where user_id = new.id) then
        insert into workspaces (name)
        values (v_full_name || '''s Workspace')
        returning id into v_workspace_id;

        insert into workspace_members (workspace_id, user_id, role)
        values (v_workspace_id, new.id, 'owner');
    end if;
  end if;

  return new;
exception when others then
  -- 오류가 나더라도 Auth 생성이 중단되지 않도록 함
  return new;
end;
$$;

-- 2. 트리거 재생성
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. complete_signup RPC 수정 (Robust Version)
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

  select email, (raw_user_meta_data->>'full_name'), (raw_user_meta_data->>'avatar_url')
  into v_user_email, v_full_name, v_avatar_url
  from auth.users
  where id = v_user_id;

  v_full_name := coalesce(v_full_name, v_user_email);

  insert into public.users (
    id, full_name, avatar_url, email, status, 
    is_terms_agreed, is_privacy_agreed, is_marketing_agreed
  )
  values (
    v_user_id, v_full_name, v_avatar_url, v_user_email, 'active', 
    true, true, marketing_agreed
  )
  on conflict (id) do update set
    status = 'active',
    is_terms_agreed = true,
    is_privacy_agreed = true,
    is_marketing_agreed = marketing_agreed;

  if not exists (select 1 from workspace_members where user_id = v_user_id) then
    insert into workspaces (name)
    values (v_full_name || '''s Workspace')
    returning id into v_workspace_id;

    insert into workspace_members (workspace_id, user_id, role)
    values (v_workspace_id, v_user_id, 'owner');
  end if;

  return json_build_object('status', 'success');
end;
$$;

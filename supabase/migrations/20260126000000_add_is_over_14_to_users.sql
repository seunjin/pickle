-- 20260126000000_add_is_over_14_to_users.sql

-- 1. users 테이블에 컬럼 추가
alter table public.users add column if not exists is_over_14 boolean not null default false;

-- 2. handle_new_user 트리거 함수 수정 (14세 확인 추가)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_is_terms_agreed boolean;
  v_is_privacy_agreed boolean;
  v_is_marketing_agreed boolean;
  v_is_over_14 boolean;
  v_workspace_id uuid;
  v_full_name text;
begin
  v_is_terms_agreed := (new.raw_user_meta_data->>'is_terms_agreed')::text = 'true';
  v_is_privacy_agreed := (new.raw_user_meta_data->>'is_privacy_agreed')::text = 'true';
  v_is_marketing_agreed := (new.raw_user_meta_data->>'is_marketing_agreed')::text = 'true';
  v_is_over_14 := (new.raw_user_meta_data->>'is_over_14')::text = 'true';

  if v_is_terms_agreed and v_is_privacy_agreed and v_is_over_14 then
    v_full_name := coalesce(new.raw_user_meta_data->>'full_name', new.email);
    
    insert into public.users (
      id, full_name, avatar_url, email, status, 
      is_terms_agreed, is_privacy_agreed, is_marketing_agreed, is_over_14
    )
    values (
      new.id, v_full_name, new.raw_user_meta_data->>'avatar_url', new.email, 'active',
      true, true, v_is_marketing_agreed, true
    )
    on conflict (id) do update set
      status = 'active',
      is_terms_agreed = true,
      is_privacy_agreed = true,
      is_marketing_agreed = excluded.is_marketing_agreed,
      is_over_14 = true;

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
  return new;
end;
$$;

-- 3. complete_signup RPC 업데이트
create or replace function public.complete_signup(
  marketing_agreed boolean default false,
  is_over_14 boolean default false
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

  v_full_name := coalesce(v_full_name, v_user_email);

  insert into public.users (
    id, full_name, avatar_url, email, status, 
    is_terms_agreed, is_privacy_agreed, is_marketing_agreed, is_over_14
  )
  values (
    v_user_id, v_full_name, v_avatar_url, v_user_email, 'active', 
    true, true, marketing_agreed, is_over_14
  )
  on conflict (id) do update set
    status = 'active',
    is_terms_agreed = true,
    is_privacy_agreed = true,
    is_marketing_agreed = marketing_agreed,
    is_over_14 = is_over_14;

  if not exists (select 1 from workspace_members where user_id = v_user_id) then
    insert into workspaces (name)
    values (v_full_name || '''s Workspace')
    returning id into v_workspace_id;

    insert into workspace_members (workspace_id, v_user_id, role)
    values (v_workspace_id, v_user_id, 'owner');
  end if;

  return json_build_object('status', 'success');
end;
$$;

-- 20260521000000_open_access_signup.sql
-- Switch Pickle from beta whitelist gating to open signup.

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
  v_status public.user_status;
begin
  v_is_terms_agreed := (new.raw_user_meta_data->>'is_terms_agreed')::text = 'true';
  v_is_privacy_agreed := (new.raw_user_meta_data->>'is_privacy_agreed')::text = 'true';
  v_is_marketing_agreed := (new.raw_user_meta_data->>'is_marketing_agreed')::text = 'true';
  v_is_over_14 := (new.raw_user_meta_data->>'is_over_14')::text = 'true';
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', new.email);

  if v_is_terms_agreed and v_is_privacy_agreed and v_is_over_14 then
    v_status := 'active';
  else
    v_status := 'pending';
  end if;

  insert into public.users (
    id, full_name, avatar_url, email, status,
    is_terms_agreed, is_privacy_agreed, is_marketing_agreed, is_over_14
  )
  values (
    new.id,
    v_full_name,
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    v_status,
    coalesce(v_is_terms_agreed, false),
    coalesce(v_is_privacy_agreed, false),
    coalesce(v_is_marketing_agreed, false),
    coalesce(v_is_over_14, false)
  )
  on conflict (id) do update set
    status = case
      when excluded.status = 'active' then 'active'::public.user_status
      else users.status
    end,
    is_terms_agreed = users.is_terms_agreed or excluded.is_terms_agreed,
    is_privacy_agreed = users.is_privacy_agreed or excluded.is_privacy_agreed,
    is_marketing_agreed = excluded.is_marketing_agreed,
    is_over_14 = users.is_over_14 or excluded.is_over_14;

  if v_status = 'active' and not exists (
    select 1 from public.workspace_members where user_id = new.id
  ) then
    insert into public.workspaces (name)
    values (v_full_name || '''s Workspace')
    returning id into v_workspace_id;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (v_workspace_id, new.id, 'owner');
  end if;

  return new;
exception when others then
  return new;
end;
$$;

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
  if v_user_id is null then
    raise exception '인증이 필요합니다.';
  end if;

  if p_is_over_14 is not true then
    return json_build_object(
      'status', 'error',
      'message', '만 14세 이상 확인이 필요합니다.',
      'detail', 'AGE_CONFIRMATION_REQUIRED',
      'hint', 'Confirm age eligibility before completing signup.'
    );
  end if;

  select email, raw_user_meta_data->>'full_name', raw_user_meta_data->>'avatar_url'
  into v_user_email, v_full_name, v_avatar_url
  from auth.users
  where id = v_user_id;

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
    v_user_id,
    v_full_name,
    v_avatar_url,
    v_user_email,
    'active',
    true,
    true,
    coalesce(p_marketing_agreed, false),
    true
  )
  on conflict (id) do update set
    status = 'active',
    is_terms_agreed = true,
    is_privacy_agreed = true,
    is_marketing_agreed = coalesce(p_marketing_agreed, false),
    is_over_14 = true;

  if not exists (
    select 1 from public.workspace_members where user_id = v_user_id
  ) then
    insert into public.workspaces (name)
    values (v_full_name || '''s Workspace')
    returning id into v_workspace_id;

    insert into public.workspace_members (workspace_id, user_id, role)
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

update public.users as u
set
  is_terms_agreed = u.is_terms_agreed
    or coalesce((au.raw_user_meta_data->>'is_terms_agreed')::text = 'true', false),
  is_privacy_agreed = u.is_privacy_agreed
    or coalesce((au.raw_user_meta_data->>'is_privacy_agreed')::text = 'true', false),
  is_marketing_agreed = u.is_marketing_agreed
    or coalesce((au.raw_user_meta_data->>'is_marketing_agreed')::text = 'true', false),
  is_over_14 = u.is_over_14
    or coalesce((au.raw_user_meta_data->>'is_over_14')::text = 'true', false)
from auth.users as au
where u.id = au.id
  and u.status = 'pending';

do $$
declare
  r record;
  v_workspace_id uuid;
begin
  for r in
    select id, full_name, email
    from public.users
    where status = 'pending'
      and is_terms_agreed = true
      and is_privacy_agreed = true
      and is_over_14 = true
  loop
    update public.users
    set status = 'active'
    where id = r.id;

    if not exists (
      select 1 from public.workspace_members where user_id = r.id
    ) then
      insert into public.workspaces (name)
      values (coalesce(r.full_name, r.email) || '''s Workspace')
      returning id into v_workspace_id;

      insert into public.workspace_members (workspace_id, user_id, role)
      values (v_workspace_id, r.id, 'owner');
    end if;
  end loop;
end $$;

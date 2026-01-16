-- 20260116000002_fix_handle_new_user_authority.sql
-- handle_new_user 트리거 함수에서 'member' 대신 NULL을 사용하도록 수정합니다.
-- profiles_authority_check 제약 조건(super_admin, admin만 허용)과의 충돌을 방지합니다.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_is_terms_agreed boolean;
  v_is_privacy_agreed boolean;
  v_is_marketing_agreed boolean;
  v_status user_status;
  v_workspace_id uuid;
begin
  -- 1. 메타데이터에서 약관 동의 여부 추출
  v_is_terms_agreed := coalesce((new.raw_user_meta_data->>'is_terms_agreed')::boolean, false);
  v_is_privacy_agreed := coalesce((new.raw_user_meta_data->>'is_privacy_agreed')::boolean, false);
  v_is_marketing_agreed := coalesce((new.raw_user_meta_data->>'is_marketing_agreed')::boolean, false);

  -- 2. 필수 약관 동의 시 active, 아니면 pending
  if v_is_terms_agreed and v_is_privacy_agreed then
    v_status := 'active';
  else
    v_status := 'pending';
  end if;

  -- 3. 유저 테이블 삽입 (authority를 NULL로 설정하여 제약 조건 위반 방지)
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
    NULL, -- 'member' 대신 NULL 사용
    v_status,
    v_is_terms_agreed,
    v_is_privacy_agreed,
    v_is_marketing_agreed
  )
  on conflict (id) do nothing;
  
  -- 4. 만약 active 상태로 생성되었다면 기본 워크스페이스도 즉시 생성 (Atomic UX)
  if v_status = 'active' then
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

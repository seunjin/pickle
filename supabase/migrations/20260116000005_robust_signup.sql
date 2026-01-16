-- 20260116000005_robust_signup.sql

-- 1. handle_new_user 트리거를 더욱 유연하게 수정 (JSON 타입 유연성 확보)
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
  -- 메타데이터 추출 (JSON 타입이 boolean일 수도, string "true"일 수도 있음)
  -- ->> 는 텍스트로 가져오고, -> 는 JSONB로 가져옴.
  -- coalesce를 사용하여 다양한 케이스 대응
  v_is_terms_agreed := (
    (new.raw_user_meta_data->>'is_terms_agreed')::text = 'true' or 
    (new.raw_user_meta_data->'is_terms_agreed')::text = 'true'
  );
  v_is_privacy_agreed := (
    (new.raw_user_meta_data->>'is_privacy_agreed')::text = 'true' or 
    (new.raw_user_meta_data->'is_privacy_agreed')::text = 'true'
  );
  v_is_marketing_agreed := (
    (new.raw_user_meta_data->>'is_marketing_agreed')::text = 'true' or 
    (new.raw_user_meta_data->'is_marketing_agreed')::text = 'true'
  );

  -- [핵심] 필수 약관 동의 확인
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
        values (v_full_name || '''s Workspace')
        returning id into v_workspace_id;

        insert into workspace_members (workspace_id, user_id, role)
        values (v_workspace_id, new.id, 'owner');
    end if;
  end if;

  return new;
exception when others then
  -- 트리거 실패가 전체 회원가입을 막지 않도록 예외 처리 (로그는 Supabase 대시보드에서 확인 가능)
  return new;
end;
$$;

-- 2. complete_signup RPC 개선 (중복 생성 방지 및 속도 향상)
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

  -- 최신 유저 정보 획득
  select email, (raw_user_meta_data->>'full_name'), (raw_user_meta_data->>'avatar_url')
  into v_user_email, v_full_name, v_avatar_url
  from auth.users
  where id = v_user_id;

  v_full_name := coalesce(v_full_name, v_user_email);

  -- 1. 유저 정보 삽입/업데이트
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

  -- 2. 워크스페이스 보장
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

-- 3. 트리거 재생성 (최신 handle_new_user 함수를 바라보도록 보장)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 20260212000000_beta_application_system.sql

-- 1. 베타 신청 상태 Enum 생성
do $$ begin
    create type public.beta_application_status as enum ('pending', 'approved', 'rejected');
exception
    when duplicate_object then null;
end $$;

-- 2. 허용된 이메일 목록 테이블 (화이트리스트)
create table if not exists public.allowed_emails (
    email text primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 베타 신청 내역 테이블
create table if not exists public.beta_applications (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    is_confirmed boolean default false not null,
    status public.beta_application_status default 'pending' not null,
    message text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. 업데이트 시간 자동 갱신 트리거
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_beta_applications_updated_at
    before update on public.beta_applications
    for each row execute procedure update_updated_at_column();

-- 5. handle_new_user 트리거 수정 (화이트리스트 체크 로직 추가)
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
  v_is_allowed boolean;
  v_status public.user_status;
begin
  -- 1. 화이트리스트 확인
  select exists(select 1 from public.allowed_emails where email = new.email) into v_is_allowed;

  -- 2. 메타데이터 추출
  v_is_terms_agreed := (new.raw_user_meta_data->>'is_terms_agreed')::text = 'true';
  v_is_privacy_agreed := (new.raw_user_meta_data->>'is_privacy_agreed')::text = 'true';
  v_is_marketing_agreed := (new.raw_user_meta_data->>'is_marketing_agreed')::text = 'true';

  -- 3. 상태 결정 (허용되었고 약관 동의했으면 active, 아니면 pending)
  if v_is_allowed and v_is_terms_agreed and v_is_privacy_agreed then
    v_status := 'active';
  else
    v_status := 'pending';
  end if;

  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', new.email);
  
  -- 4. 유저 프로필 생성/업데이트
  insert into public.users (
    id, full_name, avatar_url, email, status, 
    is_terms_agreed, is_privacy_agreed, is_marketing_agreed
  )
  values (
    new.id,
    v_full_name,
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    v_status,
    coalesce(v_is_terms_agreed, false), 
    coalesce(v_is_privacy_agreed, false), 
    coalesce(v_is_marketing_agreed, false)
  )
  on conflict (id) do update set
    status = v_status,
    is_terms_agreed = coalesce(v_is_terms_agreed, users.is_terms_agreed),
    is_privacy_agreed = coalesce(v_is_privacy_agreed, users.is_privacy_agreed),
    is_marketing_agreed = coalesce(v_is_marketing_agreed, users.is_marketing_agreed);

  -- 5. active 상태일 때만 기본 워크스페이스 생성
  if v_status = 'active' and not exists (select 1 from workspace_members where user_id = new.id) then
      insert into workspaces (name)
      values (v_full_name || '''s Workspace')
      returning id into v_workspace_id;

      insert into workspace_members (workspace_id, user_id, role)
      values (v_workspace_id, new.id, 'owner');
  end if;

  return new;
exception when others then
  return new;
end;
$$;

-- 6. RLS 정책 설정
alter table public.allowed_emails enable row level security;
alter table public.beta_applications enable row level security;

-- allowed_emails: 어드민만 조회 가능
create policy "Admins can view allowed emails"
    on public.allowed_emails
    for select
    to authenticated
    using ( (select authority from public.users where id = auth.uid()) in ('admin', 'super_admin') );

-- beta_applications: 
-- 1. 누구나 신청 가능 (Insert)
create policy "Anyone can submit beta application"
    on public.beta_applications
    for insert
    to anon, authenticated
    with check (true);

-- 2. 어드민은 모두 조회 및 수정 가능
create policy "Admins can manage beta applications"
    on public.beta_applications
    for all
    to authenticated
    using ( (select authority from public.users where id = auth.uid()) in ('admin', 'super_admin') );

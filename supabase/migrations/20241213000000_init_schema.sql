-- Create a table for public profiles (if not exists)
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  avatar_url text,
  email text,
  -- authority: 'admin', 'member' (contract: PlatformAuthority)
  authority text check (authority in ('super_admin', 'admin', 'member')),
  -- state: 'guest', 'member', 'suspended', 'deleted' (contract: UserState)
  state text default 'member'::text check (state in ('guest', 'member', 'suspended', 'deleted')),

  constraint username_length check (char_length(full_name) >= 2)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Policy creation helpers (to avoid error if policy exists)
do $$
begin
  if not exists (select from pg_policies where policyname = 'Public profiles are viewable by everyone.' and tablename = 'profiles') then
    create policy "Public profiles are viewable by everyone." on profiles for select using (true);
  end if;

  if not exists (select from pg_policies where policyname = 'Users can insert their own profile.' and tablename = 'profiles') then
    create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
  end if;

  if not exists (select from pg_policies where policyname = 'Users can update their own profile.' and tablename = 'profiles') then
    create policy "Users can update their own profile." on profiles for update using (auth.uid() = id);
  end if;
end $$;

-- Trigger for auto creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, authority, state)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    'member',
    'member'
  )
  on conflict (id) do nothing; -- Handle potential conflict if user exists but profile missing
  return new;
end;
$$ language plpgsql security definer;

-- Trigger firing on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Create table for Notes (if not exists)
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text not null, -- 'text', 'image', 'capture', 'bookmark'
  data jsonb not null default '{}'::jsonb
);

alter table notes enable row level security;

do $$
begin
  if not exists (select from pg_policies where policyname = 'Users can crud their own notes.' and tablename = 'notes') then
    create policy "Users can crud their own notes." on notes for all using (auth.uid() = user_id);
  end if;
end $$;

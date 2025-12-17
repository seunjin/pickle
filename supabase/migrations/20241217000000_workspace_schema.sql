-- 1. Clean Slate (Delete old data to enable strict migration)
TRUNCATE TABLE notes;

-- 2. Create 'workspaces' table
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Create 'workspace_members' table
create type workspace_role as enum ('owner', 'member');

create table workspace_members (
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role workspace_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- 4. Alter 'notes' table
alter table notes 
add column workspace_id uuid references workspaces(id) on delete cascade not null;

-- 5. Enable RLS
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
-- notes table already has RLS enabled (from previous migrations)

-- 6. RLS Policies

-- Workspaces: Members can view
create policy "Members can view workspaces"
on workspaces for select
using (
  auth.uid() in (
    select user_id from workspace_members where workspace_id = id
  )
);

-- Workspaces: Only owners/system can insert/update/delete?
-- For now, we assume system-driven creation via triggers. Allow members to update name?
create policy "Members can update workspace details"
on workspaces for update
using (
  auth.uid() in (
    select user_id from workspace_members where workspace_id = id
  )
);

-- Workspace Members: Members can view fellow members
create policy "Members can view other members"
on workspace_members for select
using (
  auth.uid() in (
    select user_id from workspace_members where workspace_id = workspace_members.workspace_id
  )
);

-- Notes: Access controlled by Workspace Membership
-- Drop old user_id policies if they exist (assuming strictly workspace-based now)
drop policy if exists "Users can view their own notes" on notes;
drop policy if exists "Users can insert their own notes" on notes;
drop policy if exists "Users can update their own notes" on notes;
drop policy if exists "Users can delete their own notes" on notes;
drop policy if exists "Enable read access for all users" on notes; -- if any
drop policy if exists "Enable insert for authenticated users only" on notes; -- if any

create policy "Workspace members can view notes"
on notes for select
using (
  workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

create policy "Workspace members can insert notes"
on notes for insert
with check (
  workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

create policy "Workspace members can update notes"
on notes for update
using (
  workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

create policy "Workspace members can delete notes"
on notes for delete
using (
  workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

-- 7. Automation: Default Workspace on Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_workspace_id uuid;
begin
  -- 1. Create Default Workspace
  insert into workspaces (name)
  values (COALESCE(new.raw_user_meta_data->>'full_name', 'My Workspace'))
  returning id into new_workspace_id;

  -- 2. Add User as Owner
  insert into workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  return new;
end;
$$;

-- Trigger definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

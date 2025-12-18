-- 1. Rename 'profiles' to 'users' to reflect app-level user entity
ALTER TABLE profiles RENAME TO users;

-- 2. Add Status & Agreement Columns
create type user_status as enum ('pending', 'active', 'suspended', 'deleted');
-- 'state' column existed in profiles (guest, member...), let's migrate or drop it?
-- The previous schema had 'state' enum ('guest', 'member', 'suspended', 'deleted').
-- We will replace it with 'status' for clarity and 'pending' state.

-- Modify 'status' column
-- First, drop default and check constraint on 'state' if possible or just add new column
ALTER TABLE users ADD COLUMN status user_status NOT NULL DEFAULT 'pending';
ALTER TABLE users ADD COLUMN is_terms_agreed boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN is_privacy_agreed boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN is_marketing_agreed boolean NOT NULL DEFAULT false;

-- Drop old 'state' column if we want clean slate, 
-- but to be safe with existing data (if any), let's migrate 'member' -> 'active'
UPDATE users SET status = 'active' WHERE state = 'member';
-- Now drop old state/authority columns if they are redundant? 
-- Authority ('super_admin') is still useful. State is replaced by Status.
ALTER TABLE users DROP COLUMN state;

-- 3. Update Trigger: handle_new_user (Auth -> Pending User Only)
-- This function is called on auth.users INSERT
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, full_name, avatar_url, email, authority, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    'member', -- default authority
    'pending' -- default status (Must agree to terms)
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;

-- 4. Create RPC: complete_signup (Pending -> Active + Workspace)
-- Called by Client after Terms Agreement
create or replace function public.complete_signup(
  marketing_agreed boolean default false
)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid;
  v_workspace_id uuid;
begin
  v_user_id := auth.uid();

  -- 1. Validate User Status
  if not exists (select 1 from public.users where id = v_user_id and status = 'pending') then
    -- If already active, maybe just return success? Or error?
    if exists (select 1 from public.users where id = v_user_id and status = 'active') then
      return json_build_object('status', 'already_active');
    end if;
     raise exception 'Invalid user status for signup completion';
  end if;

  -- 2. Update User (Active + Agreements)
  update public.users
  set 
    status = 'active',
    is_terms_agreed = true,
    is_privacy_agreed = true,
    is_marketing_agreed = marketing_agreed
  where id = v_user_id;

  -- 3. Create Default Workspace (Moved from Trigger)
  insert into workspaces (name)
  values (
    COALESCE(
      (select full_name from public.users where id = v_user_id),
      'My Workspace'
    )
  )
  returning id into v_workspace_id;

  -- 4. Add Member (Owner)
  insert into workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, v_user_id, 'owner');

  return json_build_object(
    'status', 'success',
    'workspace_id', v_workspace_id
  );
end;
$$;

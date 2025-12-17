-- 1. Create 'assets' table
create table assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  type text not null, -- image / capture
  full_path text not null, -- storage path
  thumb_path text, -- optional thumbnail path
  full_size_bytes bigint not null,
  thumb_size_bytes bigint,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

-- 2. Alter 'notes' table to link to assets
-- asset_id is nullable because text-only notes don't have assets
alter table notes 
add column asset_id uuid references assets(id) on delete set null;

-- 3. Enable RLS
alter table assets enable row level security;

-- 4. RLS Policies for Assets
-- Assets access is strictly tied to Workspace Membership, just like Notes.

create policy "Workspace members can view assets"
on assets for select
using (
  workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

create policy "Workspace members can insert assets"
on assets for insert
with check (
  workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

create policy "Workspace members can update assets"
on assets for update
using (
  workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

create policy "Workspace members can delete assets"
on assets for delete
using (
  workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

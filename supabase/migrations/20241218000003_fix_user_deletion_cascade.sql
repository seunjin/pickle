-- Fix Data Cleanup on User Deletion
-- 1. Update workspace_members Foreign Key to reference public.users instead of auth.users
-- This ensures that when a row in public.users is deleted, the membership is also deleted.

ALTER TABLE workspace_members
DROP CONSTRAINT workspace_members_user_id_fkey; -- Drop old FK to auth.users

ALTER TABLE workspace_members
ADD CONSTRAINT workspace_members_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE; -- Now deletion cascades from public.users

-- 2. Add Trigger to Delete Orphan Workspaces
-- When a member is removed (or user deleted), if the workspace has no more members, delete the workspace.

create or replace function public.handle_orphan_workspace()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Check if there are any members left in the workspace
  if not exists (select 1 from workspace_members where workspace_id = old.workspace_id) then
    -- If no members, delete the workspace
    delete from workspaces where id = old.workspace_id;
  end if;
  return old;
end;
$$;

create trigger on_workspace_member_deleted
  after delete on workspace_members
  for each row
  execute procedure public.handle_orphan_workspace();

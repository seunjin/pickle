-- Fix recursive RLS on workspace_members
-- The policy "Members can view other members" caused infinite recursion.
-- We replace it with a simpler policy for now: "Users can view their own membership".

drop policy if exists "Members can view other members" on workspace_members;

create policy "Users can view own membership"
on workspace_members for select
using (
  user_id = auth.uid()
);

-- Note: To allow viewing OTHER members, we will need a non-recursive approach later (e.g. security definer view/function).
-- For now, this is sufficient for the Sign Up / Dashboard flow (loading "My Workspaces").

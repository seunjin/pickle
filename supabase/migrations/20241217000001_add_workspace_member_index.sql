-- Add index for efficient User -> Workspaces lookup
-- Current PK is (workspace_id, user_id), which is good for looking up members of a workspace.
-- But it DOES NOT help with looking up workspaces for a user (prefix mismatch).
-- Therefore, we need a separate index starting with user_id.

create index workspace_members_user_id_idx on workspace_members (user_id);

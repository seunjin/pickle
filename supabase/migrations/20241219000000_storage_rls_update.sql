-- Drop existing policies that enforce User ID as root folder
drop policy "Authenticated users can upload bitmaps" on storage.objects;
drop policy "Users can view their own bitmaps" on storage.objects;
drop policy "Users can update their own bitmaps" on storage.objects;
drop policy "Users can delete their own bitmaps" on storage.objects;

-- Create new policies based on Workspace Membership
-- Folder structure: bitmaps/{workspace_id}/{user_id}/{filename}

-- Helper logic: (storage.foldername(name))[1] is the workspace_id (UUID string)

create policy "Workspace members can upload bitmaps"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'bitmaps' AND
  exists (
    select 1 from public.workspace_members
    where user_id = auth.uid()
    and workspace_id = (storage.foldername(name))[1]::uuid
  )
);

create policy "Workspace members can view bitmaps"
on storage.objects for select
to authenticated
using (
  bucket_id = 'bitmaps' AND
  exists (
    select 1 from public.workspace_members
    where user_id = auth.uid()
    and workspace_id = (storage.foldername(name))[1]::uuid
  )
);

create policy "Workspace members can update bitmaps"
on storage.objects for update
to authenticated
using (
  bucket_id = 'bitmaps' AND
  exists (
    select 1 from public.workspace_members
    where user_id = auth.uid()
    and workspace_id = (storage.foldername(name))[1]::uuid
  )
);

create policy "Workspace members can delete bitmaps"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'bitmaps' AND
  exists (
    select 1 from public.workspace_members
    where user_id = auth.uid()
    and workspace_id = (storage.foldername(name))[1]::uuid
  )
);

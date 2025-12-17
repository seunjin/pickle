-- Create a private bucket named 'bitmaps' for storing note images/captures/assets
-- We use 'bitmaps' to distinguish from generic 'images' or 'uploads'
insert into storage.buckets (id, name, public)
values ('bitmaps', 'bitmaps', false)
on conflict (id) do nothing;

-- Enable RLS (Already enabled by default in Supabase Storage, skipping to avoid permission errors)
-- alter table storage.objects enable row level security;

-- Policy: Allow authenticated users to upload files to their own folder
create policy "Authenticated users can upload bitmaps"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'bitmaps' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to view their own files
create policy "Users can view their own bitmaps"
on storage.objects for select
to authenticated
using (
  bucket_id = 'bitmaps' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to update their own files
create policy "Users can update their own bitmaps"
on storage.objects for update
to authenticated
using (
  bucket_id = 'bitmaps' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own files
create policy "Users can delete their own bitmaps"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'bitmaps' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

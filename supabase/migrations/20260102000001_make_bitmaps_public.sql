-- Convert bitmaps bucket from private to public for CDN caching support
-- This enables permanent URLs that can be cached by browsers and CDNs
-- Security is maintained through UUID-based paths (unpredictable file paths)

-- Step 1: Update bucket to public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'bitmaps';

-- Step 2: Drop existing Workspace-based SELECT policy (will be replaced with public access)
DROP POLICY IF EXISTS "Workspace members can view bitmaps" ON storage.objects;

-- Step 3: Create new public SELECT policy (anyone can view)
-- Security note: Files are still protected by unpredictable UUID paths
CREATE POLICY "Public read access for bitmaps"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bitmaps');

-- INSERT, UPDATE, DELETE policies remain unchanged (Workspace members only)
-- These policies are already set up in 20241219000000_storage_rls_update.sql

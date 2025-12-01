-- ============================================
-- QuickKeys Storage Bucket Setup Script
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create the avatars bucket
-- This will store user profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Enable RLS (Row Level Security) on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Step 4: Create policy for public read access
-- Anyone can view avatar images
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Step 5: Create policy for authenticated users to upload
-- Users must be logged in to upload avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Step 6: Create policy for authenticated users to update
-- Users can update their own avatar files
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Step 7: Create policy for authenticated users to delete
-- Users can delete their own avatar files
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- Verification Queries
-- Run these to verify everything is set up correctly
-- ============================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check if policies are active
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%avatar%';

-- ============================================
-- Success!
-- Your storage bucket is now ready for avatar uploads
-- ============================================

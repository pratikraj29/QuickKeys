-- ============================================
-- QuickKeys COMPLETE Database Setup
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- ========================================
-- STEP 1: CREATE PROFILES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    best_wpm INTEGER DEFAULT 0,
    average_accuracy NUMERIC(5,2) DEFAULT 0,
    total_tests INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    wpm_history JSONB DEFAULT '[]'::jsonb,
    acc_history JSONB DEFAULT '[]'::jsonb,
    time_history JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 2: CREATE UPDATED_AT TRIGGER
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STEP 3: ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Create RLS policies
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
    ON public.profiles FOR DELETE
    USING (auth.uid() = id);

-- ========================================
-- STEP 4: CREATE AVATARS STORAGE BUCKET
-- ========================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- ========================================
-- STEP 5: STORAGE RLS POLICIES
-- Note: Storage policies should be set in the Supabase Dashboard
-- Go to Storage > avatars bucket > Policies tab
-- Or use the dashboard API (policies are auto-created with public bucket)
-- ========================================

-- Storage policies are automatically handled by Supabase
-- when you create a PUBLIC bucket through the dashboard or API
-- The bucket creation above (STEP 4) with public=true handles this

-- ========================================
-- STEP 6: AUTO-CREATE PROFILE ON SIGNUP
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- STEP 7: CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_best_wpm ON public.profiles(best_wpm DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_total_tests ON public.profiles(total_tests DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- ========================================
-- STEP 8: CREATE PROFILES FOR EXISTING USERS (if any)
-- ========================================

INSERT INTO public.profiles (id, email, username)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if profiles table exists
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Check if avatars bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check RLS policies on profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'profiles';

-- Check storage policies
-- Note: Storage policies are managed through Supabase Dashboard
-- Go to Storage > avatars bucket > Policies to view/edit

-- Count existing profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- ============================================
-- SUCCESS! ✅
-- Your database is now fully configured!
-- 
-- Next steps:
-- 1. Refresh your QuickKeys app
-- 2. Login with your account
-- 3. Profile will load automatically
-- 4. Upload avatar should work now
-- ============================================

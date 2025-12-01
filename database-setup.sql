-- QuickKeys Profile System - Supabase Database Setup

-- ========================================
-- 1. CREATE PROFILES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT,
    bio TEXT,
    avatar_url TEXT,
    best_wpm INTEGER DEFAULT 0,
    average_accuracy FLOAT DEFAULT 0,
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
-- 2. CREATE UPDATED_AT TRIGGER
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 3. CREATE STORAGE BUCKET FOR AVATARS
-- ========================================

-- Run this in Supabase Dashboard > Storage:
-- Create bucket named "avatars" with Public access

-- ========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view any profile (public profiles)
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
    ON profiles FOR DELETE
    USING (auth.uid() = id);

-- ========================================
-- 5. STORAGE POLICIES FOR AVATARS
-- ========================================

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatars"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars');

-- Allow public access to view avatars
CREATE POLICY "Avatars are publicly accessible"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ========================================
-- 6. CREATE PROFILE ON SIGNUP TRIGGER
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 7. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_best_wpm ON profiles(best_wpm DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_total_tests ON profiles(total_tests DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- ========================================
-- SETUP COMPLETE!
-- ========================================
-- 
-- Next steps:
-- 1. Replace SUPABASE_URL and SUPABASE_ANON_KEY in supabase.js
-- 2. Create "avatars" storage bucket in Supabase Dashboard
-- 3. Make avatars bucket PUBLIC
-- 4. Test signup/login flow
-- 5. Profile will be auto-created on user signup
--

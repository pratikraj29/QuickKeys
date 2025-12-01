-- QuickKeys Profile System - Supabase Database Schema Update
-- Run this SQL in your Supabase SQL Editor to add new columns to profiles table

-- Add new columns to existing profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS total_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wpm_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS acc_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS time_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;

-- Add comments to document columns
COMMENT ON COLUMN profiles.username IS 'User display name';
COMMENT ON COLUMN profiles.bio IS 'User biography (max 200 chars)';
COMMENT ON COLUMN profiles.total_time IS 'Total seconds spent typing';
COMMENT ON COLUMN profiles.wpm_history IS 'Array of WPM values from each test';
COMMENT ON COLUMN profiles.acc_history IS 'Array of accuracy values from each test';
COMMENT ON COLUMN profiles.time_history IS 'Array of ISO timestamps for each test';
COMMENT ON COLUMN profiles.achievements IS 'Array of unlocked achievement IDs';

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Update RLS policies to allow users to update new fields
-- (Policies should already exist from initial setup, but we ensure they cover new columns)

-- Verify existing policies
DO $$
BEGIN
    -- Check if policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        -- Create update policy if it doesn't exist
        CREATE POLICY "Users can update own profile"
            ON profiles FOR UPDATE
            USING (auth.uid() = id);
    END IF;
END $$;

-- Grant necessary permissions (should already be set, but confirming)
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO anon;

-- Optional: Create a function to safely append to history arrays
CREATE OR REPLACE FUNCTION append_game_stats(
    p_user_id UUID,
    p_wpm INTEGER,
    p_accuracy NUMERIC,
    p_duration INTEGER
)
RETURNS profiles AS $$
DECLARE
    v_profile profiles;
BEGIN
    -- Update profile with new stats
    UPDATE profiles
    SET 
        wpm_history = (
            SELECT jsonb_agg(elem)
            FROM (
                SELECT elem FROM jsonb_array_elements(COALESCE(wpm_history, '[]'::jsonb)) elem
                UNION ALL
                SELECT to_jsonb(p_wpm)
                ORDER BY 1
                LIMIT 200
            ) sub
        ),
        acc_history = (
            SELECT jsonb_agg(elem)
            FROM (
                SELECT elem FROM jsonb_array_elements(COALESCE(acc_history, '[]'::jsonb)) elem
                UNION ALL
                SELECT to_jsonb(p_accuracy)
                ORDER BY 1
                LIMIT 200
            ) sub
        ),
        time_history = (
            SELECT jsonb_agg(elem)
            FROM (
                SELECT elem FROM jsonb_array_elements(COALESCE(time_history, '[]'::jsonb)) elem
                UNION ALL
                SELECT to_jsonb(NOW())
                ORDER BY 1
                LIMIT 200
            ) sub
        ),
        best_wpm = GREATEST(COALESCE(best_wpm, 0), p_wpm),
        total_tests = COALESCE(total_tests, 0) + 1,
        average_accuracy = (
            (COALESCE(average_accuracy, 0) * COALESCE(total_tests, 0) + p_accuracy) 
            / (COALESCE(total_tests, 0) + 1)
        ),
        total_time = COALESCE(total_time, 0) + p_duration
    WHERE id = p_user_id
    RETURNING * INTO v_profile;
    
    RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION append_game_stats TO authenticated;
GRANT EXECUTE ON FUNCTION append_game_stats TO anon;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'QuickKeys profile schema updated successfully!';
    RAISE NOTICE 'New columns added: username, bio, total_time, wpm_history, acc_history, time_history, achievements';
    RAISE NOTICE 'Helper function created: append_game_stats()';
END $$;

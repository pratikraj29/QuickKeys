// QuickKeys - Supabase Client Configuration
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase project credentials
const SUPABASE_URL = 'https://gkhwrfcbxzsiwwmyvkfe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdraHdyZmNieHpzaXd3bXl2a2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDYzNzEsImV4cCI6MjA3OTk4MjM3MX0.4vET7HGZ5hYCuQgunW-wTqI8aWT5tDNOt4rEYkljdsU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === AUTH HELPERS ===
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error getting user:', error);
        return null;
    }
    return user;
}

export async function isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
}

// === PROFILE HELPERS ===
export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

export async function updateProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
    return data;
}

// === GAME STATS HELPERS ===
export async function saveGameStats(userId, wpm, accuracy, durationSeconds) {
    // Fetch current profile
    const profile = await getProfile(userId);
    if (!profile) throw new Error('Profile not found');

    // Prepare updated histories (keep last 200 entries)
    const wpmHistory = [...(profile.wpm_history || []), wpm].slice(-200);
    const accHistory = [...(profile.acc_history || []), accuracy].slice(-200);
    const timeHistory = [...(profile.time_history || []), new Date().toISOString()].slice(-200);

    // Calculate new stats
    const newTotalTests = (profile.total_tests || 0) + 1;
    const newBestWpm = Math.max(profile.best_wpm || 0, wpm);
    
    // Calculate weighted average accuracy
    const currentTotal = (profile.average_accuracy || 0) * (profile.total_tests || 0);
    const newAverageAccuracy = parseFloat(((currentTotal + accuracy) / newTotalTests).toFixed(2));
    
    const newTotalTime = (profile.total_time || 0) + durationSeconds;

    // Update profile with new stats
    return await updateProfile(userId, {
        wpm_history: wpmHistory,
        acc_history: accHistory,
        time_history: timeHistory,
        best_wpm: newBestWpm,
        average_accuracy: newAverageAccuracy,
        total_tests: newTotalTests,
        total_time: newTotalTime
    });
}

// === STORAGE HELPERS ===
export async function uploadAvatar(userId, file) {
    try {
        console.log('📤 Starting avatar upload...');
        console.log('   File:', file.name);
        console.log('   Size:', (file.size / 1024).toFixed(2) + 'KB');
        console.log('   Type:', file.type);
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        
        console.log('📁 Target filename:', fileName);
        console.log('🪣 Target bucket: avatars');

        // Upload file to storage
        console.log('⏳ Uploading to Supabase Storage...');
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('❌ Upload error:', uploadError);
            console.error('❌ Error code:', uploadError.statusCode);
            console.error('❌ Error message:', uploadError.message);
            console.error('❌ Error details:', JSON.stringify(uploadError, null, 2));
            
            // Provide specific error messages
            if (uploadError.message.includes('not found') || uploadError.statusCode === '404') {
                throw new Error('Storage bucket "avatars" does not exist. Run COMPLETE-DATABASE-SETUP.sql in Supabase SQL Editor.');
            } else if (uploadError.message.includes('policy')) {
                throw new Error('No permission to upload. Make sure you are logged in and RLS policies are set.');
            }
            
            throw new Error(uploadError.message || 'Failed to upload file');
        }

        console.log('✅ Upload successful!');
        console.log('📦 Upload data:', uploadData);

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        console.log('🔗 Public URL generated:', urlData.publicUrl);
        return urlData.publicUrl;
    } catch (error) {
        console.error('❌ Avatar upload failed:', error.message);
        throw error;
    }
}

export async function deleteAvatar(filePath) {
    const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);
    
    if (error) throw error;
}

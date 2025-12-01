// QuickKeys - Authentication Logic
import { supabase } from './supabase.js';

// Login Function
export async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        console.log('Login successful:', data.user.email);
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Login error:', error.message);
        return { success: false, error: error.message };
    }
}

// Register Function
export async function register(email, password) {
    try {
        // 1. Create auth user with email confirmation disabled
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: window.location.origin + '/index.html'
            }
        });

        if (authError) throw authError;

        // 2. Create profile in database
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                email: email,
                best_wpm: 0,
                average_accuracy: 0,
                total_tests: 0
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Note: User is created in auth, but profile failed
            // You might want to handle this case
        }

        console.log('Registration successful:', email);
        return { success: true, user: authData.user };
    } catch (error) {
        console.error('Registration error:', error.message);
        return { success: false, error: error.message };
    }
}

// Logout Function
export async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        console.log('Logout successful');
        window.location.href = 'login.html';
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error.message);
        return { success: false, error: error.message };
    }
}

// Check Authentication Status
export async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
}

// Get Current User Profile
export async function getUserProfile() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        return null;
    }
}

// Save Game Statistics
export async function saveStats(wpm, accuracy) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('No user logged in');
            return { success: false, error: 'Not authenticated' };
        }

        // Get current profile data
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (fetchError) throw fetchError;

        // Calculate new stats
        const newBest = Math.max(profile.best_wpm || 0, wpm);
        const newTests = (profile.total_tests || 0) + 1;
        const currentTotal = (profile.average_accuracy || 0) * (profile.total_tests || 0);
        const newAccuracy = (currentTotal + accuracy) / newTests;

        // Update profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                best_wpm: newBest,
                total_tests: newTests,
                average_accuracy: parseFloat(newAccuracy.toFixed(2))
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        console.log('Stats saved successfully:', { wpm, accuracy, newBest, newTests });
        return { success: true };
    } catch (error) {
        console.error('Error saving stats:', error.message);
        return { success: false, error: error.message };
    }
}

// Password Strength Checker
export function checkPasswordStrength(password) {
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
        .filter(Boolean).length;
    
    if (strength >= 3) return 'strong';
    return 'medium';
}

// Email Validation
export function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

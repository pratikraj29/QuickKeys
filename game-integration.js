// ========================================
// ADD THIS TO YOUR game.js FILE
// ========================================
// 
// This function should be called after a typing test completes
// to save the stats to the user's Supabase profile.
//
// Integration example at the end of your finishGame() function:
// await saveStatsToSupabase(wpm, accuracy, durationSeconds);
//

async function saveStatsToSupabase(wpm, accuracy, durationSeconds) {
    try {
        // Import Supabase functions
        const { getCurrentUser, saveGameStats } = await import('../supabase.js');
        
        // Get current user
        const user = await getCurrentUser();
        if (!user) {
            console.log('User not logged in, skipping stats save');
            return;
        }

        // Save game stats
        console.log('Saving stats to Supabase:', { wpm, accuracy, durationSeconds });
        await saveGameStats(user.id, Math.round(wpm), accuracy, durationSeconds);
        console.log('Stats saved successfully to profile!');

    } catch (error) {
        console.error('Error saving stats to Supabase:', error);
        // Don't throw - allow game to continue even if save fails
    }
}

// ========================================
// EXAMPLE INTEGRATION IN YOUR EXISTING GAME CODE:
// ========================================

/*
class TypingGame {
    async finishGame() {
        // Your existing finish game logic
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        
        const wpm = this.calculateWPM();
        const accuracy = this.calculateAccuracy();
        const duration = this.elapsedTime;
        
        // Show results
        this.showResults(wpm, accuracy);
        
        // 🔥 ADD THIS: Save to Supabase
        await saveStatsToSupabase(wpm, accuracy, duration);
    }
}
*/

// ========================================
// ALTERNATIVE: Add as method to your game class
// ========================================

/*
// Add this method to your game class:
async saveStats() {
    if (!this.results) return;
    
    const wpm = this.results.wpm || 0;
    const accuracy = this.results.accuracy || 0;
    const duration = this.results.timeElapsed || 0;
    
    await saveStatsToSupabase(wpm, accuracy, duration);
}

// Then call it after showing results:
this.showResults();
await this.saveStats();
*/

// ========================================
// FULL STANDALONE VERSION (Copy-Paste Ready)
// ========================================

export async function saveGameStatsToProfile(wpm, accuracy, durationSeconds) {
    try {
        // Dynamic import to avoid errors if supabase.js doesn't exist
        const { getCurrentUser, saveGameStats } = await import('../supabase.js');
        
        const user = await getCurrentUser();
        if (!user) {
            console.log('👤 Not logged in - stats not saved');
            return false;
        }

        // Round WPM to nearest integer
        const roundedWpm = Math.round(wpm);
        
        // Ensure accuracy is between 0-100
        const clampedAccuracy = Math.max(0, Math.min(100, accuracy));
        
        // Save to Supabase
        await saveGameStats(user.id, roundedWpm, clampedAccuracy, durationSeconds);
        
        console.log('✅ Stats saved to profile:', {
            wpm: roundedWpm,
            accuracy: clampedAccuracy.toFixed(1) + '%',
            duration: durationSeconds + 's'
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error saving stats:', error);
        return false;
    }
}

// ========================================
// USAGE EXAMPLES:
// ========================================

// Example 1: Simple usage
// await saveGameStatsToProfile(75, 94.5, 60);

// Example 2: With result object
// await saveGameStatsToProfile(results.wpm, results.accuracy, results.time);

// Example 3: In game finish handler
/*
async function handleGameFinish(results) {
    showResultsModal(results);
    await saveGameStatsToProfile(results.wpm, results.accuracy, results.duration);
}
*/

// ========================================
// IMPORTANT NOTES:
// ========================================
// 
// 1. This function is ASYNC - use await when calling it
// 2. It will NOT throw errors - safe to use anywhere
// 3. Works silently if user is not logged in
// 4. Automatically updates:
//    - wpm_history (chart data)
//    - acc_history (chart data)
//    - time_history (timestamps)
//    - best_wpm (personal record)
//    - average_accuracy (weighted average)
//    - total_tests (counter)
//    - total_time (cumulative seconds)
// 5. Profile page updates in real-time
//

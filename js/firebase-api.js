// Firebase Client-Side Configuration and API
class FirebaseCustomModeAPI {
    constructor() {
        this.baseURL = '/api/custom-mode';
        this.currentUser = null;
        this.init();
    }

    init() {
        // Initialize user session (in a real app, this would come from Firebase Auth)
        this.currentUser = this.getCurrentUser();
    }

    // Get current user (simulate Firebase Auth for now)
    getCurrentUser() {
        let userId = localStorage.getItem('quickkeys-user-id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('quickkeys-user-id', userId);
        }
        return { uid: userId, email: `user@quickkeys.com` };
    }

    // Save custom challenge to Firebase
    async saveCustomChallenge(challengeData) {
        try {
            const response = await fetch(`${this.baseURL}/save-challenge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUser.uid,
                    challengeData: {
                        name: challengeData.name,
                        text: challengeData.text,
                        timer: challengeData.timer,
                        difficulty: challengeData.difficulty
                    }
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }

            return result;
        } catch (error) {
            console.error('Error saving custom challenge:', error);
            throw error;
        }
    }

    // Get user's custom challenges
    async getUserChallenges(limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/challenges/${this.currentUser.uid}?limit=${limit}`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }

            return result.challenges;
        } catch (error) {
            console.error('Error fetching custom challenges:', error);
            throw error;
        }
    }

    // Get specific custom challenge
    async getCustomChallenge(challengeId) {
        try {
            const response = await fetch(`${this.baseURL}/challenge/${challengeId}`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }

            return result.challenge;
        } catch (error) {
            console.error('Error fetching custom challenge:', error);
            throw error;
        }
    }

    // Get user's current custom challenge
    async getCurrentCustomChallenge() {
        try {
            const response = await fetch(`${this.baseURL}/current/${this.currentUser.uid}`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }

            return result.challenge;
        } catch (error) {
            console.error('Error fetching current custom challenge:', error);
            throw error;
        }
    }

    // Delete custom challenge
    async deleteCustomChallenge(challengeId) {
        try {
            const response = await fetch(`${this.baseURL}/challenge/${challengeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUser.uid
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }

            return result;
        } catch (error) {
            console.error('Error deleting custom challenge:', error);
            throw error;
        }
    }

    // Save game result
    async saveGameResult(challengeId, gameResult) {
        try {
            const response = await fetch(`${this.baseURL}/save-result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUser.uid,
                    challengeId: challengeId,
                    gameResult: gameResult
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }

            return result;
        } catch (error) {
            console.error('Error saving game result:', error);
            throw error;
        }
    }

    // Utility method to format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Validate challenge data
    validateChallengeData(data) {
        const errors = [];

        if (!data.text || data.text.trim().length < 20) {
            errors.push('Text must be at least 20 characters long');
        }

        if (data.text && data.text.length > 50000) {
            errors.push('Text must be less than 50,000 characters');
        }

        const timer = parseInt(data.timer);
        if (isNaN(timer) || timer < 10 || timer > 3600) {
            errors.push('Timer must be between 10 and 3600 seconds');
        }

        if (!data.difficulty || !['easy', 'medium', 'hard'].includes(data.difficulty)) {
            errors.push('Invalid difficulty level');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Initialize Firebase API
const firebaseAPI = new FirebaseCustomModeAPI();
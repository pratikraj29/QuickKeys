class CustomMode {
    constructor() {
        this.currentText = '';
        this.gameTimer = null;
        this.gameStarted = false;
        this.settings = {
            timeLimit: 60,
            difficulty: 'medium'
        };
        this.stats = {
            wpm: 0,
            accuracy: 100,
            errors: 0,
            totalChars: 0,
            correctChars: 0,
            timeElapsed: 0
        };
        
        this.initializeEventListeners();
        this.loadSavedChallenges();
    }

    initializeEventListeners() {
        // Get DOM elements
        this.textArea = document.getElementById('custom-text');
        this.timeSelect = document.getElementById('custom-time');
        this.difficultySelect = document.getElementById('custom-difficulty');
        this.playNowBtn = document.getElementById('play-now');
        this.saveChallengeBtn = document.getElementById('save-challenge');
        this.shareBtn = document.getElementById('share-custom');
        this.loadSavedBtn = document.getElementById('load-saved');
        this.challengesList = document.getElementById('challenges-list');

        // Event listeners
        this.playNowBtn?.addEventListener('click', () => this.playNow());
        this.saveChallengeBtn?.addEventListener('click', () => this.saveChallenge());
        this.shareBtn?.addEventListener('click', () => this.shareChallenge());
        this.loadSavedBtn?.addEventListener('click', () => this.showSavedChallenges());
        
        // Settings change listeners
        this.timeSelect?.addEventListener('change', (e) => {
            this.settings.timeLimit = parseInt(e.target.value);
        });
        
        this.difficultySelect?.addEventListener('change', (e) => {
            this.settings.difficulty = e.target.value;
        });
    }

    playNow() {
        // Check if there are any saved challenges
        const savedChallenges = this.getSavedChallenges();
        
        if (savedChallenges.length === 0) {
            this.showNotification('Please save a custom challenge first!', 'warning');
            return;
        }

        // Get the most recently saved challenge
        const latestChallenge = savedChallenges[savedChallenges.length - 1];
        
        // Load the saved challenge text and settings
        this.currentText = latestChallenge.text;
        this.settings = { ...latestChallenge.settings };
        
        // Show notification about which challenge is being played
        this.showNotification(`Playing: ${latestChallenge.name}`, 'info');
        
        // Start the typing game with saved text
        this.startCustomGame();
    }

    saveChallenge() {
        const customText = this.textArea?.value.trim();
        
        if (!customText) {
            this.showNotification('Please enter text before saving!', 'warning');
            return;
        }

        if (customText.length < 20) {
            this.showNotification('Text should be at least 20 characters long for meaningful practice.', 'warning');
            return;
        }

        // Create challenge object
        const challenge = {
            id: Date.now().toString(),
            text: customText,
            settings: { ...this.settings },
            name: `Challenge ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
            createdAt: new Date().toISOString(),
            difficulty: this.settings.difficulty,
            estimatedWPM: this.estimateWPM(customText),
            wordCount: customText.split(' ').length
        };

        // Save to Firebase simulation (localStorage for now)
        const savedChallenges = this.getSavedChallenges();
        savedChallenges.push(challenge);
        localStorage.setItem('savedChallenges', JSON.stringify(savedChallenges));

        this.showNotification('Challenge saved successfully! You can now use "Play Now" to practice with this text.', 'success');
        this.loadSavedChallenges();
        
        // Update the Play Now button to indicate it's ready
        this.updatePlayNowButton();
    }

    shareChallenge() {
        const customText = this.textArea?.value.trim();
        
        if (!customText) {
            this.showNotification('Please enter text before sharing!', 'warning');
            return;
        }

        // Create shareable link (simulate)
        const challengeData = {
            text: customText,
            settings: this.settings
        };
        
        const encodedData = btoa(JSON.stringify(challengeData));
        const shareableLink = `${window.location.origin}${window.location.pathname}?challenge=${encodedData}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareableLink).then(() => {
            this.showNotification('Challenge link copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy link. Please copy manually: ' + shareableLink, 'info');
        });
    }

    startCustomGame() {
        console.log('Starting custom game with text:', this.currentText);
        console.log('Custom settings:', this.settings);
        
        // Use the main app's screen switching method
        if (window.quickKeysApp) {
            window.quickKeysApp.showScreen('single-player');
            
            // Wait for screen transition then start game
            setTimeout(() => {
                if (window.quickKeysApp.game) {
                    console.log('Calling startCustomGame with:', this.currentText, this.settings);
                    window.quickKeysApp.game.startCustomGame(this.currentText, this.settings);
                } else {
                    console.error('Game not found');
                }
            }, 300);
        }
    }

    getSavedChallenges() {
        const saved = localStorage.getItem('savedChallenges');
        return saved ? JSON.parse(saved) : [];
    }

    loadSavedChallenges() {
        const challenges = this.getSavedChallenges();
        
        if (!this.challengesList) return;
        
        if (challenges.length === 0) {
            this.challengesList.innerHTML = `
                <div class="no-challenges">
                    <i class="fas fa-folder-open"></i>
                    <p>No saved challenges yet. Create your first challenge!</p>
                </div>
            `;
        } else {
            this.challengesList.innerHTML = challenges.map(challenge => `
                <div class="challenge-item" data-id="${challenge.id}">
                    <div class="challenge-info">
                        <h4 class="challenge-name">${challenge.name}</h4>
                        <div class="challenge-meta">
                            <span class="challenge-difficulty difficulty-${challenge.difficulty}">
                                ${challenge.difficulty.toUpperCase()}
                            </span>
                            <span class="challenge-words">${challenge.wordCount} words</span>
                            <span class="challenge-time">${challenge.settings.timeLimit}s</span>
                            <span class="challenge-wpm">~${challenge.estimatedWPM} WPM</span>
                        </div>
                        <div class="challenge-preview">
                            ${this.truncateText(challenge.text, 100)}
                        </div>
                    </div>
                    <div class="challenge-actions">
                        <button class="challenge-btn play-btn" onclick="customMode.playSpecificChallenge('${challenge.id}')">
                            <i class="fas fa-play"></i> Play
                        </button>
                        <button class="challenge-btn load-btn" onclick="customMode.loadChallenge('${challenge.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="challenge-btn delete-btn" onclick="customMode.deleteChallenge('${challenge.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // Update Play Now button based on available challenges
        this.updatePlayNowButton();
    }

    loadChallenge(challengeId) {
        const challenges = this.getSavedChallenges();
        const challenge = challenges.find(c => c.id === challengeId);
        
        if (!challenge) {
            this.showNotification('Challenge not found!', 'error');
            return;
        }

        // Load challenge data into form
        if (this.textArea) this.textArea.value = challenge.text;
        if (this.timeSelect) this.timeSelect.value = challenge.settings.timeLimit;
        if (this.difficultySelect) this.difficultySelect.value = challenge.settings.difficulty;
        
        // Update internal settings
        this.settings = { ...challenge.settings };
        
        // Update Play Now button
        this.updatePlayNowButton();
        
        this.showNotification('Challenge loaded! Click "Save Challenge" to update, then "Play Now" to practice.', 'success');
    }

    updatePlayNowButton() {
        const savedChallenges = this.getSavedChallenges();
        
        if (savedChallenges.length > 0) {
            const latestChallenge = savedChallenges[savedChallenges.length - 1];
            if (this.playNowBtn) {
                this.playNowBtn.innerHTML = `<i class="fas fa-play"></i> Play Latest: "${this.truncateText(latestChallenge.name, 20)}"`;
                this.playNowBtn.style.opacity = '1';
                this.playNowBtn.disabled = false;
            }
        } else {
            if (this.playNowBtn) {
                this.playNowBtn.innerHTML = '<i class="fas fa-play"></i> Play Now (Save a challenge first)';
                this.playNowBtn.style.opacity = '0.6';
                this.playNowBtn.disabled = true;
            }
        }
    }

    playSpecificChallenge(challengeId) {
        const challenges = this.getSavedChallenges();
        const challenge = challenges.find(c => c.id === challengeId);
        
        if (!challenge) {
            this.showNotification('Challenge not found!', 'error');
            return;
        }

        // Load the specific challenge text and settings
        this.currentText = challenge.text;
        this.settings = { ...challenge.settings };
        
        // Show notification about which challenge is being played
        this.showNotification(`Starting: ${challenge.name}`, 'info');
        
        // Start the typing game with this specific challenge
        this.startCustomGame();
    }

    deleteChallenge(challengeId) {
        if (!confirm('Are you sure you want to delete this challenge?')) {
            return;
        }

        const challenges = this.getSavedChallenges();
        const updatedChallenges = challenges.filter(c => c.id !== challengeId);
        
        localStorage.setItem('savedChallenges', JSON.stringify(updatedChallenges));
        this.loadSavedChallenges();
        
        this.showNotification('Challenge deleted successfully!', 'success');
        
        // Update Play Now button after deletion
        this.updatePlayNowButton();
    }

    showSavedChallenges() {
        // Toggle visibility of saved challenges section
        const savedSection = document.querySelector('.saved-challenges');
        if (savedSection) {
            savedSection.style.display = savedSection.style.display === 'none' ? 'block' : 'none';
        }
    }

    estimateWPM(text) {
        // Simple WPM estimation based on text complexity
        const words = text.split(' ').length;
        const avgCharsPerWord = text.length / words;
        
        let baseWPM = 40; // Base WPM for average typist
        
        // Adjust based on difficulty
        if (this.settings.difficulty === 'easy') baseWPM = 35;
        else if (this.settings.difficulty === 'hard') baseWPM = 50;
        
        // Adjust based on text complexity
        if (avgCharsPerWord > 6) baseWPM -= 5;
        if (avgCharsPerWord < 4) baseWPM += 5;
        
        return Math.max(25, Math.min(60, baseWPM));
    }

    truncateText(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    showNotification(message, type = 'info') {
        // Use the existing notification system
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Method to handle shared challenges from URL
    loadSharedChallenge() {
        const urlParams = new URLSearchParams(window.location.search);
        const challengeData = urlParams.get('challenge');
        
        if (challengeData) {
            try {
                const decoded = JSON.parse(atob(challengeData));
                
                if (this.textArea) this.textArea.value = decoded.text;
                if (this.timeSelect) this.timeSelect.value = decoded.settings.timeLimit;
                if (this.difficultySelect) this.difficultySelect.value = decoded.settings.difficulty;
                
                this.settings = { ...decoded.settings };
                
                this.showNotification('Shared challenge loaded!', 'success');
                
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                this.showNotification('Invalid challenge link!', 'error');
            }
        }
    }
}

// Initialize custom mode when DOM is loaded
let customMode;
document.addEventListener('DOMContentLoaded', () => {
    customMode = new CustomMode();
    customMode.loadSharedChallenge();
});
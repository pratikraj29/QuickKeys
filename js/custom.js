class CustomMode {
    constructor() {
        // Check if CustomModeEngine is already loaded
        if (window.customModeEngine) {
            console.log('CustomMode: CustomModeEngine detected, delegating to it - SKIPPING initialization');
            this.useNewEngine = true;
            // DO NOT initialize event listeners - let the new engine handle everything
            return;
        }
        
        console.log('CustomMode: No CustomModeEngine found, using legacy mode');
        this.useNewEngine = false;
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
        this.restoreCustomGameState();
    }

    initializeEventListeners() {
        console.log('CustomMode: Initializing event listeners (legacy mode)');
        // Get DOM elements
        this.textArea = document.getElementById('custom-text');
        this.timeSelect = document.getElementById('custom-time');
        this.difficultySelect = document.getElementById('custom-difficulty');
        this.playNowBtn = document.getElementById('play-now');
        this.saveChallengeBtn = document.getElementById('save-challenge');
        this.shareBtn = document.getElementById('share-custom');
        this.loadSavedBtn = document.getElementById('load-saved');
        this.challengesList = document.getElementById('challenges-list');
        this.fileUpload = document.getElementById('file-upload');
        this.customTimerInput = document.getElementById('custom-timer-input');
        this.customTimerValue = document.getElementById('custom-timer-value');

        // Event listeners
        this.playNowBtn?.addEventListener('click', () => this.playNow());
        this.saveChallengeBtn?.addEventListener('click', () => this.saveChallenge());
        this.shareBtn?.addEventListener('click', () => this.shareChallenge());
        this.loadSavedBtn?.addEventListener('click', () => this.showSavedChallenges());
        
        // File upload listener
        this.fileUpload?.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Text area change listener to update Play Now button
        this.textArea?.addEventListener('input', () => this.updatePlayNowButton());
        
        // Settings change listeners
        this.timeSelect?.addEventListener('change', (e) => this.handleTimeSelectChange(e));
        
        this.customTimerValue?.addEventListener('input', (e) => {
            if (this.timeSelect.value === 'custom') {
                this.settings.timeLimit = parseInt(e.target.value) || 60;
            }
        });
        
        this.difficultySelect?.addEventListener('change', (e) => {
            this.settings.difficulty = e.target.value;
        });
    }

    playNow() {
        // Check if there's text in the textarea (for immediate play)
        const currentText = this.textArea?.value.trim();
        
        if (currentText && currentText.length >= 20) {
            // Play with current text immediately
            this.currentText = currentText;
            this.showNotification('Starting game with entered text...', 'info');
            this.validateAndStartGame();
            return;
        }
        
        // Check if there are any saved challenges
        const savedChallenges = this.getSavedChallenges();
        
        if (savedChallenges.length === 0) {
            this.showNotification('Please enter text (minimum 20 characters) or save a custom challenge first!', 'warning');
            return;
        }

        // Get the most recently saved challenge
        const latestChallenge = savedChallenges[savedChallenges.length - 1];
        
        if (!latestChallenge.text || latestChallenge.text.length < 20) {
            this.showNotification('The saved challenge text is too short. Please enter new text or upload a file.', 'warning');
            return;
        }
        
        // Load the saved challenge text and settings
        this.currentText = latestChallenge.text;
        this.settings = { ...latestChallenge.settings };
        
        // Show notification about which challenge is being played
        this.showNotification(`Starting: ${latestChallenge.name}`, 'info');
        
        // Start the typing game with saved text
        this.startCustomGame();
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.includes('text') && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
            this.showNotification('Please select a text file (.txt or .md)', 'error');
            return;
        }

        // Check file size (max 1MB)
        if (file.size > 1024 * 1024) {
            this.showNotification('File size should be less than 1MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            
            // Clean up the text content
            const cleanedContent = this.cleanUpText(content);
            
            if (cleanedContent.length < 20) {
                this.showNotification('The uploaded file should contain at least 20 characters of text', 'warning');
                return;
            }

            // Set the text in the textarea
            if (this.textArea) {
                this.textArea.value = cleanedContent;
            }

            this.showNotification(`File "${file.name}" uploaded successfully! (${cleanedContent.length} characters)`, 'success');
        };

        reader.onerror = () => {
            this.showNotification('Error reading file. Please try again.', 'error');
        };

        reader.readAsText(file);
    }

    cleanUpText(text) {
        // Remove excessive whitespace and normalize line endings
        return text
            .replace(/\r\n/g, '\n')           // Normalize line endings
            .replace(/\n{3,}/g, '\n\n')       // Max 2 consecutive newlines
            .replace(/[ \t]+/g, ' ')          // Normalize spaces and tabs
            .trim();                          // Remove leading/trailing whitespace
    }

    handleTimeSelectChange(event) {
        const { value } = event.target;
        
        if (value === 'custom') {
            // Show custom timer input
            if (this.customTimerInput) {
                this.customTimerInput.style.display = 'flex';
                this.customTimerValue.focus();
            }
            // Set default custom time if not already set
            if (!this.customTimerValue.value) {
                this.customTimerValue.value = 60;
            }
            this.settings.timeLimit = parseInt(this.customTimerValue.value) || 60;
        } else {
            // Hide custom timer input
            if (this.customTimerInput) {
                this.customTimerInput.style.display = 'none';
            }
            this.settings.timeLimit = parseInt(value);
        }
    }

    validateAndStartGame() {
        if (!this.currentText || this.currentText.length < 20) {
            this.showNotification('Text should be at least 20 characters long for meaningful practice.', 'warning');
            return;
        }

        // Validate custom timer if selected
        if (this.timeSelect.value === 'custom') {
            const customTime = parseInt(this.customTimerValue.value);
            if (!customTime || customTime < 10 || customTime > 3600) {
                this.showNotification('Custom timer should be between 10 seconds and 1 hour (3600 seconds)', 'warning');
                return;
            }
            this.settings.timeLimit = customTime;
        }

        // Show notification about what's being played
        const timeLabel = this.formatTime(this.settings.timeLimit);
        
        this.showNotification(`Starting custom game (${timeLabel}, ${this.settings.difficulty})`, 'info');
        
        // Start the typing game
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
        console.log('CustomMode: Starting custom game with text:', this.currentText);
        console.log('CustomMode: Custom settings:', this.settings);
        
        // Validate before starting
        if (!this.currentText || this.currentText.trim().length < 20) {
            console.log('CustomMode: Validation failed - text too short');
            this.showNotification('Custom text must be at least 20 characters long!', 'error');
            return;
        }
        
        // Check if quickKeysApp exists
        if (!window.quickKeysApp) {
            console.error('CustomMode: quickKeysApp not found!');
            this.showNotification('Game app not loaded. Please refresh the page.', 'error');
            return;
        }
        
        // Set flags to prevent text display reset and indicate custom mode
        window.quickKeysApp.isStartingCustomGame = true;
        window.quickKeysApp.activeCustomText = this.currentText;
        window.quickKeysApp.activeCustomSettings = { ...this.settings };
        
        console.log('CustomMode: Switching to single-player screen');
        window.quickKeysApp.showScreen('single-player');
        
        // Wait for screen transition then start game
        setTimeout(() => {
            if (!window.quickKeysApp.game) {
                console.error('CustomMode: Game engine not found!');
                this.showNotification('Game engine not available. Please refresh the page.', 'error');
                return;
            }
            
            console.log('CustomMode: Calling game.startCustomGame with:', {
                text: this.currentText,
                settings: this.settings
            });
            
            const success = window.quickKeysApp.game.startCustomGame(this.currentText, this.settings);
            
            if (success === false) {
                console.error('CustomMode: startCustomGame returned false');
                this.showNotification('Failed to start custom game. Please try again.', 'error');
                window.quickKeysApp.showScreen('custom-mode');
            } else {
                console.log('CustomMode: Custom game started successfully!');
                // Store custom text in localStorage for persistence
                localStorage.setItem('currentCustomGame', JSON.stringify({
                    text: this.currentText,
                    settings: this.settings,
                    timestamp: Date.now()
                }));
            }
            
            // Clear the flag after starting
            window.quickKeysApp.isStartingCustomGame = false;
        }, 500); // Increased timeout to allow screen transition
    }

    restoreCustomGameState() {
        // Check if there's a current custom game in localStorage
        const storedGame = localStorage.getItem('currentCustomGame');
        if (storedGame) {
            try {
                const gameData = JSON.parse(storedGame);
                // Only restore if the game was recent (within 1 hour)
                if (Date.now() - gameData.timestamp < 3600000) {
                    this.currentText = gameData.text;
                    this.settings = gameData.settings;
                    console.log('CustomMode: Restored custom game state from localStorage');
                    
                    // Set the text in textarea if available
                    if (this.textArea) {
                        this.textArea.value = this.currentText;
                    }
                } else {
                    // Clean up old data
                    localStorage.removeItem('currentCustomGame');
                }
            } catch (e) {
                console.error('CustomMode: Failed to restore custom game state:', e);
                localStorage.removeItem('currentCustomGame');
            }
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
                            <span class="challenge-time">${this.formatTime(challenge.settings.timeLimit)}</span>
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
        
        // Handle time setting - check if it's a preset value or custom
        const { timeLimit } = challenge.settings;
        const presetValues = [30, 60, 120, 300, 600];
        
        if (presetValues.includes(timeLimit)) {
            if (this.timeSelect) this.timeSelect.value = timeLimit;
            if (this.customTimerInput) this.customTimerInput.style.display = 'none';
        } else {
            // Custom time value
            if (this.timeSelect) this.timeSelect.value = 'custom';
            if (this.customTimerValue) this.customTimerValue.value = timeLimit;
            if (this.customTimerInput) this.customTimerInput.style.display = 'flex';
        }
        
        if (this.difficultySelect) this.difficultySelect.value = challenge.settings.difficulty;
        
        // Update internal settings
        this.settings = { ...challenge.settings };
        
        // Update Play Now button
        this.updatePlayNowButton();
        
        this.showNotification('Challenge loaded! You can now play it or save changes.', 'success');
    }

    updatePlayNowButton() {
        const currentText = this.textArea?.value.trim();
        const savedChallenges = this.getSavedChallenges();
        
        if (this.playNowBtn) {
            if (currentText && currentText.length >= 20) {
                // Text is available for immediate play
                this.playNowBtn.innerHTML = '<i class="fas fa-play"></i> Play Now';
                this.playNowBtn.style.opacity = '1';
                this.playNowBtn.disabled = false;
            } else if (savedChallenges.length > 0) {
                // No current text, but saved challenges available
                const latestChallenge = savedChallenges[savedChallenges.length - 1];
                this.playNowBtn.innerHTML = `<i class="fas fa-play"></i> Play Latest: "${this.truncateText(latestChallenge.name, 20)}"`;
                this.playNowBtn.style.opacity = '1';
                this.playNowBtn.disabled = false;
            } else {
                // No text and no saved challenges
                this.playNowBtn.innerHTML = '<i class="fas fa-play"></i> Play Now (Enter text first)';
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
        
        // Show notification with formatted time
        const timeLabel = this.formatTime(challenge.settings.timeLimit);
        this.showNotification(`Starting: ${challenge.name} (${timeLabel}, ${challenge.difficulty})`, 'info');
        
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

    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds}s`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        }
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
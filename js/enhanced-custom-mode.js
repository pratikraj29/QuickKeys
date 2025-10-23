// Enhanced Custom Mode with Firebase Integration
class EnhancedCustomMode {
    constructor() {
        this.currentChallenge = null;
        this.challenges = [];
        this.isLoading = false;
        this.settings = {
            timeLimit: 60,
            difficulty: 'medium'
        };
        
        this.initializeEventListeners();
        this.loadUserChallenges();
        this.loadCurrentChallenge();
    }

    async initializeEventListeners() {
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
        this.challengeNameInput = document.getElementById('challenge-name-input');

        // Create challenge name input if it doesn't exist
        if (!this.challengeNameInput) {
            this.createChallengeNameInput();
        }

        // Event listeners
        this.playNowBtn?.addEventListener('click', () => this.playCustomChallenge());
        this.saveChallengeBtn?.addEventListener('click', () => this.saveChallenge());
        this.shareBtn?.addEventListener('click', () => this.shareChallenge());
        this.loadSavedBtn?.addEventListener('click', () => this.toggleSavedChallenges());
        
        // File upload listener
        this.fileUpload?.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Text area change listener
        this.textArea?.addEventListener('input', () => this.updateUI());
        
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

    createChallengeNameInput() {
        // Create challenge name input field
        const nameInputSection = document.createElement('div');
        nameInputSection.className = 'setting-group';
        nameInputSection.innerHTML = `
            <label class="setting-label">Challenge Name (Optional)</label>
            <input type="text" id="challenge-name-input" class="setting-input" 
                   placeholder="Enter a name for your challenge..." maxlength="100">
        `;
        
        // Insert before the custom actions
        const customActions = document.querySelector('.custom-actions');
        if (customActions) {
            customActions.parentNode.insertBefore(nameInputSection, customActions);
        }
        
        this.challengeNameInput = document.getElementById('challenge-name-input');
    }

    async loadUserChallenges() {
        try {
            this.setLoading(true);
            this.challenges = await firebaseAPI.getUserChallenges(20);
            this.renderChallengesList();
            console.log('Loaded user challenges:', this.challenges.length);
        } catch (error) {
            console.error('Error loading user challenges:', error);
            this.showNotification('Failed to load saved challenges: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async loadCurrentChallenge() {
        try {
            const currentChallenge = await firebaseAPI.getCurrentCustomChallenge();
            if (currentChallenge) {
                this.currentChallenge = currentChallenge;
                this.loadChallengeIntoForm(currentChallenge);
                console.log('Loaded current challenge:', currentChallenge.name);
            }
        } catch (error) {
            console.error('Error loading current challenge:', error);
        }
    }

    loadChallengeIntoForm(challenge) {
        if (this.textArea) this.textArea.value = challenge.text;
        if (this.challengeNameInput) this.challengeNameInput.value = challenge.name || '';
        
        // Handle timer setting
        const presetValues = [30, 60, 120, 300, 600];
        if (presetValues.includes(challenge.timer)) {
            if (this.timeSelect) this.timeSelect.value = challenge.timer;
            if (this.customTimerInput) this.customTimerInput.style.display = 'none';
        } else {
            if (this.timeSelect) this.timeSelect.value = 'custom';
            if (this.customTimerValue) this.customTimerValue.value = challenge.timer;
            if (this.customTimerInput) this.customTimerInput.style.display = 'flex';
        }
        
        if (this.difficultySelect) this.difficultySelect.value = challenge.difficulty;
        
        // Update internal settings
        this.settings = {
            timeLimit: challenge.timer,
            difficulty: challenge.difficulty
        };
        
        this.updateUI();
    }

    async saveChallenge() {
        try {
            const text = this.textArea?.value.trim();
            const name = this.challengeNameInput?.value.trim();
            
            if (!text) {
                this.showNotification('Please enter text before saving!', 'warning');
                return;
            }

            // Validate challenge data
            const challengeData = {
                name: name || `Custom Challenge ${new Date().toLocaleDateString()}`,
                text: text,
                timer: this.settings.timeLimit,
                difficulty: this.settings.difficulty
            };

            const validation = firebaseAPI.validateChallengeData(challengeData);
            if (!validation.isValid) {
                this.showNotification(validation.errors.join(', '), 'error');
                return;
            }

            this.setLoading(true);
            this.showNotification('Saving challenge...', 'info');

            const result = await firebaseAPI.saveCustomChallenge(challengeData);
            
            this.showNotification('Challenge saved successfully!', 'success');
            
            // Reload challenges list
            await this.loadUserChallenges();
            
            // Update current challenge
            this.currentChallenge = {
                id: result.challengeId,
                ...challengeData
            };
            
            this.updateUI();

        } catch (error) {
            console.error('Error saving challenge:', error);
            this.showNotification('Failed to save challenge: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async playCustomChallenge(challengeId = null) {
        try {
            let challengeToPlay;

            if (challengeId) {
                // Play specific saved challenge
                challengeToPlay = await firebaseAPI.getCustomChallenge(challengeId);
            } else {
                // Play current text or current challenge
                const currentText = this.textArea?.value.trim();
                
                if (currentText) {
                    // Use current text in textarea
                    challengeToPlay = {
                        text: currentText,
                        timer: this.settings.timeLimit,
                        difficulty: this.settings.difficulty,
                        name: 'Current Text'
                    };
                } else if (this.currentChallenge) {
                    // Use current saved challenge
                    challengeToPlay = this.currentChallenge;
                } else {
                    this.showNotification('Please enter text or load a saved challenge!', 'warning');
                    return;
                }
            }

            if (!challengeToPlay || !challengeToPlay.text) {
                this.showNotification('No valid challenge found to play!', 'error');
                return;
            }

            // Validate challenge
            const validation = firebaseAPI.validateChallengeData(challengeToPlay);
            if (!validation.isValid) {
                this.showNotification(validation.errors.join(', '), 'error');
                return;
            }

            console.log('Starting custom game with challenge:', challengeToPlay.name);
            
            // Show notification
            const timeLabel = this.formatTime(challengeToPlay.timer);
            this.showNotification(`Starting: ${challengeToPlay.name} (${timeLabel})`, 'info');
            
            // Start the custom game
            this.startCustomGame(challengeToPlay);

        } catch (error) {
            console.error('Error playing custom challenge:', error);
            this.showNotification('Failed to start custom challenge: ' + error.message, 'error');
        }
    }

    startCustomGame(challenge) {
        // Set flag to prevent text display reset
        window.quickKeysApp.isStartingCustomGame = true;
        window.quickKeysApp.currentCustomChallenge = challenge;
        
        console.log('EnhancedCustomMode: Starting custom game with challenge:', challenge);
        
        // Switch to single-player screen
        window.quickKeysApp.showScreen('single-player');
        
        // Wait for screen transition then start game
        setTimeout(() => {
            if (!window.quickKeysApp.game) {
                console.error('EnhancedCustomMode: Game engine not found!');
                this.showNotification('Game engine not available. Please refresh the page.', 'error');
                return;
            }
            
            try {
                const settings = {
                    timeLimit: challenge.timer,
                    difficulty: challenge.difficulty
                };
                
                const success = window.quickKeysApp.game.startCustomGame(challenge.text, settings);
                
                if (success === false) {
                    console.error('EnhancedCustomMode: startCustomGame returned false');
                    this.showNotification('Failed to start custom game. Please try again.', 'error');
                    window.quickKeysApp.showScreen('custom-mode');
                }
            } catch (error) {
                console.error('EnhancedCustomMode: Error starting custom game:', error);
                this.showNotification('Error starting custom game: ' + error.message, 'error');
                window.quickKeysApp.showScreen('custom-mode');
            }
        }, 500);
    }

    async deleteChallenge(challengeId) {
        if (!confirm('Are you sure you want to delete this challenge?')) {
            return;
        }

        try {
            this.setLoading(true);
            await firebaseAPI.deleteCustomChallenge(challengeId);
            this.showNotification('Challenge deleted successfully!', 'success');
            
            // Reload challenges list
            await this.loadUserChallenges();
            
            // Clear current challenge if it was deleted
            if (this.currentChallenge && this.currentChallenge.id === challengeId) {
                this.currentChallenge = null;
                this.clearForm();
            }
            
        } catch (error) {
            console.error('Error deleting challenge:', error);
            this.showNotification('Failed to delete challenge: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async loadChallenge(challengeId) {
        try {
            this.setLoading(true);
            const challenge = await firebaseAPI.getCustomChallenge(challengeId);
            this.currentChallenge = challenge;
            this.loadChallengeIntoForm(challenge);
            this.showNotification(`Loaded: ${challenge.name}`, 'success');
        } catch (error) {
            console.error('Error loading challenge:', error);
            this.showNotification('Failed to load challenge: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
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
            const cleanedContent = this.cleanUpText(content);
            
            if (cleanedContent.length < 20) {
                this.showNotification('The uploaded file should contain at least 20 characters of text', 'warning');
                return;
            }

            if (this.textArea) {
                this.textArea.value = cleanedContent;
            }

            // Auto-generate challenge name from filename
            if (this.challengeNameInput) {
                const baseName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
                this.challengeNameInput.value = baseName;
            }

            this.updateUI();
            this.showNotification(`File "${file.name}" uploaded successfully! (${firebaseAPI.formatFileSize(file.size)})`, 'success');
        };

        reader.onerror = () => {
            this.showNotification('Error reading file. Please try again.', 'error');
        };

        reader.readAsText(file);
    }

    cleanUpText(text) {
        return text
            .replace(/\r\n/g, '\n')           // Normalize line endings
            .replace(/\n{3,}/g, '\n\n')       // Max 2 consecutive newlines
            .replace(/[ \t]+/g, ' ')          // Normalize spaces and tabs
            .trim();                          // Remove leading/trailing whitespace
    }

    handleTimeSelectChange(event) {
        const { value } = event.target;
        
        if (value === 'custom') {
            if (this.customTimerInput) {
                this.customTimerInput.style.display = 'flex';
                this.customTimerValue.focus();
            }
            if (!this.customTimerValue.value) {
                this.customTimerValue.value = 60;
            }
            this.settings.timeLimit = parseInt(this.customTimerValue.value) || 60;
        } else {
            if (this.customTimerInput) {
                this.customTimerInput.style.display = 'none';
            }
            this.settings.timeLimit = parseInt(value);
        }
    }

    renderChallengesList() {
        if (!this.challengesList) return;
        
        if (this.challenges.length === 0) {
            this.challengesList.innerHTML = `
                <div class="no-challenges">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>No saved challenges yet. Upload a file or create your first challenge!</p>
                </div>
            `;
            return;
        }

        this.challengesList.innerHTML = this.challenges.map(challenge => `
            <div class="challenge-item" data-id="${challenge.id}">
                <div class="challenge-info">
                    <h4 class="challenge-name">${challenge.name}</h4>
                    <div class="challenge-meta">
                        <span class="challenge-difficulty difficulty-${challenge.difficulty}">
                            ${challenge.difficulty.toUpperCase()}
                        </span>
                        <span class="challenge-words">${challenge.wordCount} words</span>
                        <span class="challenge-time">${this.formatTime(challenge.timer)}</span>
                        <span class="challenge-chars">${challenge.characterCount} chars</span>
                    </div>
                    <div class="challenge-preview">
                        ${this.truncateText(challenge.text, 100)}
                    </div>
                    <div class="challenge-date">
                        Created: ${new Date(challenge.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div class="challenge-actions">
                    <button class="challenge-btn play-btn" onclick="enhancedCustomMode.playCustomChallenge('${challenge.id}')">
                        <i class="fas fa-play"></i> Play
                    </button>
                    <button class="challenge-btn load-btn" onclick="enhancedCustomMode.loadChallenge('${challenge.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="challenge-btn delete-btn" onclick="enhancedCustomMode.deleteChallenge('${challenge.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    toggleSavedChallenges() {
        const savedSection = document.querySelector('.saved-challenges');
        if (savedSection) {
            const isHidden = savedSection.style.display === 'none';
            savedSection.style.display = isHidden ? 'block' : 'none';
            
            if (isHidden) {
                this.loadUserChallenges(); // Refresh when showing
            }
        }
    }

    clearForm() {
        if (this.textArea) this.textArea.value = '';
        if (this.challengeNameInput) this.challengeNameInput.value = '';
        if (this.timeSelect) this.timeSelect.value = '60';
        if (this.difficultySelect) this.difficultySelect.value = 'medium';
        if (this.customTimerInput) this.customTimerInput.style.display = 'none';
        
        this.settings = {
            timeLimit: 60,
            difficulty: 'medium'
        };
        
        this.updateUI();
    }

    updateUI() {
        const currentText = this.textArea?.value.trim();
        
        if (this.playNowBtn) {
            if (currentText && currentText.length >= 20) {
                this.playNowBtn.innerHTML = '<i class="fas fa-play"></i> Play Now';
                this.playNowBtn.disabled = false;
                this.playNowBtn.style.opacity = '1';
            } else if (this.currentChallenge) {
                this.playNowBtn.innerHTML = `<i class="fas fa-play"></i> Play: ${this.truncateText(this.currentChallenge.name, 15)}`;
                this.playNowBtn.disabled = false;
                this.playNowBtn.style.opacity = '1';
            } else {
                this.playNowBtn.innerHTML = '<i class="fas fa-play"></i> Enter text or load challenge';
                this.playNowBtn.disabled = true;
                this.playNowBtn.style.opacity = '0.6';
            }
        }

        if (this.saveChallengeBtn) {
            if (currentText && currentText.length >= 20) {
                this.saveChallengeBtn.disabled = false;
                this.saveChallengeBtn.style.opacity = '1';
            } else {
                this.saveChallengeBtn.disabled = true;
                this.saveChallengeBtn.style.opacity = '0.6';
            }
        }
    }

    setLoading(loading) {
        this.isLoading = loading;
        
        if (this.saveChallengeBtn) {
            this.saveChallengeBtn.disabled = loading;
            this.saveChallengeBtn.innerHTML = loading ? 
                '<i class="fas fa-spinner fa-spin"></i> Saving...' : 
                '<i class="fas fa-save"></i> Save Challenge';
        }
        
        if (this.playNowBtn) {
            this.playNowBtn.disabled = loading || (this.playNowBtn.disabled && !loading);
        }
    }

    shareChallenge() {
        const currentText = this.textArea?.value.trim();
        
        if (!currentText) {
            this.showNotification('Please enter text before sharing!', 'warning');
            return;
        }

        // Create shareable data (you can implement actual sharing later)
        const challengeData = {
            text: currentText,
            timer: this.settings.timeLimit,
            difficulty: this.settings.difficulty,
            name: this.challengeNameInput?.value || 'Shared Challenge'
        };
        
        const encodedData = btoa(JSON.stringify(challengeData));
        const shareableLink = `${window.location.origin}${window.location.pathname}?challenge=${encodedData}`;
        
        navigator.clipboard.writeText(shareableLink).then(() => {
            this.showNotification('Challenge link copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy link. Please copy manually: ' + shareableLink, 'info');
        });
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
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Initialize Enhanced Custom Mode
let enhancedCustomMode;
document.addEventListener('DOMContentLoaded', () => {
    enhancedCustomMode = new EnhancedCustomMode();
});
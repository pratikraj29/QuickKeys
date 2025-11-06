
class CustomModeEngine {
    constructor() {
        this.customText = null;
        this.customTimer = 60; 
        this.customDifficulty = 'medium';
        this.gameActive = false;
        this.gameStarted = false;
        this.startTime = null;
        this.timer = null;
        this.currentPosition = 0;
        this.errors = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        
        // Storage keys
        this.STORAGE_KEYS = {
            CUSTOM_TEXT: 'quickkeys_custom_text',
            CUSTOM_TIMER: 'quickkeys_custom_timer',
            CUSTOM_DIFFICULTY: 'quickkeys_custom_difficulty',
            CUSTOM_CHALLENGES: 'quickkeys_custom_challenges'
        };
        
        this.init();
    }
    
    init() {
        console.log('CustomModeEngine: Initializing...');
        this.setupEventListeners();
        this.loadSavedCustomData();
        this.updateUI();
    }
    
    setupEventListeners() {
        // File upload
        const fileUpload = document.getElementById('file-upload');
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        }
        
        // Custom text input
        const customTextArea = document.getElementById('custom-text');
        if (customTextArea) {
            customTextArea.addEventListener('input', () => this.updateUI());
        }
        
        // Timer selection
        const customTime = document.getElementById('custom-time');
        if (customTime) {
            customTime.addEventListener('change', (e) => this.handleTimerChange(e));
        }
        
        // Custom timer input
        const customTimerInput = document.getElementById('custom-timer-input');
        const customTimerValue = document.getElementById('custom-timer-value');
        if (customTimerInput && customTimerValue) {
            customTimerInput.addEventListener('input', (e) => {
                customTimerValue.value = e.target.value;
                this.customTimer = parseInt(e.target.value);
            });
        }
        
        // Difficulty selection
        const customDifficulty = document.getElementById('custom-difficulty');
        if (customDifficulty) {
            customDifficulty.addEventListener('change', (e) => {
                this.customDifficulty = e.target.value;
            });
        }
        
        // Save button
        const saveBtn = document.getElementById('save-challenge');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCustomChallenge());
        }
        
        // Play Now button
        const playBtn = document.getElementById('play-now');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.startCustomGame());
        }
        
        // Load Saved button
        const loadBtn = document.getElementById('load-saved');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.showSavedChallenges());
        }
    }
    
    /**
     * Handle file upload - Read .txt or .md files
     */
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log('CustomModeEngine: File selected:', file.name);
        
        // Validate file type
        const validTypes = ['text/plain', 'text/markdown'];
        const validExtensions = ['.txt', '.md'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
            this.showNotification('Please select a .txt or .md file', 'error');
            event.target.value = '';
            return;
        }
        
        // Validate file size (max 1MB)
        if (file.size > 1024 * 1024) {
            this.showNotification('File size must be less than 1MB', 'error');
            event.target.value = '';
            return;
        }
        
        // Read file content
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target.result;
            const cleanedContent = this.cleanText(content);
            
            if (cleanedContent.length < 20) {
                this.showNotification('File must contain at least 20 characters', 'warning');
                return;
            }
            
            // Set the text in textarea
            const textArea = document.getElementById('custom-text');
            if (textArea) {
                textArea.value = cleanedContent;
                this.customText = cleanedContent;
            }
            
            this.showNotification(`File "${file.name}" uploaded successfully (${cleanedContent.length} characters)`, 'success');
            this.updateUI();
        };
        
        reader.onerror = () => {
            this.showNotification('Error reading file. Please try again.', 'error');
        };
        
        reader.readAsText(file);
    }
    
    /**
     * Clean and normalize text content
     */
    cleanText(text) {
        return text
            .replace(/\r\n/g, '\n')           // Normalize line endings
            .replace(/\n{3,}/g, '\n\n')       // Max 2 consecutive newlines
            .replace(/[ \t]+/g, ' ')          // Normalize spaces and tabs
            .replace(/^\s+|\s+$/g, '')        // Trim start and end
            .trim();
    }
    
    /**
     * Handle timer selection change
     */
    handleTimerChange(event) {
        const value = event.target.value;
        const customTimerSection = document.querySelector('.custom-timer-section');
        
        if (value === 'custom') {
            if (customTimerSection) {
                customTimerSection.style.display = 'block';
            }
            const customTimerValue = document.getElementById('custom-timer-value');
            this.customTimer = customTimerValue ? parseInt(customTimerValue.value) : 60;
        } else {
            if (customTimerSection) {
                customTimerSection.style.display = 'none';
            }
            this.customTimer = parseInt(value);
        }
        
        console.log('CustomModeEngine: Timer set to', this.customTimer, 'seconds');
    }
    
    /**
     * Save custom challenge to localStorage
     */
    saveCustomChallenge() {
        console.log('CustomModeEngine: saveCustomChallenge called');
        
        const textArea = document.getElementById('custom-text');
        const customText = textArea ? textArea.value.trim() : this.customText;
        
        console.log('CustomModeEngine: Text to save:', customText?.substring(0, 50) + '...');
        
        if (!customText || customText.length < 20) {
            console.warn('CustomModeEngine: Text too short or empty');
            this.showNotification('Please enter or upload text (minimum 20 characters)', 'warning');
            return;
        }
        
        // Show saving state on button
        const saveBtn = document.getElementById('save-challenge');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }
        
        // Create challenge object
        const challenge = {
            id: Date.now().toString(),
            name: `Challenge ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
            text: customText,
            timer: this.customTimer,
            difficulty: this.customDifficulty,
            wordCount: customText.split(/\s+/).length,
            charCount: customText.length,
            createdAt: new Date().toISOString()
        };
        
        console.log('CustomModeEngine: Saving challenge:', challenge);
        
        // Save to localStorage
        try {
            // Save current custom text and timer
            localStorage.setItem(this.STORAGE_KEYS.CUSTOM_TEXT, customText);
            localStorage.setItem(this.STORAGE_KEYS.CUSTOM_TIMER, this.customTimer.toString());
            localStorage.setItem(this.STORAGE_KEYS.CUSTOM_DIFFICULTY, this.customDifficulty);
            
            // Add to challenges list
            const challenges = this.getSavedChallenges();
            challenges.push(challenge);
            localStorage.setItem(this.STORAGE_KEYS.CUSTOM_CHALLENGES, JSON.stringify(challenges));
            
            this.customText = customText;
            
            console.log('CustomModeEngine: Challenge saved successfully');
            this.showNotification('Challenge saved successfully! Click "Play Now" to start.', 'success');
            this.updateUI();
            
            // Reset button state
            setTimeout(() => {
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Challenge';
                }
            }, 500);
            
        } catch (error) {
            console.error('CustomModeEngine: Error saving challenge:', error);
            this.showNotification('Error saving challenge. Please try again.', 'error');
            
            // Reset button state on error
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Challenge';
            }
        }
    }
    
    /**
     * Get saved challenges from localStorage
     */
    getSavedChallenges() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEYS.CUSTOM_CHALLENGES);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('CustomModeEngine: Error loading challenges:', error);
            return [];
        }
    }
    
    /**
     * Load saved custom data from localStorage
     */
    loadSavedCustomData() {
        try {
            const savedText = localStorage.getItem(this.STORAGE_KEYS.CUSTOM_TEXT);
            const savedTimer = localStorage.getItem(this.STORAGE_KEYS.CUSTOM_TIMER);
            const savedDifficulty = localStorage.getItem(this.STORAGE_KEYS.CUSTOM_DIFFICULTY);
            
            if (savedText) {
                this.customText = savedText;
                const textArea = document.getElementById('custom-text');
                if (textArea) {
                    textArea.value = savedText;
                }
                console.log('CustomModeEngine: Loaded saved text (' + savedText.length + ' chars)');
            }
            
            if (savedTimer) {
                this.customTimer = parseInt(savedTimer);
                console.log('CustomModeEngine: Loaded saved timer:', this.customTimer);
            }
            
            if (savedDifficulty) {
                this.customDifficulty = savedDifficulty;
            }
        } catch (error) {
            console.error('CustomModeEngine: Error loading saved data:', error);
        }
    }
    
    /**
     * Show saved challenges list
     */
    showSavedChallenges() {
        const challenges = this.getSavedChallenges();
        const challengesList = document.getElementById('challenges-list');
        
        if (!challengesList) return;
        
        if (challenges.length === 0) {
            challengesList.innerHTML = `
                <div class="no-challenges">
                    <i class="fas fa-folder-open"></i>
                    <p>No saved challenges yet</p>
                </div>
            `;
            return;
        }
        
        challengesList.innerHTML = challenges.map((challenge, index) => `
            <div class="challenge-card" data-id="${challenge.id}">
                <div class="challenge-header">
                    <h4>${challenge.name}</h4>
                    <button class="delete-btn" onclick="customModeEngine.deleteChallenge('${challenge.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="challenge-info">
                    <span><i class="fas fa-clock"></i> ${challenge.timer}s</span>
                    <span><i class="fas fa-signal"></i> ${challenge.difficulty}</span>
                    <span><i class="fas fa-font"></i> ${challenge.charCount} chars</span>
                    <span><i class="fas fa-file-word"></i> ${challenge.wordCount} words</span>
                </div>
                <button class="btn btn-primary btn-sm" onclick="customModeEngine.loadChallenge('${challenge.id}')">
                    <i class="fas fa-play"></i> Play This
                </button>
            </div>
        `).join('');
    }
    
    /**
     * Load a specific challenge
     */
    loadChallenge(challengeId) {
        const challenges = this.getSavedChallenges();
        const challenge = challenges.find(c => c.id === challengeId);
        
        if (!challenge) {
            this.showNotification('Challenge not found', 'error');
            return;
        }
        
        this.customText = challenge.text;
        this.customTimer = challenge.timer;
        this.customDifficulty = challenge.difficulty;
        
        // Update UI
        const textArea = document.getElementById('custom-text');
        if (textArea) {
            textArea.value = challenge.text;
        }
        
        this.showNotification(`Loaded: ${challenge.name}`, 'success');
        this.updateUI();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    /**
     * Delete a challenge
     */
    deleteChallenge(challengeId) {
        if (!confirm('Are you sure you want to delete this challenge?')) {
            return;
        }
        
        let challenges = this.getSavedChallenges();
        challenges = challenges.filter(c => c.id !== challengeId);
        localStorage.setItem(this.STORAGE_KEYS.CUSTOM_CHALLENGES, JSON.stringify(challenges));
        
        this.showSavedChallenges();
        this.showNotification('Challenge deleted', 'success');
    }
    
    /**
     * Start custom typing game - THIS IS THE KEY METHOD
     */
    startCustomGame() {
        console.log('CustomModeEngine: startCustomGame called');
        
        // Get current text from textarea or saved text
        const textArea = document.getElementById('custom-text');
        const currentText = textArea ? textArea.value.trim() : this.customText;
        
        console.log('CustomModeEngine: Current text length:', currentText?.length);
        console.log('CustomModeEngine: Current timer:', this.customTimer);
        
        // Validate custom text exists
        if (!currentText || currentText.length < 20) {
            console.warn('CustomModeEngine: No valid custom text found');
            this.showNotification('Please upload or enter custom text first (minimum 20 characters)', 'warning');
            return;
        }
        
        // Store custom text and settings
        this.customText = currentText;
        
        console.log('CustomModeEngine: Custom text loaded:', this.customText.substring(0, 100) + '...');
        console.log('CustomModeEngine: Timer:', this.customTimer, 'seconds');
        console.log('CustomModeEngine: Difficulty:', this.customDifficulty);
        
        // Mark as custom game to prevent Single Player interference
        if (window.quickKeysApp) {
            window.quickKeysApp.isCustomGameActive = true;
            window.quickKeysApp.customGameData = {
                text: this.customText,
                timer: this.customTimer,
                difficulty: this.customDifficulty
            };
            console.log('CustomModeEngine: Set global custom game flags');
        }
        
        // Switch to single-player screen for the game UI
        this.showNotification('Loading custom game...', 'info');
        
        setTimeout(() => {
            if (window.quickKeysApp) {
                console.log('CustomModeEngine: Switching to single-player screen');
                window.quickKeysApp.showScreen('single-player');
            }
            
            // Wait for screen to load, then start custom game
            setTimeout(() => {
                console.log('CustomModeEngine: Initializing custom game display');
                this.initializeCustomGame();
            }, 300);
        }, 200);
    }
    
    /**
     * Initialize the custom game in the single-player screen
     */
    initializeCustomGame() {
        console.log('CustomModeEngine: Initializing custom game display...');
        
        // Reset game state
        this.gameActive = true;
        this.gameStarted = false;
        this.currentPosition = 0;
        this.errors = 0;
        this.correctChars = 0;
        this.totalChars = this.customText.length;
        
        // Set up the text display with custom text
        const textDisplay = document.getElementById('text-display');
        if (textDisplay) {
            textDisplay.innerHTML = this.formatTextForDisplay(this.customText);
            console.log('CustomModeEngine: Text display updated with custom text');
        } else {
            console.error('CustomModeEngine: Text display element not found!');
            return;
        }
        
        // Update game header to show it's custom mode
        const gameHeader = document.querySelector('.game-header h2');
        if (gameHeader) {
            gameHeader.innerHTML = 'Custom Mode <span class="custom-indicator">⚡ Your Custom Text</span>';
        }
        
        // Set up typing input
        const typingInput = document.getElementById('typing-input');
        if (typingInput) {
            typingInput.value = '';
            typingInput.disabled = false;
            typingInput.placeholder = 'Start typing to begin...';
            typingInput.focus();
            
            // Remove existing listeners to prevent conflicts
            const newInput = typingInput.cloneNode(true);
            typingInput.parentNode.replaceChild(newInput, typingInput);
            
            // Add custom game input handler
            newInput.addEventListener('input', (e) => this.handleTypingInput(e));
        }
        
        // Update start button
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Custom Game';
            startBtn.style.background = 'var(--error)';
            startBtn.onclick = () => this.endCustomGame('stopped');
        }
        
        // Show submit button
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.style.display = 'inline-block';
            submitBtn.disabled = false;
            submitBtn.onclick = () => this.endCustomGame('submitted');
        }
        
        // Initialize stats display
        this.updateStatsDisplay();
        
        // Start the timer
        this.startCustomTimer();
        
        this.gameStarted = true;
        this.startTime = Date.now();
        
        console.log('CustomModeEngine: Custom game started successfully!');
    }
    
    /**
     * Format text for display with character spans
     */
    formatTextForDisplay(text) {
        return text.split('').map((char, index) => {
            const displayChar = char === ' ' ? '&nbsp;' : char;
            const className = index === 0 ? 'current' : '';
            return `<span class="${className}" data-index="${index}">${displayChar}</span>`;
        }).join('');
    }
    
    /**
     * Handle typing input
     */
    handleTypingInput(event) {
        if (!this.gameStarted || !this.gameActive) return;
        
        const input = event.target.value;
        const textDisplay = document.getElementById('text-display');
        if (!textDisplay) return;
        
        // Update character states
        const chars = textDisplay.querySelectorAll('span');
        this.currentPosition = input.length;
        this.correctChars = 0;
        this.errors = 0;
        
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            char.className = '';
            
            if (i < input.length) {
                if (input[i] === this.customText[i]) {
                    char.classList.add('correct');
                    this.correctChars++;
                } else {
                    char.classList.add('incorrect');
                    this.errors++;
                }
            } else if (i === input.length) {
                char.classList.add('current');
            }
        }
        
        // Update stats
        this.updateStatsDisplay();
        
        // Check if game is complete
        if (input.length >= this.customText.length) {
            if (input === this.customText) {
                this.endCustomGame('completed');
            }
        }
    }
    
    /**
     * Start custom timer
     */
    startCustomTimer() {
        let timeRemaining = this.customTimer;
        
        const updateTimer = () => {
            const timerDisplay = document.getElementById('timer');
            if (timerDisplay) {
                const minutes = Math.floor(timeRemaining / 60);
                const seconds = timeRemaining % 60;
                timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            timeRemaining--;
            
            if (timeRemaining < 0) {
                this.endCustomGame('timeout');
            }
        };
        
        updateTimer();
        this.timer = setInterval(updateTimer, 1000);
    }
    
    /**
     * Update stats display
     */
    updateStatsDisplay() {
        if (!this.gameStarted) return;
        
        const timeElapsed = (Date.now() - this.startTime) / 1000 / 60; // in minutes
        const wordsTyped = this.correctChars / 5; // Standard: 5 chars = 1 word
        const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
        const accuracy = this.currentPosition > 0 ? 
            Math.round((this.correctChars / this.currentPosition) * 100) : 100;
        
        // Update WPM
        const wpmDisplay = document.getElementById('wpm');
        if (wpmDisplay) {
            wpmDisplay.textContent = wpm;
        }
        
        // Update accuracy
        const accuracyDisplay = document.getElementById('accuracy');
        if (accuracyDisplay) {
            accuracyDisplay.textContent = accuracy + '%';
        }
        
        // Update errors
        const errorsDisplay = document.getElementById('errors');
        if (errorsDisplay) {
            errorsDisplay.textContent = this.errors;
        }
        
        // Update progress
        const progress = Math.round((this.currentPosition / this.totalChars) * 100);
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
    }
    
    /**
     * End custom game
     */
    endCustomGame(reason) {
        console.log('CustomModeEngine: Ending game, reason:', reason);
        
        this.gameActive = false;
        this.gameStarted = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Calculate final stats
        const timeElapsed = (Date.now() - this.startTime) / 1000 / 60;
        const wordsTyped = this.correctChars / 5;
        const finalWPM = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
        const finalAccuracy = this.currentPosition > 0 ? 
            Math.round((this.correctChars / this.currentPosition) * 100) : 0;
        
        // Disable input
        const typingInput = document.getElementById('typing-input');
        if (typingInput) {
            typingInput.disabled = true;
        }
        
        // Update buttons
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.innerHTML = '<i class="fas fa-redo"></i> Play Again';
            startBtn.style.background = '';
            startBtn.onclick = () => this.startCustomGame();
        }
        
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.style.display = 'none';
        }
        
        // Save result
        this.saveGameResult({
            wpm: finalWPM,
            accuracy: finalAccuracy,
            errors: this.errors,
            timeElapsed: Math.round((Date.now() - this.startTime) / 1000),
            reason: reason,
            textLength: this.customText.length,
            completedAt: new Date().toISOString()
        });
        
        // Show results
        this.showGameResults(finalWPM, finalAccuracy, this.errors, reason);
        
        // Clear custom game flag
        if (window.quickKeysApp) {
            window.quickKeysApp.isCustomGameActive = false;
        }
    }
    
    /**
     * Save game result
     */
    saveGameResult(result) {
        try {
            const results = JSON.parse(localStorage.getItem('quickkeys_custom_results') || '[]');
            results.push(result);
            
            // Keep only last 50 results
            if (results.length > 50) {
                results.splice(0, results.length - 50);
            }
            
            localStorage.setItem('quickkeys_custom_results', JSON.stringify(results));
            console.log('CustomModeEngine: Result saved:', result);
        } catch (error) {
            console.error('CustomModeEngine: Error saving result:', error);
        }
    }
    
    /**
     * Show game results modal
     */
    showGameResults(wpm, accuracy, errors, reason) {
        const modal = document.createElement('div');
        modal.className = 'custom-results-modal';
        modal.innerHTML = `
            <div class="custom-results-content">
                <h2>Custom Game Complete!</h2>
                <div class="results-stats">
                    <div class="stat-box">
                        <div class="stat-value">${wpm}</div>
                        <div class="stat-label">WPM</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${accuracy}%</div>
                        <div class="stat-label">Accuracy</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${errors}</div>
                        <div class="stat-label">Errors</div>
                    </div>
                </div>
                <div class="results-reason">
                    ${reason === 'completed' ? '✅ Completed Successfully!' : 
                      reason === 'timeout' ? '⏰ Time\'s Up!' : 
                      '🛑 Game Stopped'}
                </div>
                <div class="results-actions">
                    <button class="btn btn-primary" onclick="customModeEngine.startCustomGame()">
                        <i class="fas fa-redo"></i> Play Again
                    </button>
                    <button class="btn btn-secondary" onclick="customModeEngine.returnToCustomMode()">
                        <i class="fas fa-arrow-left"></i> Back to Custom Mode
                    </button>
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add styles if not already present
        if (!document.getElementById('custom-results-styles')) {
            const style = document.createElement('style');
            style.id = 'custom-results-styles';
            style.textContent = `
                .custom-results-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                
                .custom-results-content {
                    background: var(--bg-primary, #1a1a2e);
                    padding: 2rem;
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    animation: slideUp 0.3s ease;
                }
                
                .custom-results-content h2 {
                    text-align: center;
                    color: var(--accent-primary, #00d4ff);
                    margin-bottom: 1.5rem;
                }
                
                .results-stats {
                    display: flex;
                    justify-content: space-around;
                    margin-bottom: 1.5rem;
                }
                
                .stat-box {
                    text-align: center;
                }
                
                .stat-value {
                    font-size: 2rem;
                    font-weight: bold;
                    color: var(--accent-primary, #00d4ff);
                }
                
                .stat-label {
                    color: var(--text-secondary, #888);
                    margin-top: 0.5rem;
                }
                
                .results-reason {
                    text-align: center;
                    font-size: 1.2rem;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: var(--bg-secondary, #16213e);
                    border-radius: 8px;
                }
                
                .results-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Return to custom mode screen
     */
    returnToCustomMode() {
        // Remove results modal if present
        const modal = document.querySelector('.custom-results-modal');
        if (modal) {
            modal.remove();
        }
        
        // Clear custom game flag
        if (window.quickKeysApp) {
            window.quickKeysApp.isCustomGameActive = false;
            window.quickKeysApp.showScreen('custom-mode');
        }
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        const playBtn = document.getElementById('play-now');
        const textArea = document.getElementById('custom-text');
        
        if (playBtn && textArea) {
            const hasText = textArea.value.trim().length >= 20;
            playBtn.disabled = !hasText;
            playBtn.style.opacity = hasText ? '1' : '0.5';
            
            if (hasText) {
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play Now';
            } else {
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play Now (Enter text first)';
            }
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Use the app's notification system if available
        if (window.quickKeysApp && window.quickKeysApp.showNotification) {
            window.quickKeysApp.showNotification(message, type);
        } else if (window.quickKeysApp && window.quickKeysApp.ui && window.quickKeysApp.ui.showNotification) {
            window.quickKeysApp.ui.showNotification(message, type);
        } else {
            // Fallback to console
            console.log(`[${type.toUpperCase()}] ${message}`);
            
            // Try to create a simple notification
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
                color: white;
                border-radius: 8px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                notification.style.transition = 'all 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }
}

// Initialize Custom Mode Engine when DOM is ready
let customModeEngine;

document.addEventListener('DOMContentLoaded', () => {
    customModeEngine = new CustomModeEngine();
    window.customModeEngine = customModeEngine; // Make globally accessible
    console.log('CustomModeEngine: Ready!');
});

// QuickKeys - Main Application JavaScript

class QuickKeysApp {
    constructor() {
        this.currentScreen = 'home';
        this.isGameActive = false;
        this.gameStats = {
            wpm: 0,
            accuracy: 100,
            errors: 0,
            timeRemaining: 60,
            startTime: null,
            endTime: null
        };
        this.settings = {
            theme: 'dark',
            sound: true,
            difficulty: 'medium'
        };
        this.user = {
            name: 'Your Username',
            bio: 'Aspiring speed typist',
            stats: {
                avgWPM: 87,
                bestWPM: 120,
                bestAccuracy: 98.5,
                avgAccuracy: 95.2,
                totalGames: 142,
                gamesWon: 89,
                totalWPM: 87 * 142, // For calculating average
                totalAccuracy: 95.2 * 142, // For calculating average
                totalTime: 24 * 60 * 60 // 24 hours in seconds
            }
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadUserData();
        this.setupEventListeners();
        this.initializeGameComponents();
        this.initializeBackgroundMusic();
        this.showLoadingScreen();
    }

    /**
     * Initialize background music integration
     */
    initializeBackgroundMusic() {
        // Wait a bit for the background music system to initialize
        setTimeout(() => {
            if (window.backgroundMusic) {
                this.backgroundMusic = window.backgroundMusic;
                console.log('🎵 Background music integrated with QuickKeys app');
            }
        }, 100);
    }

    initializeGameComponents() {
        // Initialize single-player game
        this.game = new TypingGame(this);
        console.log('Main: TypingGame initialized:', this.game);
        
        // Initialize multiplayer game
        this.multiplayer = new MultiplayerGame(this);
    }

    // Loading and Initialization
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        
        // Simulate loading time
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                this.showScreen('home');
            }, 500);
        }, 2000);
    }

    // Settings Management
    loadSettings() {
        const savedSettings = localStorage.getItem('quickkeys-settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        this.applyTheme();
        this.applySoundSettings();
    }

    saveSettings() {
        localStorage.setItem('quickkeys-settings', JSON.stringify(this.settings));
    }

    applyTheme() {
        if (this.settings.theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
        this.updateThemeToggle();
    }

    updateThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle.querySelector('i');
        icon.className = this.settings.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    applySoundSettings() {
        const soundToggle = document.getElementById('sound-toggle');
        const icon = soundToggle.querySelector('i');
        icon.className = this.settings.sound ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    }

    // User Data Management
    loadUserData() {
        const savedUser = localStorage.getItem('quickkeys-user');
        if (savedUser) {
            this.user = { ...this.user, ...JSON.parse(savedUser) };
        }
        this.updateProfileDisplay();
    }

    saveUserData() {
        localStorage.setItem('quickkeys-user', JSON.stringify(this.user));
    }

    updateProfileDisplay() {
        const elements = {
            'profile-name': this.user.name,
            'profile-bio': this.user.bio,
            'avg-wpm': this.user.stats.avgWPM,
            'best-accuracy': this.user.stats.bestAccuracy + '%',
            'total-games': this.user.stats.totalGames,
            'total-time': this.formatTime(this.user.stats.totalTime)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `${seconds}s`;
        }
    }

    // Screen Management
    showScreen(screenId) {
        // Hide current screen
        const currentScreenEl = document.querySelector('.screen.active');
        if (currentScreenEl) {
            currentScreenEl.classList.remove('active');
        }

        // Show new screen
        const newScreenEl = document.getElementById(`${screenId}-screen`);
        if (newScreenEl) {
            newScreenEl.classList.add('active');
            this.currentScreen = screenId;
        }

        // Update navigation
        this.updateNavigation();

        // Screen-specific initialization
        this.initializeScreen(screenId);
    }

    updateNavigation() {
        const nav = document.getElementById('main-nav');
        
        if (this.currentScreen === 'home') {
            nav.classList.remove('visible');
        } else {
            nav.classList.add('visible');
        }

        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.screen === this.currentScreen) {
                btn.classList.add('active');
            }
        });
    }

    initializeScreen(screenId) {
        switch (screenId) {
            case 'single-player':
                this.initializeSinglePlayer();
                break;
            case 'multiplayer':
                this.initializeMultiplayer();
                break;
            case 'custom':
                this.initializeCustomMode();
                break;
            case 'leaderboard':
                this.initializeLeaderboard();
                break;
            case 'profile':
                this.initializeProfile();
                break;
        }
    }

    initializeSinglePlayer() {
        console.log('Main: initializeSinglePlayer called');
        
        // Check if we're in the middle of starting a custom game
        const isCustomGameStarting = this.isStartingCustomGame;
        const hasActiveCustomGame = this.activeCustomText && this.activeCustomSettings;
        console.log('Main: isStartingCustomGame flag:', isCustomGameStarting);
        console.log('Main: hasActiveCustomGame:', hasActiveCustomGame);
        
        this.resetGameStats();
        this.updateGameStatsDisplay();
        this.loadDifficultySetting();
        
        const textDisplay = document.getElementById('text-display');
        const typingInput = document.getElementById('typing-input');
        const startBtn = document.getElementById('start-btn');
        const submitBtn = document.getElementById('submit-btn');
        
        if (isCustomGameStarting || hasActiveCustomGame) {
            console.log('Main: Setting up for custom game');
            // Don't reset text display for custom games
            if (hasActiveCustomGame) {
                textDisplay.textContent = 'Custom text loaded. Click "Start Game" to begin your custom typing challenge!';
                startBtn.innerHTML = '<i class="fas fa-play"></i> Start Custom Game';
            } else {
                console.log('Main: Skipping text display reset because custom game is starting');
            }
        } else {
            // Normal single player initialization
            textDisplay.textContent = 'Select your difficulty level and click "Start Game" to begin your typing challenge!';
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
        }
        
        // Reset input and UI elements
        typingInput.value = '';
        typingInput.disabled = true;
        typingInput.placeholder = 'Your typing will appear here...';
        
        startBtn.disabled = false;
        
        if (submitBtn) {
            submitBtn.style.display = 'none';
        }
        
        // Reset progress info
        const progressPercent = document.getElementById('progress-percent');
        const charactersRemaining = document.getElementById('characters-remaining');
        
        if (progressPercent) progressPercent.textContent = '0%';
        if (charactersRemaining) charactersRemaining.textContent = '';
    }

    initializeMultiplayer() {
        const lobby = document.getElementById('multiplayer-lobby');
        const game = document.getElementById('multiplayer-game');
        
        // Always show lobby and hide game area
        if (lobby) {
            lobby.style.display = 'flex';
        }
        if (game) {
            game.style.display = 'none';
        }
        
        // Reset multiplayer game state and ensure lobby is shown
        if (this.multiplayer) {
            this.multiplayer.resetMultiplayer();
            this.multiplayer.showLobby();
        }
        
        // Ensure find match button is properly centered
        const findMatchBtn = document.getElementById('find-match-btn');
        if (findMatchBtn) {
            findMatchBtn.style.display = 'flex';
            findMatchBtn.disabled = false;
        }
    }

    initializeCustomMode() {
        this.loadSavedChallenges();
    }

    initializeLeaderboard() {
        this.loadLeaderboardData();
    }

    initializeProfile() {
        this.updateProfileDisplay();
    }

    // Game Logic
    resetGameStats() {
        this.gameStats = {
            wpm: 0,
            accuracy: 100,
            errors: 0,
            timeRemaining: 60,
            startTime: null,
            endTime: null,
            totalCharacters: 0,
            correctCharacters: 0,
            currentPosition: 0
        };
        this.isGameActive = false;
    }

    updateGameStatsDisplay() {
        document.getElementById('wpm').textContent = this.gameStats.wpm;
        document.getElementById('accuracy').textContent = this.gameStats.accuracy + '%';
        document.getElementById('errors').textContent = this.gameStats.errors;
        document.getElementById('timer').textContent = this.gameStats.timeRemaining;
        
        // Update time elapsed
        const timeElapsedEl = document.getElementById('time-elapsed');
        if (timeElapsedEl) {
            timeElapsedEl.textContent = (this.gameStats.timeElapsed || 0) + 's';
        }
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill && this.gameStats.totalCharacters > 0) {
            const progress = (this.gameStats.currentPosition / this.gameStats.totalCharacters) * 100;
            progressFill.style.width = progress + '%';
        }
    }

    loadDifficultySetting() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.difficulty === this.settings.difficulty) {
                btn.classList.add('active');
            }
        });
    }

    loadSavedChallenges() {
        const challengesList = document.getElementById('challenges-list');
        const savedChallenges = JSON.parse(localStorage.getItem('quickkeys-challenges') || '[]');
        
        challengesList.innerHTML = '';
        
        if (savedChallenges.length === 0) {
            challengesList.innerHTML = `
                <div class="challenge-item">
                    <div class="challenge-info">
                        <span class="challenge-name">No saved challenges</span>
                        <span class="challenge-meta">Create your first custom challenge!</span>
                    </div>
                </div>
            `;
            return;
        }

        savedChallenges.forEach((challenge, index) => {
            const challengeEl = document.createElement('div');
            challengeEl.className = 'challenge-item';
            challengeEl.innerHTML = `
                <div class="challenge-info">
                    <span class="challenge-name">${challenge.name}</span>
                    <span class="challenge-meta">${challenge.difficulty} • ${challenge.timeLimit}s</span>
                </div>
                <div class="challenge-actions">
                    <button class="challenge-btn play" data-index="${index}">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="challenge-btn delete" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            challengesList.appendChild(challengeEl);
        });
    }

    loadLeaderboardData() {
        // This would typically load from a server
        // For demo purposes, we'll use localStorage
        const leaderboardData = JSON.parse(localStorage.getItem('quickkeys-leaderboard') || '[]');
        
        if (leaderboardData.length === 0) {
            // Add some sample data
            const sampleData = [
                { name: 'SpeedTyper99', wpm: 124, accuracy: 98.5, date: 'Today' },
                { name: 'KeyboardMaster', wpm: 118, accuracy: 97.2, date: 'Yesterday' },
                { name: 'FastFingers', wpm: 115, accuracy: 96.8, date: '2 days ago' },
                { name: 'TypingNinja', wpm: 112, accuracy: 95.5, date: '3 days ago' },
                { name: 'QuickKeys Pro', wpm: 108, accuracy: 94.2, date: '1 week ago' }
            ];
            localStorage.setItem('quickkeys-leaderboard', JSON.stringify(sampleData));
            this.updateLeaderboardDisplay(sampleData);
        } else {
            this.updateLeaderboardDisplay(leaderboardData);
        }
    }

    updateLeaderboardDisplay(data) {
        const leaderboardBody = document.getElementById('leaderboard-body');
        leaderboardBody.innerHTML = '';

        data.forEach((entry, index) => {
            const row = document.createElement('div');
            row.className = `table-row ${index < 3 ? ['gold', 'silver', 'bronze'][index] : ''}`;
            
            const trophyIcon = index < 3 ? 
                `<i class="fas fa-trophy ${['gold-trophy', 'silver-trophy', 'bronze-trophy'][index]}"></i>` : '';
            
            row.innerHTML = `
                <div class="col rank">
                    ${trophyIcon}
                    <span>${index + 1}</span>
                </div>
                <div class="col player">
                    <div class="player-avatar small">
                        <i class="fas fa-user"></i>
                    </div>
                    <span>${entry.name}</span>
                </div>
                <div class="col wpm">${entry.wpm}</div>
                <div class="col accuracy">${entry.accuracy}%</div>
                <div class="col date">${entry.date}</div>
            `;
            
            leaderboardBody.appendChild(row);
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.dataset.screen) {
                this.showScreen(e.target.dataset.screen);
            }
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
            this.applyTheme();
            this.saveSettings();
        });

        // Sound toggle
        document.getElementById('sound-toggle').addEventListener('click', () => {
            this.settings.sound = !this.settings.sound;
            this.applySoundSettings();
            this.saveSettings();
            if (this.settings.sound) {
                this.playSound('click');
            }
        });

        // Difficulty selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('difficulty-btn')) {
                document.querySelectorAll('.difficulty-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                this.settings.difficulty = e.target.dataset.difficulty;
                this.saveSettings();
            }
        });

        // Game controls
        document.addEventListener('click', (e) => {
            if (e.target.id === 'start-btn' || e.target.parentElement?.id === 'start-btn') {
                // Check if we have active custom game data
                if (this.activeCustomText && this.activeCustomSettings) {
                    console.log('Main: Start button clicked for custom game');
                    // Start the custom game with stored text and settings
                    if (this.game) {
                        this.game.startCustomGame(this.activeCustomText, this.activeCustomSettings);
                    }
                } else if (this.game && this.game.isCustomGame) {
                    console.log('Main: Start button clicked during active custom game');
                    // Custom game is already started, this button should stop the game
                    if (this.game.gameStarted) {
                        this.game.endGame('stopped');
                    }
                } else {
                    console.log('Main: Start button clicked - starting regular game');
                    if (this.game) {
                        this.game.startGame();
                    }
                }
            } else if (e.target.id === 'submit-btn' || e.target.parentElement?.id === 'submit-btn') {
                this.submitGame();
            } else if (e.target.id === 'retry-btn' || e.target.parentElement?.id === 'retry-btn') {
                this.resetGame();
            }
        });

        // Custom mode
        document.addEventListener('click', (e) => {
            if (e.target.id === 'start-custom' || e.target.parentElement?.id === 'start-custom') {
                this.startCustomGame();
            } else if (e.target.id === 'save-custom' || e.target.parentElement?.id === 'save-custom') {
                this.saveCustomChallenge();
            } else if (e.target.id === 'share-custom' || e.target.parentElement?.id === 'share-custom') {
                this.shareCustomChallenge();
            }
        });

        // Challenge actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('challenge-btn') || e.target.parentElement?.classList.contains('challenge-btn')) {
                const btn = e.target.classList.contains('challenge-btn') ? e.target : e.target.parentElement;
                const index = parseInt(btn.dataset.index);
                
                if (btn.classList.contains('play')) {
                    this.playChallenge(index);
                } else if (btn.classList.contains('delete')) {
                    this.deleteChallenge(index);
                }
            }
        });

        // Leaderboard filters
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                this.filterLeaderboard(e.target.dataset.filter);
            }
        });

        // Modal controls
        document.addEventListener('click', (e) => {
            if (e.target.id === 'close-results' || e.target.parentElement?.id === 'close-results') {
                this.closeResultsModal();
            } else if (e.target.id === 'retry-btn' || e.target.parentElement?.id === 'retry-btn') {
                this.retryGame();
            } else if (e.target.id === 'home-btn' || e.target.parentElement?.id === 'home-btn') {
                this.goHome();
            } else if (e.target.id === 'share-btn' || e.target.parentElement?.id === 'share-btn') {
                this.shareScore();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.currentScreen !== 'home') {
                    this.showScreen('home');
                }
            }
        });
    }

    // Game Methods (placeholders - will be implemented in game.js)
    startGame() {
        // Will be implemented in game.js
        console.log('Starting game...');
    }

    submitGame() {
        // Will be implemented in game.js
        console.log('Submitting game...');
    }

    resetGame() {
        // Will be implemented in game.js
        console.log('Resetting game...');
    }

    startCustomGame() {
        // Will be implemented in game.js
        console.log('Starting custom game...');
    }

    // Custom Challenge Methods
    saveCustomChallenge() {
        const customText = document.getElementById('custom-text').value.trim();
        const timeLimit = document.getElementById('custom-time').value;
        const difficulty = document.getElementById('custom-difficulty').value;

        if (!customText) {
            alert('Please enter some text for your challenge!');
            return;
        }

        const challengeName = prompt('Enter a name for your challenge:');
        if (!challengeName) return;

        const challenge = {
            name: challengeName,
            text: customText,
            timeLimit: parseInt(timeLimit),
            difficulty: difficulty,
            createdAt: new Date().toISOString()
        };

        const savedChallenges = JSON.parse(localStorage.getItem('quickkeys-challenges') || '[]');
        savedChallenges.push(challenge);
        localStorage.setItem('quickkeys-challenges', JSON.stringify(savedChallenges));

        this.loadSavedChallenges();
        this.showNotification('Challenge saved successfully!');
    }

    shareCustomChallenge() {
        const customText = document.getElementById('custom-text').value.trim();
        if (!customText) {
            alert('Please enter some text to share!');
            return;
        }

        const shareData = {
            text: customText,
            timeLimit: document.getElementById('custom-time').value,
            difficulty: document.getElementById('custom-difficulty').value
        };

        const encodedData = btoa(JSON.stringify(shareData));
        const shareUrl = `${window.location.origin}${window.location.pathname}?challenge=${encodedData}`;

        if (navigator.share) {
            navigator.share({
                title: 'QuickKeys Custom Challenge',
                text: 'Try this typing challenge!',
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            this.showNotification('Challenge URL copied to clipboard!');
        }
    }

    playChallenge(index) {
        const savedChallenges = JSON.parse(localStorage.getItem('quickkeys-challenges') || '[]');
        const challenge = savedChallenges[index];
        
        if (challenge) {
            document.getElementById('custom-text').value = challenge.text;
            document.getElementById('custom-time').value = challenge.timeLimit;
            document.getElementById('custom-difficulty').value = challenge.difficulty;
            this.startCustomGame();
        }
    }

    deleteChallenge(index) {
        if (confirm('Are you sure you want to delete this challenge?')) {
            const savedChallenges = JSON.parse(localStorage.getItem('quickkeys-challenges') || '[]');
            savedChallenges.splice(index, 1);
            localStorage.setItem('quickkeys-challenges', JSON.stringify(savedChallenges));
            this.loadSavedChallenges();
            this.showNotification('Challenge deleted!');
        }
    }

    filterLeaderboard(filter) {
        // In a real app, this would fetch filtered data from server
        console.log('Filtering leaderboard:', filter);
        this.loadLeaderboardData(); // For now, just reload the same data
    }

    // Modal Methods
    showResultsModal(results) {
        const modal = document.getElementById('results-modal');
        
        document.getElementById('final-wpm').textContent = results.wpm;
        document.getElementById('final-accuracy').textContent = results.accuracy + '%';
        document.getElementById('final-errors').textContent = results.errors;
        document.getElementById('final-time').textContent = results.time + 's';
        
        modal.classList.add('active');
    }

    closeResultsModal() {
        const modal = document.getElementById('results-modal');
        modal.classList.remove('active');
    }

    retryGame() {
        this.closeResultsModal();
        this.resetGame();
    }

    goHome() {
        this.closeResultsModal();
        this.showScreen('home');
    }

    shareScore() {
        const wpm = document.getElementById('final-wpm').textContent;
        const accuracy = document.getElementById('final-accuracy').textContent;
        
        const shareText = `I just scored ${wpm} WPM with ${accuracy} accuracy on QuickKeys! 🚀`;
        
        if (navigator.share) {
            navigator.share({
                title: 'QuickKeys Score',
                text: shareText,
                url: window.location.origin
            });
        } else {
            navigator.clipboard.writeText(shareText);
            this.showNotification('Score copied to clipboard!');
        }
    }

    // Utility Methods
    playSound(type) {
        if (!this.settings.sound) return;
        
        // In a real app, you would load and play actual sound files
        // For now, we'll just log the sound type
        console.log(`Playing sound: ${type}`);
    }

    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        const colors = {
            success: 'var(--success)',
            error: 'var(--danger)',
            warning: 'var(--warning)',
            info: 'var(--accent-primary)'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            z-index: 9999;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            box-shadow: var(--shadow-dark);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    showMultiplayerResults(result) {
        // Show the result modal with multiplayer-specific data
        const modal = document.getElementById('result-modal');
        const overlay = document.getElementById('modal-overlay');
        
        // Update modal content for multiplayer results
        const modalContent = modal.querySelector('.modal-content');
        
        modalContent.innerHTML = `
            <div class="result-header">
                <h2>${result.won ? '🏆 Victory!' : '💔 Defeat'}</h2>
                <p>Multiplayer Race Results</p>
            </div>
            
            <div class="result-stats">
                <div class="stat-group">
                    <h3>Your Performance</h3>
                    <div class="stat-row">
                        <span>Speed:</span>
                        <span>${result.wpm} WPM</span>
                    </div>
                    <div class="stat-row">
                        <span>Accuracy:</span>
                        <span>${result.accuracy}%</span>
                    </div>
                    <div class="stat-row">
                        <span>Time:</span>
                        <span>${result.time.toFixed(1)}s</span>
                    </div>
                </div>
                
                <div class="stat-group">
                    <h3>Opponent: ${result.opponent}</h3>
                    <div class="stat-row">
                        <span>Speed:</span>
                        <span>${result.opponentWPM} WPM</span>
                    </div>
                    <div class="stat-row">
                        <span>Accuracy:</span>
                        <span>${result.opponentAccuracy}%</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="quickKeysApp.hideModal('result-modal')">
                    <i class="fas fa-times"></i> Close
                </button>
                <button class="btn btn-primary" onclick="quickKeysApp.showScreen('multiplayer')">
                    <i class="fas fa-redo"></i> Play Again
                </button>
            </div>
        `;
        
        // Show modal
        modal.style.display = 'flex';
        overlay.style.display = 'block';
        
        // Update user stats if won
        if (result.won) {
            this.saveUserData();
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modal-overlay');
        
        if (modal) modal.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quickKeysApp = new QuickKeysApp();
});

// Handle shared challenges from URL
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedChallenge = urlParams.get('challenge');
    
    if (sharedChallenge) {
        try {
            const challengeData = JSON.parse(atob(sharedChallenge));
            document.getElementById('custom-text').value = challengeData.text;
            document.getElementById('custom-time').value = challengeData.timeLimit;
            document.getElementById('custom-difficulty').value = challengeData.difficulty;
            
            if (window.quickKeysApp) {
                window.quickKeysApp.showScreen('custom');
                window.quickKeysApp.showNotification('Shared challenge loaded!');
            }
        } catch (error) {
            console.error('Error loading shared challenge:', error);
        }
    }
});
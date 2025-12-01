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

    async init() {
        console.log('🚀 QuickKeys initializing...');
        
        // Check authentication status first
        await this.checkAuthStatus();
        
        this.loadSettings();
        this.loadUserData();
        this.setupEventListeners();
        this.initializeGameComponents();
        this.initializeBackgroundMusic();
        this.showLoadingScreen();
        
        // Update UI based on auth status
        this.updateAuthUI();
    }
    
    async checkAuthStatus() {
        try {
            const { getCurrentUser } = await import('../supabase.js');
            const user = await getCurrentUser();
            
            if (user) {
                console.log('✅ User logged in:', user.email);
                this.isLoggedIn = true;
                this.currentUser = user;
            } else {
                console.log('👤 Not logged in - using guest mode');
                this.isLoggedIn = false;
                this.currentUser = null;
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.isLoggedIn = false;
        }
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
        
        // Faster loading - reduced from 2000ms to 800ms
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                this.showScreen('home');
                
                // Show welcome notification on first visit
                const hasVisited = localStorage.getItem('quickkeys-visited');
                if (!hasVisited) {
                    setTimeout(() => {
                        this.showNotification('Welcome to QuickKeys! Select a mode to start typing.', 'success');
                        localStorage.setItem('quickkeys-visited', 'true');
                    }, 300);
                }
            }, 200);
        }, 800);
    }

    // Settings Management
    loadSettings() {
        const savedSettings = localStorage.getItem('quickKeysSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            this.settings = { 
                ...this.settings, 
                ...parsed,
                theme: parsed.theme ? 'dark' : 'light' // Convert boolean to string
            };
            console.log('✅ Settings loaded from localStorage:', this.settings);
        } else {
            // Default settings
            this.settings = {
                theme: 'dark',
                liveStats: true,
                language: 'en',
                sound: true,
                music: false,
                soundVolume: 80,
                musicVolume: 50,
                difficulty: 'medium',
                timer: 60,
                showErrors: true,
                skipWords: true,
                keyboardLayout: 'qwerty',
                virtualKeyboard: false,
                keyHints: true,
                errorSound: true
            };
            console.log('✅ Default settings initialized:', this.settings);
        }
        this.applyTheme();
        this.applySoundSettings();
        this.applyGameplaySettings();
    }

    applyGameplaySettings() {
        // Apply error display visibility
        const errorStatItem = document.querySelector('#errors')?.parentElement;
        if (errorStatItem) {
            errorStatItem.style.display = this.settings.showErrors !== false ? 'flex' : 'none';
        }
        
        console.log('🎮 Gameplay settings applied:', {
            difficulty: this.settings.difficulty,
            timer: this.settings.timer,
            showErrors: this.settings.showErrors,
            liveStats: this.settings.liveStats
        });
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
        
        // Load Supabase profile data if available
        this.loadSupabaseProfile();
    }

    async loadSupabaseProfile() {
        try {
            // Import Supabase functions
            const { getCurrentUser, getProfile } = await import('../supabase.js');
            
            const user = await getCurrentUser();
            if (!user) {
                console.log('No user logged in');
                return;
            }
            
            const profile = await getProfile(user.id);
            
            if (profile) {
                console.log('✅ Loaded profile:', profile);
                
                // Update username everywhere
                const username = profile.username || user.email.split('@')[0];
                
                // Update all profile name elements
                const profileNameElements = document.querySelectorAll('#profile-name, .profile-username, .user-name');
                profileNameElements.forEach(el => {
                    if (el) el.textContent = username;
                });
                
                // Update profile stats
                const avgWpmEl = document.getElementById('avg-wpm');
                const bestAccuracyEl = document.getElementById('best-accuracy');
                const totalGamesEl = document.getElementById('total-games');
                
                if (avgWpmEl) {
                    avgWpmEl.textContent = profile.best_wpm || 0;
                }
                if (bestAccuracyEl) {
                    bestAccuracyEl.textContent = (profile.average_accuracy || 0).toFixed(1) + '%';
                }
                if (totalGamesEl) {
                    totalGamesEl.textContent = profile.total_tests || 0;
                }
                
                // Store in app user object for local access
                this.user.name = username;
                this.user.stats.bestWPM = profile.best_wpm || 0;
                this.user.stats.avgAccuracy = profile.average_accuracy || 0;
                this.user.stats.totalGames = profile.total_tests || 0;
                this.user.stats.totalTime = profile.total_time || 0;
                
                // Update local storage
                this.saveUserData();
            }
        } catch (error) {
            console.error('Error loading Supabase profile:', error);
        }
    }
    
    // Public method to refresh profile (can be called from anywhere)
    async refreshProfile() {
        console.log('🔄 Manually refreshing profile...');
        await this.loadSupabaseProfile();
    }
    
    // Handle user logout
    async handleLogout() {
        try {
            console.log('🚪 Logging out...');
            
            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('❌ Logout error:', error);
                alert('Failed to logout. Please try again.');
                return;
            }
            
            // Clear local storage
            localStorage.removeItem('quickkeys-user');
            localStorage.removeItem('quickKeysSettings');
            
            // Reset auth state
            this.isLoggedIn = false;
            this.currentUser = null;
            
            console.log('✅ Logged out successfully');
            
            // Redirect to login page
            window.location.href = 'login.html';
        } catch (error) {
            console.error('❌ Logout failed:', error);
            alert('An error occurred during logout.');
        }
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
        
        // Update UI based on login status
        this.updateAuthUI();
    }
    
    updateAuthUI() {
        const logoutBtn = document.getElementById('logout-btn');
        const profileLink = document.querySelector('a[href="profile.html"]');
        const profileNameEl = document.getElementById('profile-name');
        
        if (this.isLoggedIn) {
            // Show logout button
            if (logoutBtn) logoutBtn.style.display = 'block';
            
            // Update profile name display
            if (profileNameEl && this.user.name) {
                profileNameEl.textContent = this.user.name;
                profileNameEl.style.display = 'block';
            }
        } else {
            // Hide logout button for guests
            if (logoutBtn) logoutBtn.style.display = 'none';
            
            // Show guest indicator
            if (profileNameEl) {
                profileNameEl.textContent = 'Guest Mode';
                profileNameEl.style.display = 'block';
            }
            
            // Redirect profile link to login
            if (profileLink) {
                profileLink.addEventListener('click', (e) => {
                    if (!this.isLoggedIn) {
                        e.preventDefault();
                        alert('Please login to view your profile.');
                        window.location.href = 'login.html';
                    }
                });
            }
        }
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

        // Show new screen immediately
        const newScreenEl = document.getElementById(`${screenId}-screen`);
        if (newScreenEl) {
            newScreenEl.classList.add('active');
            this.currentScreen = screenId;
        }

        // Update navigation immediately
        this.updateNavigation();

        // Screen-specific initialization - run immediately
        requestAnimationFrame(() => {
            this.initializeScreen(screenId);
        });
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
        // Navigation - use delegation for better performance
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-screen]');
            if (target && target.dataset.screen) {
                e.preventDefault();
                this.showScreen(target.dataset.screen);
                return;
            }
        }, { passive: false });

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

        // Help toggle
        document.getElementById('help-toggle')?.addEventListener('click', () => {
            const helpModal = document.getElementById('help-modal');
            if (helpModal) {
                helpModal.style.display = 'flex';
                setTimeout(() => helpModal.classList.add('active'), 10);
            }
        });
        
        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await this.handleLogout();
        });

        // Close help modal
        document.getElementById('close-help')?.addEventListener('click', () => {
            const helpModal = document.getElementById('help-modal');
            if (helpModal) {
                helpModal.classList.remove('active');
                setTimeout(() => helpModal.style.display = 'none', 300);
            }
        });

        // Click outside to close help modal
        document.getElementById('help-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'help-modal') {
                const helpModal = document.getElementById('help-modal');
                helpModal.classList.remove('active');
                setTimeout(() => helpModal.style.display = 'none', 300);
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

        // Game controls - optimized for instant response
        document.addEventListener('click', (e) => {
            const clickedElement = e.target.closest('#start-btn, #submit-btn, #retry-btn');
            
            if (clickedElement) {
                e.preventDefault();
                e.stopPropagation();
                
                const btnId = clickedElement.id;
                
                if (btnId === 'start-btn') {
                    // Check if game is currently running
                    if (this.game && this.game.gameStarted && !this.game.gameEnded) {
                        this.game.endGame('stopped');
                        return;
                    }
                    
                    // Check if we have active custom game data
                    if (this.activeCustomText && this.activeCustomSettings) {
                        if (this.game) {
                            this.game.startCustomGame(this.activeCustomText, this.activeCustomSettings);
                        }
                    } else if (this.game && this.game.isCustomGame) {
                        if (this.game.gameStarted) {
                        this.game.endGame('stopped');
                        }
                    } else {
                        if (this.game) {
                            this.game.startGame();
                        }
                    }
                } else if (btnId === 'submit-btn') {
                    if (this.game) {
                        this.game.submitGame();
                    }
                } else if (btnId === 'retry-btn') {
                    if (this.game) {
                        this.game.resetGame();
                    }
                }
                return;
            }
        }, { passive: false });

        // Custom mode - optimized
        document.addEventListener('click', (e) => {
            const customBtn = e.target.closest('#start-custom, #save-custom, #share-custom');
            if (customBtn) {
                e.preventDefault();
                const btnId = customBtn.id;
                if (btnId === 'start-custom') {
                    this.startCustomGame();
                } else if (btnId === 'save-custom') {
                    this.saveCustomChallenge();
                } else if (btnId === 'share-custom') {
                    this.shareCustomChallenge();
                }
                return;
            }
        }, { passive: false });

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

        // Modal controls - optimized
        document.addEventListener('click', (e) => {
            const modalBtn = e.target.closest('#close-results, #home-btn, #share-btn');
            if (modalBtn) {
                e.preventDefault();
                const btnId = modalBtn.id;
                if (btnId === 'close-results') {
                    this.closeResultsModal();
                } else if (btnId === 'home-btn') {
                    this.goHome();
                } else if (btnId === 'share-btn') {
                    this.shareScore();
                }
                return;
            }
        }, { passive: false });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC to go home
            if (e.key === 'Escape') {
                if (this.currentScreen !== 'home') {
                    const modal = document.getElementById('results-modal');
                    if (modal && modal.classList.contains('active')) {
                        this.closeResultsModal();
                    } else {
                        this.showScreen('home');
                    }
                }
            }
            
            // Ctrl+R or R to retry (when results modal is open)
            if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey) {
                const modal = document.getElementById('results-modal');
                if (modal && modal.classList.contains('active')) {
                    e.preventDefault();
                    this.retryGame();
                }
            }
            
            // Enter to start game (when on single player screen and game not started)
            if (e.key === 'Enter' && this.currentScreen === 'single-player') {
                if (this.game && !this.game.gameStarted) {
                    e.preventDefault();
                    const startBtn = document.getElementById('start-btn');
                    if (startBtn && !startBtn.disabled) {
                        startBtn.click();
                    }
                }
            }
            
            // S for sound toggle (Ctrl+S)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                document.getElementById('sound-toggle').click();
            }
            
            // T for theme toggle (Ctrl+T)
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                document.getElementById('theme-toggle').click();
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
        if (!modal) {
            console.error('Results modal not found!');
            return;
        }
        
        // Update modal content
        const wpmEl = document.getElementById('final-wpm');
        const accuracyEl = document.getElementById('final-accuracy');
        const errorsEl = document.getElementById('final-errors');
        const timeEl = document.getElementById('final-time');
        
        if (wpmEl) wpmEl.textContent = results.wpm;
        if (accuracyEl) accuracyEl.textContent = results.accuracy + '%';
        if (errorsEl) errorsEl.textContent = results.errors;
        if (timeEl) timeEl.textContent = results.time + 's';
        
        // Update username in modal if element exists
        const usernameEl = modal.querySelector('.result-username');
        if (usernameEl && this.user.name) {
            usernameEl.textContent = this.user.name;
        }
        
        // Update modal title based on completion reason
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) {
            if (results.reason === 'completed') {
                modalTitle.textContent = '🎉 Excellent Work!';
            } else if (results.reason === 'submitted') {
                modalTitle.textContent = '✅ Game Submitted!';
            } else if (results.reason === 'timeout') {
                modalTitle.textContent = '⏰ Time\'s Up!';
            } else if (results.reason === 'stopped') {
                modalTitle.textContent = '⏹️ Game Stopped';
            }
        }
        
        // Show modal immediately
        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
        
        // Play completion sound
        if (results.reason === 'completed') {
            this.playSound('complete');
        }
        
        // Show login prompt for guest users
        if (!this.isLoggedIn) {
            this.showGuestLoginPrompt(modal);
        }
    }
    
    showGuestLoginPrompt(modal) {
        // Check if prompt already exists
        let promptEl = modal.querySelector('.guest-login-prompt');
        if (promptEl) {
            promptEl.style.display = 'block';
            return;
        }
        
        // Create login prompt element
        promptEl = document.createElement('div');
        promptEl.className = 'guest-login-prompt';
        promptEl.innerHTML = `
            <div class="prompt-icon">💾</div>
            <p class="prompt-text">Sign in to save your progress and track your stats!</p>
            <button class="prompt-login-btn" onclick="window.location.href='login.html'">
                <i class="fas fa-sign-in-alt"></i> Sign In
            </button>
        `;
        
        // Insert before action buttons
        const actionButtons = modal.querySelector('.modal-buttons');
        if (actionButtons) {
            actionButtons.parentNode.insertBefore(promptEl, actionButtons);
        }
    }

    closeResultsModal() {
        const modal = document.getElementById('results-modal');
        if (!modal) return;
        
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200);
    }

    retryGame() {
        this.closeResultsModal();
        if (this.game) {
            this.game.resetGame();
            // Auto-start immediately
            requestAnimationFrame(() => {
                this.game.startGame();
            });
        }
    }

    goHome() {
        this.closeResultsModal();
        this.showScreen('home');
        if (this.game) {
            this.game.resetGame();
        }
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
        
        // Create audio context if it doesn't exist
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Different sounds for different actions
        switch(type) {
            case 'keypress':
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.05);
                break;
            case 'start':
                oscillator.frequency.value = 523.25; // C5
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.3);
                break;
            case 'complete':
                // Success sound - ascending notes
                [523.25, 659.25, 783.99].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2);
                    osc.start(ctx.currentTime + i * 0.1);
                    osc.stop(ctx.currentTime + i * 0.1 + 0.2);
                });
                break;
            case 'timeout':
            case 'stop':
                oscillator.frequency.value = 200;
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.4);
                break;
            case 'click':
                oscillator.frequency.value = 600;
                gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.1);
                break;
            default:
                oscillator.frequency.value = 440;
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.1);
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.quick-notification');
        existing.forEach(el => el.remove());
        
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = 'quick-notification';
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const colors = {
            success: 'var(--success)',
            error: 'var(--danger)',
            warning: 'var(--warning)',
            info: 'var(--accent-primary)'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--surface-secondary);
            border-left: 4px solid ${colors[type] || colors.info};
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
            box-shadow: var(--shadow-dark);
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: 'Inter', sans-serif;
        `;
        
        notification.innerHTML = `
            <i class=\"fas ${icons[type] || icons.info}\" style=\"color: ${colors[type] || colors.info}; font-size: 1.2rem;\"></i>
            <span style=\"flex: 1;\">${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Play notification sound
        this.playSound('click');
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
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
    
    // Refresh profile when window gains focus (user returns from profile page)
    window.addEventListener('focus', () => {
        if (window.quickKeysApp) {
            console.log('🔄 Window focused - refreshing profile data...');
            window.quickKeysApp.loadSupabaseProfile();
        }
    });
    
    // Also refresh on page show (handles back button)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted && window.quickKeysApp) {
            console.log('🔄 Page shown from cache - refreshing profile data...');
            window.quickKeysApp.loadSupabaseProfile();
        }
    });
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
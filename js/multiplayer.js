// QuickKeys - Enhanced Multiplayer Mode with Socket.IO Integration
class MultiplayerGame {
    constructor(app) {
        this.app = app;
        this.socket = null;
        this.gameRoom = null;
        this.playerId = null;
        this.opponent = null;
        this.gameActive = false;
        this.isSearching = false;
        this.isHost = false;
        this.raceText = '';
        this.startTime = null;
        this.myProgress = 0;
        this.opponentProgress = 0;
        this.myWPM = 0;
        this.opponentWPM = 0;
        this.myAccuracy = 100;
        this.opponentAccuracy = 95;
        this.myCharactersTyped = 0;
        this.opponentCharactersTyped = 0;
        this.myTypedText = '';
        this.matchResult = null;
        this.statsInterval = null;
        
        this.setupEventListeners();
        this.initializeSocketConnection();
    }

    initializeSocketConnection() {
        // Socket.IO connection setup for real multiplayer
        try {
            // Uncomment the following lines when Socket.IO server is available
            // this.socket = io('http://localhost:3000');
            // this.setupSocketHandlers();
            
            console.log('Socket.IO integration ready (server simulation mode)');
        } catch (error) {
            console.log('Running in offline mode with bot simulation');
        }
    }

    setupEventListeners() {
        // Find match button
        const findMatchBtn = document.getElementById('find-match-btn');
        if (findMatchBtn) {
            findMatchBtn.addEventListener('click', () => this.findMatch());
        }

        // Back to lobby button
        const backToLobbyBtn = document.getElementById('back-to-lobby-btn');
        if (backToLobbyBtn) {
            backToLobbyBtn.addEventListener('click', () => this.backToLobby());
        }
    }

    findMatch() {
        if (this.isSearching) return;

        this.isSearching = true;
        this.showSearchingIndicator(true);

        // Show searching notification
        this.app.showNotification('🔍 Searching for opponent...', 'info');

        // Simulate finding a match after 2-5 seconds for demo
        const searchTime = 2000 + Math.random() * 3000;
        setTimeout(() => {
            this.simulateMatchFound();
        }, searchTime);
    }

    showSearchingIndicator(searching) {
        const text = searching ? 'Searching...' : 'Find a Match';
        const disabled = searching;
        
        const findMatchBtn = document.getElementById('find-match-btn');
        if (findMatchBtn) {
            findMatchBtn.innerHTML = `<i class="fas fa-search"></i> ${text}`;
            findMatchBtn.disabled = disabled;
            
            if (searching) {
                findMatchBtn.style.animation = 'pulse 1.5s infinite';
            } else {
                findMatchBtn.style.animation = '';
            }
        }
    }

    simulateMatchFound() {
        this.isSearching = false;
        this.showSearchingIndicator(false);
        
        // Generate realistic opponent data
        this.opponent = {
            id: 'bot_' + Math.random().toString(36).substr(2, 9),
            username: this.generateBotName(),
            avatar: this.generateBotAvatar(),
            avgWPM: Math.floor(Math.random() * 60) + 40, // 40-100 WPM
            gamesPlayed: Math.floor(Math.random() * 500) + 50,
            winRate: Math.floor(Math.random() * 40) + 30 // 30-70% win rate
        };
        
        this.gameRoom = 'room_' + Math.random().toString(36).substr(2, 9);
        this.playerId = 'player_' + Math.random().toString(36).substr(2, 9);
        this.isHost = true;
        
        console.log('Match found! Opponent:', this.opponent.username);
        this.app.showNotification(`🎯 Match found! You'll face ${this.opponent.username}`, 'success');
        
        // Start multiplayer game after short delay
        setTimeout(() => {
            this.startMultiplayerGame();
        }, 1000);
    }

    generateBotName() {
        const prefixes = ['Speed', 'Quick', 'Fast', 'Rapid', 'Swift', 'Turbo', 'Lightning', 'Blazing'];
        const suffixes = ['Typer', 'Keys', 'Fingers', 'Racer', 'Master', 'Ninja', 'Pro', 'Ace'];
        const numbers = ['42', '99', '2K', 'X', '007', '88', '77'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const number = numbers[Math.floor(Math.random() * numbers.length)];
        
        return `${prefix}${suffix}${number}`;
    }

    generateBotAvatar() {
        const avatars = ['🤖', '👾', '🚀', '⚡', '🔥', '💨', '🎯', '🏆', '⭐', '💎'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    startMultiplayerGame() {
        // Hide lobby and show game interface
        const lobby = document.getElementById('multiplayer-lobby');
        const game = document.getElementById('multiplayer-game');
        
        if (lobby) lobby.style.display = 'none';
        if (game) game.style.display = 'block';
        
        // Update player displays with enhanced information
        this.updatePlayerDisplay('player1', {
            username: this.app.user.name,
            avatar: '👤',
            avgWPM: this.app.user.stats.avgWPM || 45,
            gamesPlayed: this.app.user.stats.totalGames || 0,
            winRate: this.calculateWinRate()
        });
        
        this.updatePlayerDisplay('player2', this.opponent);
        
        // Generate and display race text
        this.generateRaceText();
        
        // Show match setup phase
        this.showMatchSetup();
        
        // Start countdown after setup phase
        setTimeout(() => {
            this.startCountdown();
        }, 3000);
    }

    calculateWinRate() {
        const totalGames = this.app.user.stats.totalGames || 0;
        const gamesWon = this.app.user.stats.gamesWon || 0;
        return totalGames > 0 ? Math.round((gamesWon / totalGames) * 100) : 0;
    }

    updatePlayerDisplay(playerId, playerData) {
        const nameEl = document.getElementById(`${playerId}-name`);
        const avatarEl = document.querySelector(`#${playerId}-panel .player-avatar`);
        const wpmEl = document.getElementById(`${playerId}-wpm`);
        const accuracyEl = document.getElementById(`${playerId}-accuracy`);
        const progressEl = document.getElementById(`${playerId}-progress`);
        const statsEl = document.querySelector(`#${playerId}-panel .player-stats`);
        
        if (nameEl) nameEl.textContent = playerData.username;
        if (avatarEl) avatarEl.textContent = playerData.avatar;
        if (wpmEl) wpmEl.textContent = '0 WPM';
        if (accuracyEl) accuracyEl.textContent = '100%';
        if (progressEl) progressEl.textContent = '0%';
        
        // Add enhanced stats display
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Avg Speed:</span>
                    <span class="stat-value">${playerData.avgWPM} WPM</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Games:</span>
                    <span class="stat-value">${playerData.gamesPlayed}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Win Rate:</span>
                    <span class="stat-value">${playerData.winRate || 0}%</span>
                </div>
            `;
        }
    }

    showMatchSetup() {
        const setupEl = document.querySelector('.match-setup');
        if (setupEl) {
            setupEl.style.display = 'block';
            setupEl.innerHTML = `
                <div class="setup-content">
                    <h3>🎯 Match Setup</h3>
                    <p>Preparing race environment...</p>
                    <div class="setup-progress">
                        <div class="setup-bar"></div>
                    </div>
                    <div class="setup-details">
                        <div>Room ID: ${this.gameRoom}</div>
                        <div>Players: 2/2</div>
                    </div>
                </div>
            `;
            
            // Animate setup progress
            setTimeout(() => {
                const bar = setupEl.querySelector('.setup-bar');
                if (bar) {
                    bar.style.width = '100%';
                    bar.style.background = 'var(--gradient-primary)';
                }
            }, 500);
            
            // Hide setup after completion
            setTimeout(() => {
                setupEl.style.display = 'none';
            }, 2800);
        }
    }

    generateRaceText() {
        const raceTexts = [
            "The five boxing wizards jump quickly into the ring with great excitement and energy as the crowd cheers loudly from the stands.",
            "Pack my box with five dozen liquor jugs for the upcoming celebration party tonight where everyone will gather together.",
            "How vexingly quick daft zebras jump when surprised by loud noises in the wild savanna during the hot summer months.",
            "The quick brown fox jumps over the lazy dog while the sun shines brightly overhead on this beautiful spring morning.",
            "Jackdaws love my big sphinx of quartz that sits proudly in the garden center among the colorful flowers and plants.",
            "Programming requires patience, practice, and persistence to master the complex algorithms and data structures effectively.",
            "Artificial intelligence is transforming technology and creating new opportunities for innovation across many industries worldwide.",
            "Climate change presents significant challenges that require immediate action and sustainable solutions for future generations.",
            "Scientists discovered that quantum computing could revolutionize cryptography and solve complex mathematical problems efficiently.",
            "Modern web development frameworks enable developers to create dynamic and responsive user interfaces with advanced functionality."
        ];
        
        this.raceText = raceTexts[Math.floor(Math.random() * raceTexts.length)];
        
        // Update race text display with enhanced formatting
        const raceTextEl = document.getElementById('race-text');
        if (raceTextEl) {
            raceTextEl.innerHTML = this.formatRaceText(this.raceText);
        }
        
        // Send text to other players via Socket.IO (when available)
        if (this.socket && this.isHost) {
            this.socket.emit('race-text', {
                room: this.gameRoom,
                text: this.raceText
            });
        }
        
        console.log('Race text generated:', this.raceText.substring(0, 50) + '...');
    }

    formatRaceText(text) {
        // Format text with character-level highlighting support
        return text.split('').map((char, index) => 
            `<span class="char-pending" data-index="${index}">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
    }

    startCountdown() {
        let count = 3;
        const countdownEl = document.getElementById('countdown');
        const raceInput = document.getElementById('race-input');
        
        if (countdownEl) countdownEl.style.display = 'flex';
        if (raceInput) {
            raceInput.disabled = true;
            raceInput.placeholder = 'Wait for countdown...';
            raceInput.value = '';
        }
        
        const countdownInterval = setInterval(() => {
            const numberEl = countdownEl ? countdownEl.querySelector('.countdown-number') : null;
            
            if (count > 0) {
                if (numberEl) {
                    numberEl.textContent = count;
                    numberEl.style.animation = 'none';
                    // Trigger reflow
                    numberEl.offsetHeight;
                    numberEl.style.animation = 'countdown-pulse 1s ease-in-out';
                }
                this.app.playSound('countdown');
                count--;
            } else {
                if (numberEl) {
                    numberEl.textContent = 'GO!';
                    numberEl.style.color = 'var(--success)';
                }
                this.app.playSound('start');
                
                setTimeout(() => {
                    if (countdownEl) countdownEl.style.display = 'none';
                    this.startRace();
                }, 1000);
                
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    startRace() {
        this.gameActive = true;
        this.startTime = Date.now();
        this.myProgress = 0;
        this.opponentProgress = 0;
        this.myCharactersTyped = 0;
        this.myTypedText = '';
        this.myWPM = 0;
        this.opponentWPM = 0;
        
        const raceInput = document.getElementById('race-input');
        if (raceInput) {
            raceInput.disabled = false;
            raceInput.placeholder = 'Start typing the text above...';
            raceInput.value = '';
            raceInput.focus();
        }
        
        // Set up real-time input handling
        this.setupRaceInput();
        
        // Start bot simulation for opponent
        this.simulateBotTyping();
        
        // Initialize progress displays
        this.updateProgressDisplay();
        
        console.log('🏁 Race started! Time:', new Date(this.startTime));
    }

    setupRaceInput() {
        const raceInput = document.getElementById('race-input');
        if (!raceInput) return;
        
        // Remove existing listeners to prevent duplicates
        raceInput.removeEventListener('input', this.boundHandleInput);
        raceInput.removeEventListener('keydown', this.boundHandleKeydown);
        
        // Bind methods to maintain 'this' context
        this.boundHandleInput = this.handleRaceInput.bind(this);
        this.boundHandleKeydown = this.handleRaceKeydown.bind(this);
        
        // Add event listeners
        raceInput.addEventListener('input', this.boundHandleInput);
        raceInput.addEventListener('keydown', this.boundHandleKeydown);
        
        // Start live stats update interval
        this.statsInterval = setInterval(() => {
            this.updateLiveStats();
        }, 100); // Update every 100ms for smooth experience
    }

    handleRaceInput(event) {
        if (!this.gameActive) return;
        
        const inputValue = event.target.value;
        const targetText = this.raceText;
        
        // Prevent typing beyond the target text length
        if (inputValue.length > targetText.length) {
            event.target.value = inputValue.substring(0, targetText.length);
            return;
        }
        
        // Update game state
        this.myTypedText = inputValue;
        this.myCharactersTyped = inputValue.length;
        
        // Calculate progress percentage
        this.myProgress = (inputValue.length / targetText.length) * 100;
        
        // Update visual feedback
        this.updateTypingFeedback(inputValue, targetText);
        
        // Update progress displays
        this.updateProgressDisplay();
        
        // Send progress to other players via Socket.IO
        this.sendProgress();
        
        // Check for race completion
        if (this.checkRaceCompletion(inputValue, targetText)) {
            this.completeRace(true);
        }
        
        // Play typing sound
        this.app.playSound('keypress');
    }

    handleRaceKeydown(event) {
        // Prevent tab from changing focus during race
        if (event.key === 'Tab') {
            event.preventDefault();
        }
        
        // Handle escape key for pause functionality
        if (event.key === 'Escape') {
            event.preventDefault();
            this.pauseRace();
        }
        
        // Handle enter key for early submission
        if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            this.completeRace(true);
        }
    }

    updateTypingFeedback(typed, target) {
        const raceTextEl = document.getElementById('race-text');
        if (!raceTextEl) return;
        
        let formattedText = '';
        let correctChars = 0;
        let totalErrors = 0;
        
        for (let i = 0; i < target.length; i++) {
            const char = target[i];
            const typedChar = typed[i];
            
            if (i < typed.length) {
                if (typedChar === char) {
                    formattedText += `<span class="char-correct">${char === ' ' ? '&nbsp;' : char}</span>`;
                    correctChars++;
                } else {
                    formattedText += `<span class="char-incorrect">${char === ' ' ? '&nbsp;' : char}</span>`;
                    totalErrors++;
                }
            } else if (i === typed.length) {
                formattedText += `<span class="char-current">${char === ' ' ? '&nbsp;' : char}</span>`;
            } else {
                formattedText += `<span class="char-pending">${char === ' ' ? '&nbsp;' : char}</span>`;
            }
        }
        
        raceTextEl.innerHTML = formattedText;
        
        // Calculate and update accuracy
        this.myAccuracy = typed.length > 0 ? (correctChars / typed.length) * 100 : 100;
        this.totalErrors = totalErrors;
    }

    updateLiveStats() {
        if (!this.gameActive || !this.startTime) return;
        
        const timeElapsed = (Date.now() - this.startTime) / 1000;
        const timeElapsedMinutes = timeElapsed / 60;
        
        // Calculate WPM for player (assuming 5 characters per word)
        const wordsTyped = this.myCharactersTyped / 5;
        this.myWPM = timeElapsedMinutes > 0 ? Math.round(wordsTyped / timeElapsedMinutes) : 0;
        
        // Update player 1 UI displays
        const player1WpmEl = document.getElementById('player1-wpm');
        const player1AccuracyEl = document.getElementById('player1-accuracy');
        const player1ProgressEl = document.getElementById('player1-progress');
        
        if (player1WpmEl) player1WpmEl.textContent = `${this.myWPM} WPM`;
        if (player1AccuracyEl) player1AccuracyEl.textContent = `${Math.round(this.myAccuracy)}%`;
        if (player1ProgressEl) player1ProgressEl.textContent = `${Math.round(this.myProgress)}%`;
        
        // Update opponent stats (from bot simulation)
        const player2WpmEl = document.getElementById('player2-wpm');
        const player2AccuracyEl = document.getElementById('player2-accuracy');
        const player2ProgressEl = document.getElementById('player2-progress');
        
        if (player2WpmEl) player2WpmEl.textContent = `${this.opponentWPM} WPM`;
        if (player2AccuracyEl) player2AccuracyEl.textContent = `${Math.round(this.opponentAccuracy)}%`;
        if (player2ProgressEl) player2ProgressEl.textContent = `${Math.round(this.opponentProgress)}%`;
    }

    checkRaceCompletion(typed, target) {
        // Check for exact match completion
        if (typed.trim() === target.trim()) return true;
        
        // Only complete if user has typed the entire text
        return typed.length >= target.length && this.myAccuracy >= 90;
    }

    sendProgress() {
        // Send progress to other players via Socket.IO (when available)
        if (this.socket) {
            this.socket.emit('typing-progress', {
                room: this.gameRoom,
                playerId: this.playerId,
                progress: this.myProgress,
                wpm: this.myWPM,
                accuracy: this.myAccuracy,
                charactersTyped: this.myCharactersTyped,
                timestamp: Date.now()
            });
        }
    }

    simulateBotTyping() {
        if (!this.gameActive) return;
        
        // Make bot speed more balanced - reduce by 20% to give player more chance
        const botAvgSpeed = Math.max(30, this.opponent.avgWPM * 0.8);
        const charsPerSecond = (botAvgSpeed * 5) / 60; // Convert WPM to chars/second
        const humanVariance = 0.25; // ±25% speed variation for more realism
        const errorRate = 0.03; // 3% error rate
        
        const botInterval = setInterval(() => {
            if (!this.gameActive) {
                clearInterval(botInterval);
                return;
            }
            
            const timeElapsed = (Date.now() - this.startTime) / 1000;
            
            // Calculate expected progress with human-like variation
            const speedVariation = 1 + (Math.random() - 0.5) * humanVariance;
            const expectedChars = Math.min(
                timeElapsed * charsPerSecond * speedVariation,
                this.raceText.length
            );
            
            // Add occasional slowdowns and pauses for realism
            const slowdownChance = 0.15; // 15% chance per update
            const pauseChance = 0.05; // 5% chance for brief pause
            let slowdownFactor = 1.0;
            
            if (Math.random() < pauseChance) {
                slowdownFactor = 0.1; // Brief pause
            } else if (Math.random() < slowdownChance) {
                slowdownFactor = 0.6; // Slowdown
            }
            
            this.opponentCharactersTyped = Math.max(0, Math.floor(expectedChars * slowdownFactor));
            this.opponentProgress = Math.min((this.opponentCharactersTyped / this.raceText.length) * 100, 100);
            
            // Calculate opponent WPM
            const timeElapsedMinutes = timeElapsed / 60;
            const wordsTyped = this.opponentCharactersTyped / 5;
            this.opponentWPM = timeElapsedMinutes > 0 ? Math.round(wordsTyped / timeElapsedMinutes) : 0;
            
            // Simulate slight accuracy variations
            this.opponentAccuracy = Math.max(92, 100 - (Math.random() * 6));
            
            // Update progress display
            this.updateProgressDisplay();
            
            // Check if bot completes the race (with small delay to prevent immediate completion)
            if (this.opponentProgress >= 100 && timeElapsed > 10) {
                clearInterval(botInterval);
                if (this.gameActive) {
                    setTimeout(() => {
                        if (this.gameActive) {
                            this.completeRace(false); // Bot wins
                        }
                    }, 500); // Small delay before declaring bot winner
                }
            }
        }, 200); // Update every 200ms for smooth but not too frequent updates
    }

    updateProgressDisplay() {
        // Update progress bars
        const player1ProgressBar = document.querySelector('#player1-panel .progress-fill');
        const player2ProgressBar = document.querySelector('#player2-panel .progress-fill');
        
        if (player1ProgressBar) {
            player1ProgressBar.style.width = `${Math.min(this.myProgress, 100)}%`;
            player1ProgressBar.style.background = this.myProgress >= 100 ? 'var(--success)' : 'var(--gradient-primary)';
        }
        
        if (player2ProgressBar) {
            player2ProgressBar.style.width = `${Math.min(this.opponentProgress, 100)}%`;
            player2ProgressBar.style.background = this.opponentProgress >= 100 ? 'var(--danger)' : 'var(--gradient-secondary)';
        }
        
        // Add visual indicators for leading player
        this.updateLeaderIndicators();
    }

    updateLeaderIndicators() {
        const player1Panel = document.getElementById('player1-panel');
        const player2Panel = document.getElementById('player2-panel');
        
        if (!player1Panel || !player2Panel) return;
        
        // Remove existing leader classes
        player1Panel.classList.remove('leading', 'trailing');
        player2Panel.classList.remove('leading', 'trailing');
        
        // Add leader indicators
        if (this.myProgress > this.opponentProgress) {
            player1Panel.classList.add('leading');
            player2Panel.classList.add('trailing');
        } else if (this.opponentProgress > this.myProgress) {
            player2Panel.classList.add('leading');
            player1Panel.classList.add('trailing');
        }
    }

    completeRace(playerWon = null) {
        if (!this.gameActive) return;
        
        this.gameActive = false;
        clearInterval(this.statsInterval);
        
        const completionTime = (Date.now() - this.startTime) / 1000;
        const finalWPM = this.myWPM;
        
        // Disable input
        const raceInput = document.getElementById('race-input');
        if (raceInput) {
            raceInput.disabled = true;
            raceInput.style.background = 'var(--surface-secondary)';
        }
        
        // Determine winner if not specified
        if (playerWon === null) {
            playerWon = this.myProgress >= this.opponentProgress;
        }
        
        // Play completion sound
        this.app.playSound(playerWon ? 'win' : 'lose');
        
        // Show results after brief delay
        setTimeout(() => {
            this.showRaceResults(playerWon, finalWPM, completionTime);
        }, 1000);
        
        // Emit completion to other players (Socket.IO)
        this.emitRaceCompletion(playerWon, finalWPM, completionTime);
        
        console.log(`🏁 Race completed! Winner: ${playerWon ? 'Player' : 'Opponent'}, WPM: ${finalWPM}, Time: ${completionTime.toFixed(2)}s`);
    }

    showRaceResults(playerWon, wpm, time) {
        const result = {
            won: playerWon,
            wpm: wpm,
            time: time,
            accuracy: Math.round(this.myAccuracy),
            opponent: this.opponent.username,
            opponentWPM: this.opponentWPM,
            opponentAccuracy: Math.round(this.opponentAccuracy),
            charactersTyped: this.myCharactersTyped,
            totalCharacters: this.raceText.length,
            errors: this.totalErrors || 0
        };
        
        // Show enhanced multiplayer results modal
        this.app.showMultiplayerResults(result);
        
        // Update user statistics if won
        if (playerWon) {
            this.updateUserStatsForWin(wpm, Math.round(this.myAccuracy));
        }
        
        // Add rematch and new game options
        this.addPostGameOptions();
    }

    updateUserStatsForWin(wpm, accuracy) {
        // Update user statistics
        this.app.user.stats.totalGames++;
        this.app.user.stats.gamesWon++;
        this.app.user.stats.totalWPM += wpm;
        this.app.user.stats.avgWPM = Math.round(this.app.user.stats.totalWPM / this.app.user.stats.totalGames);
        this.app.user.stats.totalAccuracy += accuracy;
        this.app.user.stats.avgAccuracy = Math.round(this.app.user.stats.totalAccuracy / this.app.user.stats.totalGames);
        
        if (wpm > this.app.user.stats.bestWPM) {
            this.app.user.stats.bestWPM = wpm;
        }
        
        // Save updated stats
        this.app.saveUserData();
        
        // Show achievement if applicable
        this.checkAchievements(wmp, accuracy);
    }

    checkAchievements(wpm, accuracy) {
        const achievements = [];
        
        if (wpm >= 100) achievements.push('Speed Demon: 100+ WPM!');
        if (accuracy >= 98) achievements.push('Precision Master: 98%+ Accuracy!');
        if (this.app.user.stats.gamesWon === 1) achievements.push('First Victory!');
        if (this.app.user.stats.gamesWon === 10) achievements.push('Win Streak: 10 Victories!');
        
        achievements.forEach(achievement => {
            this.app.showNotification(`🏆 Achievement: ${achievement}`, 'success');
        });
    }

    addPostGameOptions() {
        const actionsContainer = document.querySelector('.result-modal .modal-actions');
        if (!actionsContainer) return;
        
        // Add rematch button
        const rematchBtn = document.createElement('button');
        rematchBtn.className = 'btn btn-secondary';
        rematchBtn.innerHTML = '<i class="fas fa-redo"></i> Rematch';
        rematchBtn.onclick = () => this.requestRematch();
        
        // Add new match button
        const newMatchBtn = document.createElement('button');
        newMatchBtn.className = 'btn btn-primary';
        newMatchBtn.innerHTML = '<i class="fas fa-search"></i> New Match';
        newMatchBtn.onclick = () => this.findNewMatch();
        
        actionsContainer.appendChild(rematchBtn);
        actionsContainer.appendChild(newMatchBtn);
    }

    requestRematch() {
        this.app.hideModal('result-modal');
        this.resetMultiplayer();
        
        // Simulate rematch with same opponent
        this.opponent.avgWPM += Math.floor((Math.random() - 0.5) * 10); // Slight variation
        this.startMultiplayerGame();
    }

    findNewMatch() {
        this.app.hideModal('result-modal');
        this.resetMultiplayer();
        this.backToLobby();
    }

    pauseRace() {
        if (!this.gameActive) return;
        
        this.gameActive = false;
        clearInterval(this.statsInterval);
        
        // Show pause notification
        this.app.showNotification('⏸️ Race paused. Press ESC to resume or click to continue.', 'warning');
        
        // Create resume handler
        const resumeHandler = (event) => {
            if (event.key === 'Escape' || event.type === 'click') {
                this.resumeRace();
                document.removeEventListener('keydown', resumeHandler);
                document.removeEventListener('click', resumeHandler);
            }
        };
        
        document.addEventListener('keydown', resumeHandler);
        document.addEventListener('click', resumeHandler);
    }

    resumeRace() {
        this.gameActive = true;
        
        // Restart stats interval
        this.statsInterval = setInterval(() => {
            this.updateLiveStats();
        }, 100);
        
        this.app.showNotification('▶️ Race resumed!', 'success');
    }

    backToLobby() {
        this.resetMultiplayer();
        
        const lobby = document.getElementById('multiplayer-lobby');
        const game = document.getElementById('multiplayer-game');
        
        if (lobby) lobby.style.display = 'block';
        if (game) game.style.display = 'none';
        
        console.log('Returned to multiplayer lobby');
    }

    resetMultiplayer() {
        // Reset game state
        this.gameActive = false;
        this.isSearching = false;
        this.myProgress = 0;
        this.opponentProgress = 0;
        this.myWPM = 0;
        this.opponentWPM = 0;
        this.myAccuracy = 100;
        this.opponentAccuracy = 95;
        this.myCharactersTyped = 0;
        this.opponentCharactersTyped = 0;
        this.myTypedText = '';
        this.startTime = null;
        this.opponent = null;
        this.totalErrors = 0;
        
        // Clear intervals
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
        }
        
        // Reset UI elements
        const raceInput = document.getElementById('race-input');
        if (raceInput) {
            raceInput.value = '';
            raceInput.disabled = false;
            raceInput.placeholder = 'Click "Find a Match" to start racing!';
            raceInput.style.background = '';
        }
        
        // Reset race text
        const raceTextEl = document.getElementById('race-text');
        if (raceTextEl) {
            raceTextEl.innerHTML = 'Race text will appear here when match starts...';
        }
        
        // Reset progress bars
        document.querySelectorAll('.progress-fill').forEach(bar => {
            bar.style.width = '0%';
            bar.style.background = '';
        });
        
        // Reset stat displays
        document.querySelectorAll('[id$="-wpm"]').forEach(el => {
            el.textContent = '0 WPM';
        });
        
        document.querySelectorAll('[id$="-accuracy"]').forEach(el => {
            el.textContent = '100%';
        });
        
        document.querySelectorAll('[id$="-progress"]').forEach(el => {
            el.textContent = '0%';
        });
        
        // Reset leader indicators
        document.querySelectorAll('.player-panel').forEach(panel => {
            panel.classList.remove('leading', 'trailing');
        });
        
        // Reset search button
        this.showSearchingIndicator(false);
        
        // Always show lobby when resetting
        this.showLobby();
        
        console.log('Multiplayer game reset complete');
    }

    showLobby() {
        // Ensure lobby is visible and game area is hidden
        const lobby = document.getElementById('multiplayer-lobby');
        const game = document.getElementById('multiplayer-game');
        
        if (lobby) {
            lobby.style.display = 'block';
        }
        
        if (game) {
            game.style.display = 'none';
        }
        
        // Reset find match button to center position
        const findMatchBtn = document.getElementById('find-match-btn');
        if (findMatchBtn) {
            findMatchBtn.style.display = 'flex';
            findMatchBtn.disabled = false;
        }
        
        console.log('Multiplayer lobby displayed');
    }

    // Socket.IO integration methods for real multiplayer
    setupSocketHandlers() {
        if (!this.socket) return;
        
        this.socket.on('connect', () => {
            console.log('Connected to multiplayer server');
            this.playerId = this.socket.id;
        });
        
        this.socket.on('match-found', (data) => {
            this.opponent = data.opponent;
            this.gameRoom = data.room;
            this.isHost = data.isHost;
            this.startMultiplayerGame();
        });
        
        this.socket.on('race-text', (data) => {
            this.raceText = data.text;
            const raceTextEl = document.getElementById('race-text');
            if (raceTextEl) {
                raceTextEl.innerHTML = this.formatRaceText(this.raceText);
            }
        });
        
        this.socket.on('race-start', (data) => {
            this.startTime = data.timestamp;
        });
        
        this.socket.on('typing-progress', (data) => {
            if (data.playerId !== this.playerId) {
                this.opponentProgress = data.progress;
                this.opponentWPM = data.wpm;
                this.opponentAccuracy = data.accuracy;
                this.opponentCharactersTyped = data.charactersTyped;
                this.updateProgressDisplay();
            }
        });
        
        this.socket.on('race-complete', (data) => {
            if (data.playerId !== this.playerId) {
                // Opponent finished first
                this.completeRace(false);
            }
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from multiplayer server');
            this.app.showNotification('Connection lost. Returning to lobby.', 'error');
            this.backToLobby();
        });
    }

    // Emit race completion to other players
    emitRaceCompletion(playerWon, wpm, time) {
        if (this.socket) {
            this.socket.emit('race-complete', {
                room: this.gameRoom,
                playerId: this.playerId,
                won: playerWon,
                wpm: wpm,
                accuracy: this.myAccuracy,
                time: time,
                timestamp: Date.now()
            });
        }
    }

    // Disconnect from multiplayer
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.resetMultiplayer();
    }
}
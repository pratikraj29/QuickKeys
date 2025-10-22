// QuickKeys - Game Logic JavaScript

class TypingGame {
    constructor(app) {
        this.app = app;
        this.currentText = '';
        this.currentPosition = 0;
        this.timer = null;
        this.gameStarted = false;
        this.gameEnded = false;
        this.startTime = null;
        this.typedCharacters = 0;
        this.correctCharacters = 0;
        this.errors = 0;
        this.gameTexts = this.getGameTexts();
    }

    getGameTexts() {
        return {
            easy: [
                "The quick brown fox jumps over the lazy dog.",
                "A journey of a thousand miles begins with a single step.",
                "Practice makes perfect with daily typing exercises.",
                "Simple words make reading and typing much easier.",
                "Time flies when you are having fun with games.",
                "Every expert was once a beginner at some point.",
                "Keep practicing and you will see great results.",
                "Start with short sentences and build up speed.",
                "Good habits are formed through consistent practice.",
                "Success comes to those who never give up trying."
            ],
            medium: [
                "Programming is the art of telling another human being what one wants the computer to do. It requires patience, practice, and persistence to master the craft.",
                "The butterfly effect suggests that small changes in initial conditions can result in large differences in a later state. This concept applies to many areas of life and science.",
                "Artificial intelligence is transforming the way we work, live, and interact with technology. Machine learning algorithms are becoming increasingly sophisticated and powerful.",
                "Climate change represents one of the most pressing challenges of our time. Sustainable development and renewable energy sources are crucial for our planet's future.",
                "The internet has revolutionized communication, commerce, and information sharing across the globe. Social media platforms now connect billions of people worldwide instantly.",
                "Education is the most powerful weapon which you can use to change the world. Knowledge and learning open doors to countless opportunities and possibilities.",
                "Innovation drives progress in every field of human endeavor. Creative thinking and problem-solving skills are essential for overcoming modern challenges.",
                "Technology advances at an exponential rate, changing how we live and work. Adaptation and continuous learning have become necessary skills for success."
            ],
            hard: [
                "Quantum computing leverages quantum-mechanical phenomena such as superposition and entanglement to perform calculations exponentially faster than classical computers for specific algorithms, potentially revolutionizing cryptography, optimization, and scientific simulation.",
                "Cryptographic protocols ensure secure communication in an insecure environment by utilizing mathematical algorithms that are computationally infeasible to break without the proper keys, forming the backbone of modern digital security infrastructure.",
                "Neuroscientific research has revealed that neuroplasticity allows the brain to reorganize itself by forming new neural connections throughout life, challenging previously held beliefs about brain development and opening new avenues for treating neurological disorders.",
                "Bioengineering combines principles from engineering, biology, chemistry, and physics to develop technologies and systems that interact with biological organisms for medical and research applications, pushing the boundaries of what's possible in healthcare.",
                "Sustainable architecture incorporates environmentally conscious design principles, utilizing renewable materials, energy-efficient systems, and innovative construction techniques to minimize environmental impact while maximizing functionality and aesthetic appeal.",
                "Distributed systems architecture enables applications to run across multiple computers simultaneously, providing fault tolerance, scalability, and performance benefits while introducing complex challenges in consistency, availability, and partition tolerance.",
                "Machine learning algorithms can identify patterns in vast datasets that would be impossible for humans to detect manually, enabling applications in natural language processing, computer vision, and predictive analytics across numerous industries.",
                "Blockchain technology creates immutable, decentralized ledgers that can record transactions and data across multiple nodes without requiring a central authority, potentially disrupting traditional financial and governance systems worldwide."
            ]
        };
    }

    startGame() {
        this.resetGame();
        this.setupGameText();
        this.setupGameInput();
        this.startTimer();
        this.gameStarted = true;
        this.startTime = Date.now();
        
        // Update UI
        const startBtn = document.getElementById('start-btn');
        startBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Game';
        startBtn.style.background = 'var(--error)';
        startBtn.style.borderColor = 'var(--error)';
        
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.style.display = 'inline-block';
            submitBtn.disabled = false;
        }
        
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.style.display = 'inline-block';
        }
        
        // Focus on input
        const typingInput = document.getElementById('typing-input');
        typingInput.disabled = false;
        typingInput.focus();
        
        // Show live typing indicator
        this.showLiveTypingIndicator(true);
        
        this.app.playSound('start');
    }

    startCustomGame(customText, customSettings) {
        // Store original settings
        this.originalSettings = { ...this.app.settings };
        
        // Apply custom settings
        if (customSettings) {
            this.app.settings = { ...this.app.settings, ...customSettings };
        }
        
        // Set custom text BEFORE resetting
        this.customText = customText;
        this.isCustomGame = true;
        
        // Reset game state but preserve custom text
        this.resetCustomGame();
        
        // Setup custom text display
        this.setupCustomGameText();
        this.setupGameInput();
        this.startTimer();
        this.gameStarted = true;
        this.startTime = Date.now();
        
        // Update UI
        const startBtn = document.getElementById('start-btn');
        startBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Game';
        startBtn.style.background = 'var(--error)';
        startBtn.style.borderColor = 'var(--error)';
        
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.style.display = 'inline-block';
            submitBtn.disabled = false;
        }
        
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.style.display = 'inline-block';
        }
        
        // Focus on input
        const typingInput = document.getElementById('typing-input');
        typingInput.disabled = false;
        typingInput.focus();
        
        // Show live typing indicator
        this.showLiveTypingIndicator(true);
        
        // Add custom mode indicator
        this.showCustomModeIndicator();
        
        this.app.playSound('start');
    }

    resetCustomGame() {
        this.gameStarted = false;
        this.gameEnded = false;
        this.currentPosition = 0;
        this.typedCharacters = 0;
        this.correctCharacters = 0;
        this.errors = 0;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.app.resetGameStats();
        this.app.updateGameStatsDisplay();
        
        // Update UI
        const startBtn = document.getElementById('start-btn');
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
        startBtn.style.background = '';
        startBtn.style.borderColor = '';
        startBtn.disabled = false;
        
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.style.display = 'none';
            submitBtn.disabled = true;
        }
        
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.style.display = 'inline-block';
        }
        
        const typingInput = document.getElementById('typing-input');
        typingInput.value = '';
        typingInput.disabled = true;
        
        const progressFill = document.getElementById('progress-fill');
        progressFill.style.width = '0%';
        
        // Hide live typing indicator
        this.showLiveTypingIndicator(false);
        
        // Reset timer circle
        this.resetTimerCircle();
        
        // Don't reset text display for custom games - keep the custom text
    }

    resetGame() {
        this.gameStarted = false;
        this.gameEnded = false;
        this.currentPosition = 0;
        this.typedCharacters = 0;
        this.correctCharacters = 0;
        this.errors = 0;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.app.resetGameStats();
        this.app.updateGameStatsDisplay();
        
        // Update UI
        const startBtn = document.getElementById('start-btn');
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
        startBtn.style.background = '';
        startBtn.style.borderColor = '';
        startBtn.disabled = false;
        
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.style.display = 'none';
            submitBtn.disabled = true;
        }
        
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.style.display = 'inline-block';
        }
        
        const typingInput = document.getElementById('typing-input');
        typingInput.value = '';
        typingInput.disabled = true;
        
        const textDisplay = document.getElementById('text-display');
        textDisplay.innerHTML = 'Select difficulty and click "Start Game" to begin your typing challenge!';
        
        const progressFill = document.getElementById('progress-fill');
        progressFill.style.width = '0%';
        
        // Hide live typing indicator
        this.showLiveTypingIndicator(false);
        
        // Reset timer circle
        this.resetTimerCircle();
    }

    setupGameText() {
        const difficulty = this.app.settings.difficulty;
        const texts = this.gameTexts[difficulty];
        this.currentText = texts[Math.floor(Math.random() * texts.length)];
        
        const textDisplay = document.getElementById('text-display');
        textDisplay.innerHTML = this.formatTextDisplay();
        
        this.app.gameStats.totalCharacters = this.currentText.length;
    }

    setupCustomGameText() {
        console.log('Setting up custom game text:', this.customText);
        this.currentText = this.customText;
        
        const textDisplay = document.getElementById('text-display');
        textDisplay.innerHTML = this.formatTextDisplay();
        
        this.app.gameStats.totalCharacters = this.currentText.length;
        console.log('Text display updated with custom text');
    }

    showCustomModeIndicator() {
        // Add a visual indicator that this is a custom game
        const gameHeader = document.querySelector('.game-header h2');
        if (gameHeader) {
            gameHeader.innerHTML = 'Single Player Mode <span class="custom-indicator">(Custom Text)</span>';
        }
    }

    formatTextDisplay() {
        const chars = this.currentText.split('');
        return chars.map((char, index) => {
            let className = '';
            if (index < this.currentPosition) {
                className = this.isCharacterCorrect(index) ? 'correct' : 'incorrect';
            } else if (index === this.currentPosition) {
                className = 'current';
            }
            
            const displayChar = char === ' ' ? '&nbsp;' : char;
            return `<span class="${className}">${displayChar}</span>`;
        }).join('');
    }

    isCharacterCorrect(index) {
        const typingInput = document.getElementById('typing-input');
        const typedText = typingInput.value;
        return typedText[index] === this.currentText[index];
    }

    setupGameInput() {
        const typingInput = document.getElementById('typing-input');
        
        // Remove existing event listeners
        typingInput.replaceWith(typingInput.cloneNode(true));
        const newTypingInput = document.getElementById('typing-input');
        
        newTypingInput.addEventListener('input', (e) => {
            if (!this.gameStarted || this.gameEnded) return;
            
            this.handleTyping(e);
            this.app.playSound('keypress');
        });

        newTypingInput.addEventListener('keydown', (e) => {
            if (!this.gameStarted || this.gameEnded) return;
            
            // Prevent certain keys
            if (e.key === 'Tab' || (e.ctrlKey && (e.key === 'a' || e.key === 'v' || e.key === 'c'))) {
                e.preventDefault();
            }
        });
    }

    handleTyping(e) {
        const typedText = e.target.value;
        this.typedCharacters = typedText.length;
        this.currentPosition = typedText.length;
        
        // Calculate correct characters and errors
        this.correctCharacters = 0;
        this.errors = 0;
        
        for (let i = 0; i < typedText.length && i < this.currentText.length; i++) {
            if (typedText[i] === this.currentText[i]) {
                this.correctCharacters++;
            } else {
                this.errors++;
            }
        }
        
        // Prevent typing beyond the text
        if (typedText.length > this.currentText.length) {
            e.target.value = typedText.substring(0, this.currentText.length);
            return;
        }
        
        // Update display
        this.updateTextDisplay();
        this.calculateStats();
        this.app.updateGameStatsDisplay();
        
        // Update progress information
        this.updateProgressInfo();
        
        // Check if game is complete
        if (this.currentPosition >= this.currentText.length) {
            this.endGame('completed');
        }
    }

    updateTextDisplay() {
        const textDisplay = document.getElementById('text-display');
        textDisplay.innerHTML = this.formatTextDisplay();
    }

    calculateStats() {
        if (!this.startTime) return;
        
        const timeElapsed = (Date.now() - this.startTime) / 1000; // in seconds
        const timeElapsedMinutes = timeElapsed / 60; // in minutes
        
        // Calculate WPM (assuming average word length of 5 characters)
        const wordsTyped = this.correctCharacters / 5;
        this.app.gameStats.wpm = timeElapsedMinutes > 0 ? Math.round(wordsTyped / timeElapsedMinutes) : 0;
        
        // Calculate accuracy
        this.app.gameStats.accuracy = this.typedCharacters > 0 ? 
            Math.round((this.correctCharacters / this.typedCharacters) * 100) : 100;
        
        // Update errors
        this.app.gameStats.errors = this.errors;
        
        // Update progress
        this.app.gameStats.currentPosition = this.currentPosition;
    }

    startTimer() {
        // Set timer based on difficulty and text length
        const difficulty = this.app.settings.difficulty;
        const textLength = this.currentText.length;
        
        let baseTime = 60; // Default 60 seconds
        
        // Adjust time based on difficulty and text length
        if (difficulty === 'easy') {
            baseTime = Math.max(30, Math.ceil(textLength / 8)); // ~8 chars per second for easy
        } else if (difficulty === 'medium') {
            baseTime = Math.max(45, Math.ceil(textLength / 6)); // ~6 chars per second for medium
        } else if (difficulty === 'hard') {
            baseTime = Math.max(60, Math.ceil(textLength / 4)); // ~4 chars per second for hard
        }
        
        this.app.gameStats.timeRemaining = baseTime;
        this.app.gameStats.totalTime = baseTime;
        
        this.timer = setInterval(() => {
            this.app.gameStats.timeRemaining--;
            this.app.gameStats.timeElapsed = this.app.gameStats.totalTime - this.app.gameStats.timeRemaining;
            
            if (this.app.gameStats.timeRemaining <= 0) {
                this.endGame('timeout');
            }
            
            // Update timer display with animation
            const timerElement = document.getElementById('timer');
            timerElement.textContent = this.app.gameStats.timeRemaining;
            
            // Update timer circle progress
            this.updateTimerCircle();
            
            // Warning colors for last 10 seconds
            if (this.app.gameStats.timeRemaining <= 10) {
                timerElement.style.color = 'var(--error)';
                if (this.app.gameStats.timeRemaining <= 5) {
                    timerElement.style.animation = 'pulse 0.5s infinite';
                }
            }
            
        }, 1000);
    }

    endGame(reason = 'completed') {
        this.gameEnded = true;
        this.gameStarted = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Calculate final stats
        this.calculateFinalStats();
        
        // Update user stats
        this.updateUserStats();
        
        // Disable input
        const typingInput = document.getElementById('typing-input');
        typingInput.disabled = true;
        
        // Update start button
        const startBtn = document.getElementById('start-btn');
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
        startBtn.style.background = '';
        startBtn.style.borderColor = '';
        
        // Hide submit button
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.style.display = 'none';
        }
        
        // Hide live typing indicator
        this.showLiveTypingIndicator(false);
        
        // Restore original settings if this was a custom game
        if (this.originalSettings) {
            this.app.settings = { ...this.originalSettings };
            this.originalSettings = null;
            this.customText = null;
            this.isCustomGame = false;
            
            // Remove custom mode indicator
            const gameHeader = document.querySelector('.game-header h2');
            if (gameHeader) {
                gameHeader.innerHTML = 'Single Player Mode';
            }
        }
        
        // Store result (simulate Firebase storage)
        this.storeGameResult(reason);
        
        // Show results modal
        this.showGameResults(reason);
        
        this.app.playSound(reason === 'completed' ? 'complete' : 'timeout');
    }

    submitGame() {
        if (!this.gameStarted || this.gameEnded) return;
        
        // Force end the game when user clicks submit
        this.endGame('submitted');
    }

    showLiveTypingIndicator(show) {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.style.display = show ? 'flex' : 'none';
        }
    }

    updateProgressInfo() {
        const progressPercent = document.getElementById('progress-percent');
        const charactersRemaining = document.getElementById('characters-remaining');
        
        if (progressPercent) {
            const progress = Math.round((this.currentPosition / this.currentText.length) * 100);
            progressPercent.textContent = progress + '%';
        }
        
        if (charactersRemaining) {
            const remaining = this.currentText.length - this.currentPosition;
            charactersRemaining.textContent = `${remaining} chars left`;
        }
    }

    updateTimerCircle() {
        const timerCircle = document.querySelector('.timer-circle');
        if (timerCircle && this.app.gameStats.totalTime) {
            const progress = ((this.app.gameStats.totalTime - this.app.gameStats.timeRemaining) / this.app.gameStats.totalTime) * 360;
            timerCircle.style.background = `conic-gradient(var(--accent-primary) ${progress}deg, var(--bg-secondary) 0deg)`;
        }
    }

    resetTimerCircle() {
        const timerCircle = document.querySelector('.timer-circle');
        if (timerCircle) {
            timerCircle.style.background = 'var(--bg-secondary)';
        }
        
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.style.color = '';
            timerElement.style.animation = '';
            timerElement.textContent = '60';
        }
    }

    storeGameResult(reason) {
        // Simulate storing result in Firebase
        const result = {
            userId: this.app.user.id || 'anonymous',
            username: this.app.user.name,
            wpm: this.app.gameStats.wpm,
            accuracy: this.app.gameStats.accuracy,
            errors: this.app.gameStats.errors,
            timeElapsed: this.app.gameStats.timeElapsed || this.app.gameStats.timeTaken,
            difficulty: this.app.settings.difficulty,
            textLength: this.currentText.length,
            completionReason: reason,
            timestamp: new Date().toISOString(),
            textSample: this.currentText.substring(0, 50) + '...'
        };
        
        // Store in localStorage as simulation
        const gameHistory = JSON.parse(localStorage.getItem('quickkeys-game-history') || '[]');
        gameHistory.unshift(result); // Add to beginning
        gameHistory.splice(50); // Keep only last 50 games
        localStorage.setItem('quickkeys-game-history', JSON.stringify(gameHistory));
        
        console.log('Game result stored:', result);
    }

    calculateFinalStats() {
        if (!this.startTime) return;
        
        const timeElapsed = (Date.now() - this.startTime) / 1000;
        const timeElapsedMinutes = timeElapsed / 60;
        
        // Final WPM calculation
        const wordsTyped = this.correctCharacters / 5;
        this.app.gameStats.wpm = timeElapsedMinutes > 0 ? Math.round(wordsTyped / timeElapsedMinutes) : 0;
        
        // Final accuracy
        this.app.gameStats.accuracy = this.typedCharacters > 0 ? 
            Math.round((this.correctCharacters / this.typedCharacters) * 100) : 100;
        
        // Time taken
        this.app.gameStats.timeTaken = Math.round(timeElapsed);
    }

    updateUserStats() {
        // Update user's average WPM
        const totalGames = this.app.user.stats.totalGames;
        const currentAvg = this.app.user.stats.avgWPM;
        const newWPM = this.app.gameStats.wpm;
        
        this.app.user.stats.avgWPM = Math.round(((currentAvg * totalGames) + newWPM) / (totalGames + 1));
        
        // Update best accuracy
        if (this.app.gameStats.accuracy > this.app.user.stats.bestAccuracy) {
            this.app.user.stats.bestAccuracy = this.app.gameStats.accuracy;
        }
        
        // Update total games and time
        this.app.user.stats.totalGames++;
        this.app.user.stats.totalTime += this.app.gameStats.timeTaken;
        
        // Save to localStorage
        this.app.saveUserData();
        
        // Update leaderboard if it's a good score
        this.updateLeaderboard();
    }

    updateLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('quickkeys-leaderboard') || '[]');
        
        const newEntry = {
            name: this.app.user.name,
            wpm: this.app.gameStats.wpm,
            accuracy: this.app.gameStats.accuracy,
            date: new Date().toLocaleDateString()
        };
        
        // Add to leaderboard and sort
        leaderboard.push(newEntry);
        leaderboard.sort((a, b) => b.wpm - a.wpm);
        
        // Keep only top 50 entries
        leaderboard.splice(50);
        
        localStorage.setItem('quickkeys-leaderboard', JSON.stringify(leaderboard));
    }

    showGameResults(reason) {
        const results = {
            wpm: this.app.gameStats.wpm,
            accuracy: this.app.gameStats.accuracy,
            errors: this.app.gameStats.errors,
            time: this.app.gameStats.timeElapsed || this.app.gameStats.timeTaken,
            reason: reason,
            difficulty: this.app.settings.difficulty,
            textLength: this.currentText.length,
            wordsTyped: Math.round(this.correctCharacters / 5)
        };
        
        // Update modal title based on completion reason
        const modalTitle = document.querySelector('#results-modal .modal-title');
        if (modalTitle) {
            if (reason === 'completed') {
                modalTitle.textContent = '🎉 Excellent Work!';
            } else if (reason === 'submitted') {
                modalTitle.textContent = '✅ Game Submitted!';
            } else if (reason === 'timeout') {
                modalTitle.textContent = '⏰ Time\'s Up!';
            }
        }
        
        this.app.showResultsModal(results);
    }

    // Custom Game Methods
    startCustomGame() {
        const customText = document.getElementById('custom-text').value.trim();
        const timeLimit = parseInt(document.getElementById('custom-time').value);
        
        if (!customText) {
            this.app.showNotification('Please enter some text to practice with!');
            return;
        }
        
        // Set custom text and time
        this.currentText = customText;
        this.app.gameStats.timeRemaining = timeLimit;
        
        // Switch to single player screen and start
        this.app.showScreen('single-player');
        
        // Wait for screen transition then start game
        setTimeout(() => {
            this.startGame();
        }, 300);
    }
}

// Extend the main app with game functionality
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main app to initialize
    setTimeout(() => {
        if (window.quickKeysApp) {
            window.quickKeysApp.game = new TypingGame(window.quickKeysApp);
            
            // Override game methods in main app
            window.quickKeysApp.startGame = () => {
                window.quickKeysApp.game.startGame();
            };
            
            window.quickKeysApp.submitGame = () => {
                window.quickKeysApp.game.submitGame();
            };
            
            window.quickKeysApp.resetGame = () => {
                window.quickKeysApp.game.resetGame();
            };
            
            window.quickKeysApp.startCustomGame = () => {
                window.quickKeysApp.game.startCustomGame();
            };
        }
    }, 100);
});

// Add CSS animations for game effects
const gameStyles = `
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
    }
    
    @keyframes typing-glow {
        0% { box-shadow: 0 0 5px var(--accent-primary); }
        50% { box-shadow: 0 0 20px var(--accent-primary); }
        100% { box-shadow: 0 0 5px var(--accent-primary); }
    }
    
    .typing-input:focus {
        animation: typing-glow 2s infinite;
    }
    
    .text-display .correct {
        transition: background-color 0.2s ease;
    }
    
    .text-display .incorrect {
        animation: shake 0.3s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
    }
    
    .progress-fill {
        transition: width 0.3s ease;
        background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
        animation: progress-glow 2s infinite;
    }
    
    @keyframes progress-glow {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.2); }
    }
`;

// Inject game styles
const styleSheet = document.createElement('style');
styleSheet.textContent = gameStyles;
document.head.appendChild(styleSheet);
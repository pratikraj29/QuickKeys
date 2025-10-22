/**
 * QuickKeys Background Music System
 * Handles looping background music with user controls and localStorage persistence
 */

class BackgroundMusicManager {
    constructor() {
        // Audio configuration
        this.audioPath = 'assets/audio/background.mp3';
        this.audio = null;
        this.isInitialized = false;
        this.hasUserInteracted = false;
        
        // State management
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 0.3; // Default volume (30%)
        
        // DOM elements
        this.musicToggle = null;
        this.musicIcon = null;
        
        // Load saved preferences
        this.loadPreferences();
        
        // Initialize the system
        this.init();
    }

    /**
     * Initialize the background music system
     */
    async init() {
        try {
            // Get DOM elements
            this.musicToggle = document.getElementById('music-toggle');
            this.musicIcon = document.getElementById('music-icon');
            
            if (!this.musicToggle || !this.musicIcon) {
                console.warn('Music toggle elements not found in DOM');
                return;
            }

            // Create audio element
            this.audio = new Audio(this.audioPath);
            this.audio.loop = true;
            this.audio.volume = this.volume;
            this.audio.preload = 'auto';
            
            // Setup event listeners
            this.setupEventListeners();
            this.setupAudioEventListeners();
            
            // Update UI based on current state
            this.updateUI();
            
            this.isInitialized = true;
            console.log('🎵 Background music system initialized');
            
        } catch (error) {
            console.error('Failed to initialize background music:', error);
        }
    }

    /**
     * Setup event listeners for user interactions
     */
    setupEventListeners() {
        // Music toggle button click
        this.musicToggle.addEventListener('click', () => {
            this.toggleMusic();
        });

        // Listen for first user interaction to enable autoplay
        const firstInteractionHandler = () => {
            this.hasUserInteracted = true;
            
            // If music should be playing, start it now
            if (!this.isMuted && !this.isPlaying) {
                this.playMusic();
            }
            
            // Remove listeners after first interaction
            document.removeEventListener('click', firstInteractionHandler);
            document.removeEventListener('keydown', firstInteractionHandler);
            document.removeEventListener('touchstart', firstInteractionHandler);
        };

        // Add listeners for various interaction types
        document.addEventListener('click', firstInteractionHandler);
        document.addEventListener('keydown', firstInteractionHandler);
        document.addEventListener('touchstart', firstInteractionHandler);
    }

    /**
     * Setup audio-specific event listeners
     */
    setupAudioEventListeners() {
        if (!this.audio) return;

        // Audio loaded successfully
        this.audio.addEventListener('canplaythrough', () => {
            console.log('🎵 Background music loaded successfully');
            
            // If user wants music and has interacted, start playing
            if (!this.isMuted && this.hasUserInteracted) {
                this.playMusic();
            }
        });

        // Audio started playing
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updateUI();
            console.log('🎵 Background music started');
        });

        // Audio paused
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updateUI();
            console.log('🎵 Background music paused');
        });

        // Audio ended (shouldn't happen with loop=true)
        this.audio.addEventListener('ended', () => {
            if (!this.isMuted) {
                this.playMusic(); // Restart if needed
            }
        });

        // Audio error handling
        this.audio.addEventListener('error', (e) => {
            console.error('🎵 Background music error:', e);
            this.handleAudioError();
        });
    }

    /**
     * Toggle music on/off
     */
    toggleMusic() {
        if (this.isMuted) {
            this.unmuteMusic();
        } else {
            this.muteMusic();
        }
    }

    /**
     * Start playing music
     */
    async playMusic() {
        if (!this.audio || this.isMuted || !this.hasUserInteracted) return;

        try {
            await this.audio.play();
        } catch (error) {
            console.warn('🎵 Could not play background music:', error);
            this.handleAudioError();
        }
    }

    /**
     * Pause music
     */
    pauseMusic() {
        if (!this.audio) return;
        
        this.audio.pause();
    }

    /**
     * Mute music and save preference
     */
    muteMusic() {
        this.isMuted = true;
        this.pauseMusic();
        this.savePreferences();
        this.updateUI();
        this.showNotification('🔇 Background music muted');
    }

    /**
     * Unmute music and save preference
     */
    unmuteMusic() {
        this.isMuted = false;
        
        if (this.hasUserInteracted) {
            this.playMusic();
        }
        
        this.savePreferences();
        this.updateUI();
        this.showNotification('🎵 Background music enabled');
    }

    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        
        this.savePreferences();
    }

    /**
     * Update UI elements based on current state
     */
    updateUI() {
        if (!this.musicToggle || !this.musicIcon) return;

        // Remove all state classes
        this.musicToggle.classList.remove('playing', 'muted');
        
        if (this.isMuted) {
            // Muted state
            this.musicToggle.classList.add('muted');
            this.musicIcon.className = 'fas fa-music-slash';
            this.musicToggle.title = 'Enable Background Music';
        } else if (this.isPlaying) {
            // Playing state
            this.musicToggle.classList.add('playing');
            this.musicIcon.className = 'fas fa-music';
            this.musicToggle.title = 'Disable Background Music';
        } else {
            // Ready to play state
            this.musicIcon.className = 'fas fa-music';
            this.musicToggle.title = 'Enable Background Music';
        }
    }

    /**
     * Handle audio loading or playback errors
     */
    handleAudioError() {
        console.warn('🎵 Audio error - disabling background music');
        this.isMuted = true;
        this.updateUI();
    }

    /**
     * Save user preferences to localStorage
     */
    savePreferences() {
        try {
            const preferences = {
                isMuted: this.isMuted,
                volume: this.volume
            };
            localStorage.setItem('quickkeys-music-preferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Could not save music preferences:', error);
        }
    }

    /**
     * Load user preferences from localStorage
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem('quickkeys-music-preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                this.isMuted = preferences.isMuted !== undefined ? preferences.isMuted : false;
                this.volume = preferences.volume !== undefined ? preferences.volume : 0.3;
            }
        } catch (error) {
            console.warn('Could not load music preferences:', error);
            // Use defaults
            this.isMuted = false;
            this.volume = 0.3;
        }
    }

    /**
     * Show notification to user (if notification system exists)
     */
    showNotification(message) {
        // Try to use existing notification system
        if (window.quickKeysApp && typeof window.quickKeysApp.showNotification === 'function') {
            window.quickKeysApp.showNotification(message, 'info');
        } else {
            // Fallback to console
            console.log('🎵', message);
        }
    }

    /**
     * Fade in audio gradually
     */
    async fadeIn(duration = 1000) {
        if (!this.audio || this.isMuted) return;

        return new Promise((resolve) => {
            const targetVolume = this.volume;
            const fadeStep = targetVolume / (duration / 50);
            let currentVolume = 0;

            this.audio.volume = 0;

            const fadeInterval = setInterval(() => {
                currentVolume += fadeStep;
                
                if (currentVolume >= targetVolume) {
                    this.audio.volume = targetVolume;
                    clearInterval(fadeInterval);
                    resolve();
                } else {
                    this.audio.volume = currentVolume;
                }
            }, 50);
        });
    }

    /**
     * Fade out audio gradually
     */
    async fadeOut(duration = 1000) {
        if (!this.audio) return;

        return new Promise((resolve) => {
            const startVolume = this.audio.volume;
            const fadeStep = startVolume / (duration / 50);
            let currentVolume = startVolume;

            const fadeInterval = setInterval(() => {
                currentVolume -= fadeStep;
                
                if (currentVolume <= 0) {
                    this.audio.volume = 0;
                    this.pauseMusic();
                    clearInterval(fadeInterval);
                    resolve();
                } else {
                    this.audio.volume = currentVolume;
                }
            }, 50);
        });
    }

    /**
     * Get current state for debugging
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            hasUserInteracted: this.hasUserInteracted,
            isPlaying: this.isPlaying,
            isMuted: this.isMuted,
            volume: this.volume,
            audioReady: this.audio && this.audio.readyState >= 2
        };
    }
}

// Initialize background music when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.backgroundMusic = new BackgroundMusicManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackgroundMusicManager;
}
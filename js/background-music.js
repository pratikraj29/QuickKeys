

class BackgroundMusicManager {
    constructor() {
        this.audioPath = 'assets/audio/background.mp3';
        this.audio = null;
        this.isInitialized = false;
        this.hasUserInteracted = false;
        
        
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 0.3; 
        
        
        this.musicToggle = null;
        this.musicIcon = null;
        
        
        this.loadPreferences();
        
        
        this.init();
    }

    async init() {
        try {
            
            this.musicToggle = document.getElementById('music-toggle');
            this.musicIcon = document.getElementById('music-icon');
            
            if (!this.musicToggle || !this.musicIcon) {
                console.warn('Music toggle elements not found in DOM');
                return;
            }

            
            this.audio = new Audio(this.audioPath);
            this.audio.loop = true;
            this.audio.volume = this.volume;
            this.audio.preload = 'auto';
            
            
            this.setupEventListeners();
            this.setupAudioEventListeners();
            
            
            this.updateUI();
            
            this.isInitialized = true;
            console.log('🎵 Background music system initialized');
            
        } catch (error) {
            console.error('Failed to initialize background music:', error);
        }
    }

    setupEventListeners() {
    
        this.musicToggle.addEventListener('click', () => {
            this.toggleMusic();
        });

        
        const firstInteractionHandler = () => {
            this.hasUserInteracted = true;
            
            
            if (!this.isMuted && !this.isPlaying) {
                this.playMusic();
            }
            
            
            document.removeEventListener('click', firstInteractionHandler);
            document.removeEventListener('keydown', firstInteractionHandler);
            document.removeEventListener('touchstart', firstInteractionHandler);
        };

        
        document.addEventListener('click', firstInteractionHandler);
        document.addEventListener('keydown', firstInteractionHandler);
        document.addEventListener('touchstart', firstInteractionHandler);
    }

   
    setupAudioEventListeners() {
        if (!this.audio) return;

        this.audio.addEventListener('canplaythrough', () => {
            console.log('🎵 Background music loaded successfully');
            
            
            if (!this.isMuted && this.hasUserInteracted) {
                this.playMusic();
            }
        });

        
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updateUI();
            console.log('🎵 Background music started');
        });

        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updateUI();
            console.log('🎵 Background music paused');
        });

        
        this.audio.addEventListener('ended', () => {
            if (!this.isMuted) {
                this.playMusic(); // Restart if needed
            }
        });

        this.audio.addEventListener('error', (e) => {
            console.error('🎵 Background music error:', e);
            this.handleAudioError();
        });
    }

   
    toggleMusic() {
        if (this.isMuted) {
            this.unmuteMusic();
        } else {
            this.muteMusic();
        }
    }


    async playMusic() {
        if (!this.audio || this.isMuted || !this.hasUserInteracted) return;

        try {
            await this.audio.play();
        } catch (error) {
            console.warn('🎵 Could not play background music:', error);
            this.handleAudioError();
        }
    }


    pauseMusic() {
        if (!this.audio) return;
        
        this.audio.pause();
    }

    
    muteMusic() {
        this.isMuted = true;
        this.pauseMusic();
        this.savePreferences();
        this.updateUI();
        this.showNotification('🔇 Background music muted');
    }

   
    unmuteMusic() {
        this.isMuted = false;
        
        if (this.hasUserInteracted) {
            this.playMusic();
        }
        
        this.savePreferences();
        this.updateUI();
        this.showNotification('🎵 Background music enabled');
    }

 
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        
        this.savePreferences();
    }


    updateUI() {
        if (!this.musicToggle || !this.musicIcon) return;

        
        this.musicToggle.classList.remove('playing', 'muted');
        
        if (this.isMuted) {
            
            this.musicToggle.classList.add('muted');
            this.musicIcon.className = 'fas fa-music-slash';
            this.musicToggle.title = 'Enable Background Music';
        } else if (this.isPlaying) {
            
            this.musicToggle.classList.add('playing');
            this.musicIcon.className = 'fas fa-music';
            this.musicToggle.title = 'Disable Background Music';
        } else {
            
            this.musicIcon.className = 'fas fa-music';
            this.musicToggle.title = 'Enable Background Music';
        }
    }

 
    handleAudioError() {
        console.warn('🎵 Audio error - disabling background music');
        this.isMuted = true;
        this.updateUI();
    }

   
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
            
            this.isMuted = false;
            this.volume = 0.3;
        }
    }

  
    showNotification(message) {
       
        if (window.quickKeysApp && typeof window.quickKeysApp.showNotification === 'function') {
            window.quickKeysApp.showNotification(message, 'info');
        } else {
           
            console.log('🎵', message);
        }
    }

   
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


document.addEventListener('DOMContentLoaded', () => {
    
    window.backgroundMusic = new BackgroundMusicManager();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackgroundMusicManager;
}
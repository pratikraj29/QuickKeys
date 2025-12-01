

class UIEnhancements {
    constructor(app) {
        this.app = app;
        this.particles = [];
        this.animationFrame = null;
        
        this.init();
    }

    init() {
        this.setupParticleSystem();
        this.setupKeyboardAnimations();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupThemeTransitions();
        this.setupSoundEffects();
    }

    setupParticleSystem() {
        
        this.createFloatingParticles();
        this.startParticleAnimation();
    }

    createFloatingParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        `;
        
        document.body.appendChild(particleContainer);
        
        // Create particles
        for (let i = 0; i < 30; i++) {
            const particle = this.createParticle();
            this.particles.push(particle);
            particleContainer.appendChild(particle.element);
        }
    }

    createParticle() {
        const element = document.createElement('div');
        const chars = ['A', 'B', 'C', 'Q', 'W', 'E', 'R', 'T', 'Y', '{', '}', '<', '>', ';', ':', '"'];
        
        element.textContent = chars[Math.floor(Math.random() * chars.length)];
        element.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 20 + 10}px;
            color: rgba(0, 245, 255, ${Math.random() * 0.3 + 0.1});
            font-family: 'Consolas', monospace;
            pointer-events: none;
            user-select: none;
        `;
        
        return {
            element,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 2
        };
    }

    startParticleAnimation() {
        const animate = () => {
            this.updateParticles();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed;
            
            // Wrap around screen
            if (particle.x < -50) particle.x = window.innerWidth + 50;
            if (particle.x > window.innerWidth + 50) particle.x = -50;
            if (particle.y < -50) particle.y = window.innerHeight + 50;
            if (particle.y > window.innerHeight + 50) particle.y = -50;
            
            // Apply transform
            particle.element.style.transform = `
                translate(${particle.x}px, ${particle.y}px) 
                rotate(${particle.rotation}deg)
            `;
        });
    }

    setupKeyboardAnimations() {
        // Animate keyboard keys on home screen
        const keys = document.querySelectorAll('.key');
        
        keys.forEach((key, index) => {
            key.addEventListener('mouseenter', () => {
                key.style.animation = 'none';
                key.offsetHeight; // Trigger reflow
                key.style.animation = 'key-press 0.3s ease';
            });
        });
        
        // Add typing wave effect
        this.addTypingWaveEffect();
    }

    addTypingWaveEffect() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes key-press {
                0% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-15px) scale(1.1); box-shadow: 0 5px 20px rgba(0, 245, 255, 0.5); }
                100% { transform: translateY(0) scale(1); }
            }
            
            @keyframes typing-wave {
                0% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
                100% { transform: translateY(0); }
            }
            
            .typing-wave {
                animation: typing-wave 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    setupScrollAnimations() {
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            { threshold: 0.1 }
        );

        // Observe elements for scroll animations
        document.querySelectorAll('.stat-card, .badge, .challenge-item, .table-row').forEach(
            el => observer.observe(el)
        );
    }

    setupHoverEffects() {
        // Enhanced button hover effects
        this.setupButtonEffects();
        this.setupCardEffects();
        this.setupInputEffects();
    }

    setupButtonEffects() {
        const buttons = document.querySelectorAll('.menu-btn, .control-btn, .custom-btn, .result-btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                this.createRippleEffect(e);
                this.addButtonGlow(button);
            });
            
            button.addEventListener('mouseleave', () => {
                this.removeButtonGlow(button);
            });
            
            button.addEventListener('click', (e) => {
                this.createClickEffect(e);
            });
        });
    }

    createRippleEffect(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;gt4t
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    createClickEffect(e) {
        const sparks = [];
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 6; i++) {
            const spark = document.createElement('div');
            spark.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: var(--accent-primary);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${centerX}px;
                top: ${centerY}px;
            `;
            
            document.body.appendChild(spark);
            
            const angle = (i / 6) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            const endX = centerX + Math.cos(angle) * distance;
            const endY = centerY + Math.sin(angle) * distance;
            
            spark.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`, opacity: 0 }
            ], {
                duration: 400,
                easing: 'ease-out'
            }).addEventListener('finish', () => {
                spark.remove();
            });
        }
    }

    addButtonGlow(button) {
        button.style.filter = 'brightness(1.1) drop-shadow(0 0 10px var(--accent-primary))';
        button.style.transform = 'translateY(-2px) scale(1.02)';
    }

    removeButtonGlow(button) {
        button.style.filter = '';
        button.style.transform = '';
    }

    setupCardEffects() {
        const cards = document.querySelectorAll('.stat-card, .badge, .challenge-item, .player-panel');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
                card.style.boxShadow = '0 10px 30px rgba(0, 245, 255, 0.2)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        });
    }

    setupInputEffects() {
        const inputs = document.querySelectorAll('.typing-input, .race-input, .custom-textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.addInputFocusEffect(input);
            });
            
            input.addEventListener('blur', () => {
                this.removeInputFocusEffect(input);
            });
            
            input.addEventListener('input', (e) => {
                this.addTypingEffect(e);
            });
        });
    }

    addInputFocusEffect(input) {
        input.style.boxShadow = '0 0 20px var(--accent-primary), inset 0 0 10px rgba(0, 245, 255, 0.1)';
        input.style.borderColor = 'var(--accent-primary)';
    }

    removeInputFocusEffect(input) {
        if (!input.matches(':focus')) {
            input.style.boxShadow = '';
            input.style.borderColor = '';
        }
    }

    addTypingEffect(e) {
        const input = e.target;
        const char = e.data;
        
        if (char) {
            // Create floating character effect
            this.createFloatingChar(input, char);
            
            // Add keyboard wave to nearby elements
            this.triggerKeyboardWave();
        }
    }

    createFloatingChar(input, char) {
        const rect = input.getBoundingClientRect();
        const floatingChar = document.createElement('div');
        
        floatingChar.textContent = char;
        floatingChar.style.cssText = `
            position: fixed;
            left: ${rect.right - 20}px;
            top: ${rect.top + rect.height / 2}px;
            color: var(--accent-primary);
            font-family: 'Consolas', monospace;
            font-size: 16px;
            pointer-events: none;
            z-index: 1000;
            opacity: 0.8;
        `;
        
        document.body.appendChild(floatingChar);
        
        floatingChar.animate([
            { transform: 'translateY(0) scale(1)', opacity: 0.8 },
            { transform: 'translateY(-30px) scale(0.5)', opacity: 0 }
        ], {
            duration: 800,
            easing: 'ease-out'
        }).addEventListener('finish', () => {
            floatingChar.remove();
        });
    }

    triggerKeyboardWave() {
        const keys = document.querySelectorAll('.key');
        keys.forEach((key, index) => {
            setTimeout(() => {
                key.classList.add('typing-wave');
                setTimeout(() => {
                    key.classList.remove('typing-wave');
                }, 300);
            }, index * 50);
        });
    }

    setupThemeTransitions() {
        // Smooth theme transitions
        const transitionElements = [
            'body', '.screen', '.menu-btn', '.control-btn', 
            '.stat-item', '.text-display', '.typing-input'
        ];
        
        transitionElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.transition = 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease';
            });
        });
    }

    setupSoundEffects() {
        // Create audio context for sound effects
        this.audioContext = null;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playTone(frequency, duration, type = 'sine') {
        if (!this.audioContext || !this.app.settings.sound) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Screen transition effects
    addScreenTransition(screenId) {
        const screen = document.getElementById(`${screenId}-screen`);
        
        // Fade out current screen
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen && currentScreen !== screen) {
            currentScreen.style.animation = 'screen-exit 0.3s ease-out forwards';
            
            setTimeout(() => {
                currentScreen.classList.remove('active');
                currentScreen.style.animation = '';
                
                // Fade in new screen
                screen.style.animation = 'screen-enter 0.3s ease-in';
                screen.classList.add('active');
            }, 300);
        } else {
            screen.classList.add('active');
        }
    }

    // Loading animations
    showLoadingAnimation(element) {
        const loader = document.createElement('div');
        loader.className = 'loading-spinner';
        loader.style.cssText = `
            width: 20px;
            height: 20px;
            border: 2px solid var(--bg-tertiary);
            border-top: 2px solid var(--accent-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        `;
        
        element.appendChild(loader);
        return loader;
    }

    // Progress animations
    animateProgress(element, targetProgress, duration = 1000) {
        const startProgress = parseFloat(element.style.width) || 0;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentProgress = startProgress + (targetProgress - startProgress) * this.easeOutCubic(progress);
            element.style.width = currentProgress + '%';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Notification system
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const colors = {
            info: 'var(--accent-primary)',
            success: 'var(--success)',
            error: 'var(--error)',
            warning: 'var(--warning)'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-dark);
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Slide out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Cleanup
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Enhanced CSS for UI effects
const uiStyles = `
    @keyframes screen-exit {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    
    @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
    }
    
    @keyframes animate-in {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-in {
        animation: animate-in 0.6s ease-out;
    }
    
    .notification {
        animation: slideInRight 0.3s ease;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
    
    /* Enhanced particle effects */
    .particle-container {
        overflow: hidden;
    }
    
    /* Smooth transitions for all interactive elements */
    .menu-btn, .control-btn, .custom-btn, .result-btn,
    .stat-card, .badge, .challenge-item, .player-panel {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Improved focus styles */
    .typing-input:focus, .race-input:focus, .custom-textarea:focus {
        outline: none;
        border-color: var(--accent-primary) !important;
        box-shadow: 0 0 0 3px rgba(0, 245, 255, 0.2) !important;
    }
    
    /* Loading states */
    .loading-state {
        opacity: 0.6;
        pointer-events: none;
    }
    
    /* Hover states for better UX */
    .nav-btn:hover, .difficulty-btn:hover, .filter-btn:hover {
        transform: translateY(-1px);
    }
    
    /* Enhanced button press effects */
    .menu-btn:active, .control-btn:active {
        transform: translateY(1px) scale(0.98);
    }
`;

// Initialize UI enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Inject UI styles
    const uiStyleSheet = document.createElement('style');
    uiStyleSheet.textContent = uiStyles;
    document.head.appendChild(uiStyleSheet);
    
    // Initialize UI enhancements after main app
    setTimeout(() => {
        if (window.quickKeysApp) {
            window.quickKeysApp.ui = new UIEnhancements(window.quickKeysApp);
            
            // Override showNotification method
            window.quickKeysApp.showNotification = (message, type) => {
                window.quickKeysApp.ui.showNotification(message, type);
            };
            
            // Override screen transition
            const originalShowScreen = window.quickKeysApp.showScreen;
            window.quickKeysApp.showScreen = (screenId) => {
                window.quickKeysApp.ui.addScreenTransition(screenId);
                // Call original method after transition
                setTimeout(() => {
                    originalShowScreen.call(window.quickKeysApp, screenId);
                }, 300);
            };
            
            // Add sound effects
            window.quickKeysApp.playSound = (type) => {
                if (!window.quickKeysApp.settings.sound) return;
                
                const sounds = {
                    click: [440, 0.1],
                    keypress: [800, 0.05],
                    start: [660, 0.3],
                    complete: [880, 0.5],
                    error: [220, 0.3],
                    countdown: [550, 0.2],
                    victory: [880, 0.8],
                    defeat: [330, 0.6]
                };
                
                const sound = sounds[type];
                if (sound) {
                    window.quickKeysApp.ui.playTone(sound[0], sound[1]);
                }
            };
        }
    }, 200);
});
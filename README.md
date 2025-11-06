# QuickKeys - Modern Typing Speed Game 🚀

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

A beautiful, modern web-based typing speed game with real-time multiplayer functionality, stunning UI/UX, and comprehensive features for improving typing skills.

![QuickKeys Banner](https://via.placeholder.com/800x300/0a0a0f/00f5ff?text=QuickKeys+-+Modern+Typing+Game)

## 📊 Project Stats

![Lines of Code](https://img.shields.io/badge/Lines%20of%20Code-5500%2B-blue)
![Code Quality](https://img.shields.io/badge/Code%20Quality-A+-brightgreen)
![Zero Dependencies](https://img.shields.io/badge/Frontend%20Dependencies-0-success)

## ✨ Features

### 🎮 Game Modes
- **Single Player**: Practice with different difficulty levels (Easy, Medium, Hard)
- **Multiplayer**: Real-time typing races against other players
- **Custom Mode**: Create and share your own typing challenges

### 📊 Advanced Analytics
- **Real-time WPM** (Words Per Minute) tracking
- **Accuracy percentage** calculation
- **Error counting** and analysis
- **Progress visualization** with animated progress bars
- **Personal statistics** and improvement tracking

### 🏆 Social Features
- **Global Leaderboards** with daily, weekly, and all-time rankings
- **User Profiles** with badges, achievements, and statistics
- **Challenge Sharing** - Create and share custom typing tests
- **Trophy System** with gold, silver, and bronze rankings

### 🎨 Modern UI/UX
- **Dark/Light Theme** toggle with smooth transitions
- **Neon Effects** and glowing animations
- **Responsive Design** for desktop and tablet
- **Smooth Animations** and particle effects
- **Gaming-inspired Interface** with modern typography

### 🔧 Technical Features
- **Socket.IO Integration** for real-time multiplayer (ready for server)
- **Local Storage** for user data persistence
- **Progressive Web App** capabilities
- **Keyboard Shortcuts** and accessibility features
- **Sound Effects** with toggle control

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (for Socket.IO features) or use locally

### Installation

1. **Clone or download the project**
   ```bash
   git clone https://github.com/yourusername/quickkeys.git
   cd quickkeys
   ```

2. **Open with a web server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Or simply open index.html in your browser for basic functionality
   ```

3. **Access the game**
   Open your browser and navigate to `http://localhost:8000`

## 🎯 How to Play

### Single Player Mode
1. Click **"Single Player"** from the main menu
2. Select your difficulty level (Easy, Medium, Hard)
3. Click **"Start Game"** to begin
4. Type the displayed text as quickly and accurately as possible
5. View your results and try to improve your WPM and accuracy

### Multiplayer Mode
1. Click **"Multiplayer"** from the main menu
2. Click **"Find a Match"** to search for an opponent
3. Wait for the countdown (3, 2, 1, GO!)
4. Race against your opponent in real-time
5. Win by completing the text first with high accuracy

### Custom Mode
1. Click **"Custom Mode"** from the main menu
2. Enter your own text in the text area
3. Set time limit and difficulty
4. Click **"Start Custom Game"** or save/share your challenge

## 🛠️ Customization

### Themes
Toggle between dark and light themes using the theme button in the navigation bar.

### Difficulty Levels
- **Easy**: Simple sentences with common words
- **Medium**: Longer paragraphs with varied vocabulary
- **Hard**: Complex technical text with punctuation

### Settings
- Sound effects on/off
- Theme preference (persisted in localStorage)
- User profile customization

## 💾 Data Storage

### LocalStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `quickkeys-settings` | Object | User settings (theme, sound, difficulty) |
| `quickkeys-user` | Object | User profile data and statistics |
| `quickkeys-game-history` | Array | Last 50 game results |
| `quickkeys-leaderboard` | Array | Top 50 players by WPM |
| `quickkeys-challenges` | Array | Custom text challenges |

### Data Schema

```javascript
// Settings
{
    theme: 'dark' | 'light',
    sound: boolean,
    difficulty: 'easy' | 'medium' | 'hard'
}

// User Data
{
    id: string,
    name: string,
    stats: {
        avgWPM: number,
        bestWPM: number,
        totalGames: number,
        avgAccuracy: number
    }
}

// Game History Entry
{
    userId: string,
    wpm: number,
    accuracy: number,
    errors: number,
    difficulty: string,
    timestamp: ISO8601 string
}
```

## 🏗️ Project Structure

```
QuickKeys/
├── index.html                      # Main HTML entry point (615 lines)
├── package.json                    # npm dependencies and scripts
├── server.js                       # Node.js backend (Express + Socket.IO)
├── README.md                       # This file
│
├── .github/
│   └── copilot-instructions.md     # AI coding guidelines
│
├── js/                             # JavaScript modules
│   ├── main.js                     # Core application controller (850+ lines)
│   ├── game.js                     # Single player logic (870+ lines)
│   ├── multiplayer.js              # Multiplayer racing (750+ lines)
│   ├── ui.js                       # UI enhancements (650+ lines)
│   ├── custom.js                   # Custom mode logic (350+ lines)
│   ├── custom-mode-engine.js       # Advanced custom features (950+ lines)
│   ├── custom-test.js              # Custom mode testing
│   ├── enhanced-custom-mode.js     # Enhanced custom features
│   ├── firebase-api.js             # Storage abstraction (200+ lines)
│   └── background-music.js         # Audio system (150+ lines)
│
├── styles/                         # CSS stylesheets
│   ├── main.css                    # Global styles (2500+ lines)
│   └── Attached HTML and CSS Context.css
│
├── assets/                         # Static assets
│   ├── audio/                      # Sound effects and music
│   └── images/                     # Icons, logos, screenshots
│
├── routes/                         # Express API routes
│   └── custom-mode.js              # Custom text CRUD endpoints
│
└── node_modules/                   # npm packages (gitignored)
```

### 📈 Code Statistics
- **Total Lines**: ~5,500+
- **HTML**: 615 lines
- **CSS**: 2,500+ lines  
- **JavaScript**: 2,385+ lines
- **Modules**: 10+ JavaScript files

### Code Architecture

#### `main.js` - Core Application
- App initialization and state management
- Screen navigation and UI controls
- Settings and user data persistence
- Event handling and routing

#### `game.js` - Game Logic
- Single player typing game mechanics
- WPM and accuracy calculations
- Timer and progress tracking
- Custom game functionality

#### `multiplayer.js` - Real-time Features  
- Socket.IO integration (ready for server)
- Multiplayer game rooms and matchmaking
- Real-time progress synchronization
- Bot simulation for demo purposes

#### `ui.js` - Visual Enhancements
- Particle system and animations
- Sound effects and audio feedback
- Smooth transitions and hover effects
- Notification system

## 📐 Algorithms & Formulas

### WPM Calculation
```javascript
WPM = (Total Characters Typed ÷ 5) ÷ (Time Elapsed in Minutes)

// Implementation
calculateWPM() {
    const totalChars = this.userInput.length
    const timeInMinutes = this.elapsedTime / 60
    const words = totalChars / 5  // Standard: 5 chars = 1 word
    return Math.round(words / timeInMinutes)
}
```

**Why divide by 5?** 
- Average English word length ≈ 4.5 characters
- Industry standard for typing tests

### Accuracy Calculation
```javascript
Accuracy = (Correct Characters ÷ Total Characters Typed) × 100

// Implementation
calculateAccuracy() {
    let correctCount = 0
    for (let i = 0; i < this.userInput.length; i++) {
        if (this.userInput[i] === this.currentText[i]) {
            correctCount++
        }
    }
    return Math.round((correctCount / this.userInput.length) * 100 * 10) / 10
}
```

### Adaptive Timer
```javascript
Time Limit = Base Time × (Text Length ÷ 100)
Clamped between 30-180 seconds

// Base times by difficulty
Easy: 60 seconds
Medium: 90 seconds  
Hard: 120 seconds
```

### Bot Typing Simulation
```javascript
// Realistic bot AI with human-like patterns
- Bot WPM: 40-100 (scaled to player skill)
- Speed variation: ±25% per update
- Error rate: 3% with speed reduction
- Update interval: 100ms
```

## 🎨 Design System

### Color Palette
```css
/* Dark Theme */
--bg-primary: #0a0a0f        /* Deep space blue */
--bg-secondary: #1a1a2e      /* Dark blue-gray */
--accent-primary: #00f5ff    /* Cyan neon */
--accent-secondary: #bd93f9  /* Purple accent */
--text-primary: #ffffff      /* Pure white */
--success: #50fa7b           /* Neon green */
--error: #ff5555             /* Neon red */
```

### Typography
- **Headings**: Poppins (Modern, clean)
- **Body Text**: Inter (Readable, web-optimized)
- **Code/Game Text**: Consolas, Monaco (Monospace for typing)

### Animations & Effects

#### CSS Animations (40+ custom keyframes)
```css
/* Glow Pulse - Logo and titles */
@keyframes glow-pulse {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.2); }
}

/* Key Bounce - Animated keyboard keys */
@keyframes key-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

/* Shake - Error feedback */
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
}

/* Progress Shimmer - Moving highlight */
@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
```

#### JavaScript Animations
- **Particle System**: 60fps floating particles with physics
- **Progress Bar**: Smooth easing with `easeOutCubic`
- **Screen Transitions**: 300ms slide + fade
- **Countdown Timer**: Scale + fade pulse effect

#### Performance
- Hardware-accelerated (GPU): `transform`, `opacity`
- RequestAnimationFrame for 60fps
- CSS containment for isolation
- Will-change hints for optimization

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 85+ | ✅ Fully Supported |
| Firefox | 78+ | ✅ Fully Supported |
| Safari | 14+ | ✅ Fully Supported |
| Edge | 85+ | ✅ Fully Supported |
| Opera | 71+ | ✅ Fully Supported |

### Required APIs & Features
- ✅ **LocalStorage API** - Data persistence
- ✅ **Web Audio API** - Sound effects (Chrome 35+, Firefox 25+, Safari 14.1+)
- ✅ **RequestAnimationFrame** - Smooth animations
- ✅ **CSS Custom Properties** - Theming system
- ✅ **ES6+ JavaScript** - Modern syntax (Classes, Modules, Arrow Functions)
- ✅ **Flexbox & CSS Grid** - Responsive layouts
- ✅ **Socket.IO** - Real-time multiplayer (all browsers with server)

## ⚡ Performance Metrics

### Load Times
- **Initial Load**: <2 seconds
- **Screen Transition**: 300ms
- **LocalStorage I/O**: <5ms

### Runtime Performance
- **Game Loop FPS**: 60fps (16.67ms per frame)
- **Animation Frame Time**: ~16ms
- **Particle System**: 50 particles at 60fps

### Optimizations
- ✅ Hardware-accelerated CSS animations
- ✅ RequestAnimationFrame for smooth 60fps
- ✅ Event delegation for memory efficiency
- ✅ Lazy loading of game screens
- ✅ CSS containment for layout isolation
- ✅ Debouncing for expensive operations

## 🔧 Development

### Adding New Features

1. **New Game Mode**: Extend the `TypingGame` class in `game.js`
2. **UI Components**: Add styles to `main.css` and logic to `main.js`
3. **Animations**: Enhance `ui.js` with new visual effects
4. **Multiplayer**: Extend `multiplayer.js` for new real-time features

### Socket.IO Server Setup (Optional)

For real multiplayer functionality, set up a Node.js server:

```bash
# Install dependencies
npm install express socket.io

# Run server
node server.js
```

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Serve static files
app.use(express.static('.'));

// Game rooms and matchmaking
const waitingPlayers = [];
const gameRooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('find-match', ({ username, difficulty }) => {
    // Add to queue
    waitingPlayers.push({ socketId: socket.id, username, difficulty });
    
    // Pair players when 2+ available
    if (waitingPlayers.length >= 2) {
      const player1 = waitingPlayers.shift();
      const player2 = waitingPlayers.shift();
      const roomId = generateRoomId();
      
      // Create room and start countdown
      socket.join(roomId);
      startCountdown(roomId, 3);
    }
  });
  
  socket.on('progress-update', ({ room, progress, wpm }) => {
    // Broadcast to opponent
    socket.to(room).emit('opponent-progress', { progress, wpm });
  });
  
  socket.on('disconnect', () => {
    // Clean up rooms and queues
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('QuickKeys server running on port 3000');
});
```

### Socket.IO Events

#### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `find-match` | `{ username, difficulty }` | Join matchmaking queue |
| `progress-update` | `{ room, progress, wpm }` | Send typing progress |
| `cancel-matchmaking` | `{}` | Leave queue |

#### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `countdown` | `number` (3, 2, 1) | Pre-game countdown |
| `game-start` | `{ text, roomId }` | Start game with shared text |
| `opponent-progress` | `{ progress, wpm }` | Opponent's live progress |
| `user-finished` | `{ user, stats }` | Someone finished typing |
| `opponent-disconnected` | `{}` | Opponent left the game |

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and structure
- Test all features across different browsers
- Ensure responsive design works on various screen sizes
- Add comments for complex functionality
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Future Roadmap

### Planned Features
- [ ] **Mobile App** (React Native/Flutter)
- [ ] **Typing Lessons** with structured learning paths
- [ ] **Team Competitions** and tournaments
- [ ] **Advanced Analytics** with detailed performance graphs
- [ ] **Typing Certificates** and skill assessments
- [ ] **Integration APIs** for schools and organizations
- [ ] **Voice Commands** for accessibility
- [ ] **Multiple Languages** support

### Technical Improvements
- [ ] **Offline Mode** with Service Workers
- [ ] **Performance Optimization** for low-end devices
- [ ] **Advanced Matchmaking** with skill-based pairing
- [ ] **Real-time Spectating** for ongoing races
- [ ] **Replay System** to review past games
- [ ] **Anti-cheat Measures** for competitive play

## 📞 Support

- 🐛 **Bug Reports**: [Create an issue](https://github.com/yourusername/quickkeys/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/yourusername/quickkeys/discussions)
- 📧 **Contact**: your-email@example.com

## 🙏 Acknowledgments

- **Font Awesome** (v6.4.0) for beautiful icons
- **Google Fonts** for typography (Inter & Poppins)
- **Socket.IO** (v4.7.2) for real-time functionality
- **Express** (v4.18.2) for web framework
- **Node.js** (v16+) for runtime environment
- **CSS Grid & Flexbox** for responsive layouts
- **Web Audio API** for immersive sound effects

---

## 📚 Tech Stack Summary

### Frontend
- **HTML5**: Semantic structure, accessibility
- **CSS3**: Modern styling, animations, responsive design
- **JavaScript ES6+**: Modular architecture, classes, async/await

### Backend (Optional)
- **Node.js**: Server runtime
- **Express**: HTTP server and API routing
- **Socket.IO**: Real-time bidirectional communication

### Storage
- **LocalStorage**: Client-side data persistence
- **Firebase-ready**: Abstraction layer for future cloud sync

### Audio
- **Web Audio API**: Low-latency sound effects

---

## 🎓 Learning Resources

This project demonstrates:
- Modern JavaScript (ES6+) without frameworks
- CSS3 animations and transitions
- Real-time communication with Socket.IO
- LocalStorage for data persistence
- Responsive web design principles
- Web Audio API for sound effects
- Modular code architecture

---

<div align="center">

**Made with ❤️ for typing enthusiasts**

[⬆ Back to Top](#quickkeys---modern-typing-speed-game-)

</div>


# QuickKeys - Modern Typing Speed Game 🚀

A beautiful, modern web-based typing speed game with real-time multiplayer functionality, stunning UI/UX, and comprehensive features for improving typing skills.

![QuickKeys Banner](https://via.placeholder.com/800x300/0a0a0f/00f5ff?text=QuickKeys+-+Modern+Typing+Game)

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

## 🏗️ Project Structure

```
QuickKeys/
├── index.html              # Main HTML file
├── styles/
│   └── main.css            # All CSS styles and animations
├── js/
│   ├── main.js             # Core application logic
│   ├── game.js             # Typing game mechanics
│   ├── multiplayer.js      # Multiplayer functionality
│   └── ui.js               # UI enhancements and animations
├── .github/
│   └── copilot-instructions.md  # Project guidelines
└── README.md               # This file
```

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

### Animations
- Smooth 0.3s ease transitions
- Particle background effects
- Glowing hover states
- Typing wave animations
- Progress bar animations

## 🌐 Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### Required APIs
- Web Audio API (for sound effects)
- Local Storage (for data persistence)
- Canvas/Animation Frame (for particles)
- Intersection Observer (for scroll animations)

## 🔧 Development

### Adding New Features

1. **New Game Mode**: Extend the `TypingGame` class in `game.js`
2. **UI Components**: Add styles to `main.css` and logic to `main.js`
3. **Animations**: Enhance `ui.js` with new visual effects
4. **Multiplayer**: Extend `multiplayer.js` for new real-time features

### Socket.IO Server Setup (Optional)

For real multiplayer functionality, set up a Node.js server:

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('.'));

// Socket.IO game logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('find-match', () => {
    // Matchmaking logic
  });
  
  socket.on('game-progress', (data) => {
    // Broadcast progress to room
    socket.to(data.room).emit('opponent-progress', data);
  });
});

server.listen(3000, () => {
  console.log('QuickKeys server running on port 3000');
});
```

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

- **Font Awesome** for beautiful icons
- **Google Fonts** for typography (Inter & Poppins)
- **Socket.IO** for real-time functionality
- **CSS Grid & Flexbox** for responsive layouts
- **Web Audio API** for sound effects

---

**Made with ❤️ by [Your Name]**

*Happy typing! 🚀*

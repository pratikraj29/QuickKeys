# QuickKeys - Modern Typing Speed Game 🚀

A beautiful, modern web-based typing speed game with real-time multiplayer functionality, Supabase database integration, and comprehensive features for improving typing skills.

[ HTML5](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

### 🎮 Game Modes
- **Single Player**: Practice with different difficulty levels (Easy, Medium, Hard)
- **Multiplayer**: Real-time typing races against other players
- **Custom Mode**: Create and share your own typing challenges

### 📊 Advanced Analytics & Profile System
- **Real-time WPM** tracking with live statistics
- **Accuracy percentage** calculation
- **Automatic Stats Saving** to Supabase database
- **Complete Profile System** with username, bio, and avatar
- **Progress Charts** showing WPM and accuracy history
- **Activity Feed** displaying last 10 games
- **Personal Statistics** tracking best WPM, average accuracy, total tests
- **Cloud Sync** across all devices

### 🔐 Authentication & Database
- **Supabase Integration** for user authentication
- **Profile Auto-Creation** on first login
- **Secure Login/Signup** with email verification
- **Database Storage** for all game activities
- **Avatar Upload** to Supabase Storage (5MB max)
- **Row-Level Security** policies for data protection

### 🏆 Social Features
- **Global Leaderboards** with daily, weekly, and all-time rankings
- **User Profiles** with badges, achievements, and statistics
- **Challenge Sharing** to create and share custom typing tests
- **Trophy System** with gold, silver, and bronze rankings

### 🎨 Modern UI/UX
- **Dark/Light Theme** toggle with smooth transitions
- **Neon Effects** and glowing animations
- **Responsive Design** for desktop and tablet
- **Smooth Animations** and particle effects
- **Gaming-inspired Interface** with modern typography
- **Toast Notifications** for save success/error feedback
- **Guest Mode Prompts** encouraging sign-in

### 🔧 Technical Features
- **Socket.IO Integration** for real-time multiplayer
- **Supabase Backend** for authentication and data storage
- **Local Storage Fallback** for offline functionality
- **Keyboard Shortcuts** and accessibility features
- **Sound Effects & Background Music** with toggle control
- **Auto-Save** game stats after each session

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Supabase account for database features
- Node.js  for multiplayer server

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quickkeys.git
   cd quickkeys
   ```

2. **Configure Supabase**
   - Create a project at https://supabase.com
   - Update `supabase.js` with your project credentials:
     ```javascript
     const SUPABASE_URL = 'your-project-url';
     const SUPABASE_ANON_KEY = 'your-anon-key';
     ```
   - Run `COMPLETE-DATABASE-SETUP.sql` in Supabase SQL Editor
   - Configure storage bucket policies in Supabase Dashboard

3. **Open with a web server**
   ```bash
   python -m http.server 8000
   ```
   Or use VS Code Live Server extension

4. **Access the application**
   Open browser at `http://localhost:8000`

## 🎯 How to Play

### First Time Setup
1. Open the app and click **"Create Account"**
2. Enter email and password to sign up
3. Profile is auto-created with default username
4. Start playing immediately

### Single Player Mode
1. Click **"Single Player"** from main menu
2. Select difficulty level (Easy, Medium, Hard)
3. Click **"Start Game"** to begin
4. Type the displayed text accurately and quickly
5. Stats automatically save to cloud after each game
6. Green toast notification confirms save

### Profile Management
1. Click **"Profile"** in navigation
2. View your stats, charts, and activity feed
3. Click **"Edit"** to change username and bio
4. Upload profile picture (click camera icon)
5. Changes sync across all sessions

### Multiplayer Mode
1. Click **"Multiplayer"** from main menu
2. Click **"Find a Match"** to search for opponent
3. Wait for countdown (3, 2, 1, GO!)
4. Race in real-time against other player
5. Stats save after match completion

### Custom Mode
1. Click **"Custom Mode"** from main menu
2. Enter your own text in textarea
3. Set time limit and difficulty
4. Save challenges for later or share with friends

## 🛠️ Configuration

### Database Setup
Run the complete SQL setup script in Supabase:

```sql
See COMPLETE-DATABASE-SETUP.sql for full schema
```

This creates:
- profiles table with 14 columns
- avatars storage bucket (public)
- RLS policies for security
- Auto-profile creation trigger
- Performance indexes

### Storage Policies
Configure in Supabase Dashboard > Storage > avatars:
1. SELECT policy for public read access
2. INSERT policy for authenticated users
3. UPDATE policy for authenticated users
4. DELETE policy for authenticated users

### Settings Customization
Access settings from hamburger menu:
- Theme (Dark/Light)
- Sound effects toggle
- Background music toggle
- Difficulty preferences
- Timer duration
- Keyboard layout
- Show/hide errors
- Volume controls

## 🏗️ Project Structure

```
QuickKeys/
├── index.html                 Main application entry
├── login.html                 Login page
├── signup.html                Signup page
├── profile.html               User profile page
├── auth.css                   Authentication styles
├── supabase.js               Database client & helpers
├── profile.js                Profile page logic
├── profile.css               Profile page styles
├── auth.js                   Authentication handlers
├── styles/
│   └── main.css              Core application styles
├── js/
│   ├── main.js               Core app logic & navigation
│   ├── game.js               Typing game mechanics
│   ├── multiplayer.js        Real-time multiplayer
│   ├── ui.js                 UI enhancements
│   ├── custom.js             Custom mode logic
│   ├── background-music.js   Audio system
│   └── firebase-api.js       Legacy storage simulation
├── COMPLETE-DATABASE-SETUP.sql    Database schema
├── storage-bucket-setup.sql       Storage configuration
├── DATABASE_INTEGRATION_COMPLETE.md  Technical docs
└── USER_GUIDE.md             End-user documentation
```

### Key Components

**supabase.js** - Database Integration
- Authentication helpers (login, signup, getCurrentUser)
- Profile CRUD operations (getProfile, updateProfile)
- Game stats saving with weighted averages
- Avatar upload to Supabase Storage
- History arrays (last 200 entries)

**profile.js** - Profile Management
- Load and display user profile
- Edit username and bio
- Upload avatar images
- Render stats and charts (Chart.js)
- Activity feed display

**js/main.js** - Core Application
- App initialization and routing
- Auth status checking on load
- Profile auto-refresh on focus
- Screen navigation
- Logout functionality
- Settings management

**js/game.js** - Game Logic
- Single player mechanics
- WPM and accuracy calculations
- Auto-save to Supabase after each game
- Toast notifications for save status
- Timer and progress tracking

## 🎨 Design System

### Color Palette
```css
--bg-primary: #0a0a0f
--bg-secondary: #1a1a2e
--accent-primary: #00f5ff
--accent-secondary: #bd93f9
--success: #50fa7b
--danger: #ff5555
--text-primary: #ffffff
```

### Typography
- **Headings**: Poppins
- **Body**: Inter
- **Monospace**: Consolas, Monaco

### Animations
- 0.3s cubic-bezier transitions
- Particle background effects
- Glowing hover states
- Bounce animations for prompts
- Fade in/out toasts

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- ES6+ modules
- LocalStorage
- Fetch API
- Web Audio API
- Intersection Observer

## 🔧 Development

### Adding Features

**New Game Mode**: Extend `TypingGame` class in `game.js`
**Profile Fields**: Update `profiles` table schema in Supabase
**UI Components**: Add to `main.css` with consistent design tokens
**Database Operations**: Add helper functions to `supabase.js`

### Testing Flow
1. Signup creates profile automatically
2. Play game saves stats to database
3. View profile shows updated stats
4. Edit username reflects everywhere
5. Logout clears session
6. Login restores all data

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

### Guidelines
- Follow existing code patterns
- Test across browsers
- Ensure responsive design
- Update documentation
- Add console logs for debugging

## 📝 License

MIT License - See LICENSE file

## 🎯 Future Roadmap

- Mobile app (React Native)
- Typing lessons and tutorials
- Team competitions
- Advanced analytics dashboard
- Typing certificates
- Multiple language support
- Voice commands
- API integrations

## 📞 Support

- Bug Reports: Create GitHub issue
- Feature Requests: Start discussion
- Documentation: See USER_GUIDE.md and DATABASE_INTEGRATION_COMPLETE.md

## 🙏 Acknowledgments

- Supabase for backend infrastructure
- Font Awesome for icons
- Google Fonts (Inter & Poppins)
- Chart.js for data visualization
- Socket.IO for real-time features

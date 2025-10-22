// Optional Node.js server for real multiplayer functionality
// This is a basic implementation - uncomment and run with 'npm run server' for full multiplayer

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Game rooms and players
const gameRooms = new Map();
const waitingPlayers = [];

// Helper functions
function generateRoomId() {
    return 'room_' + Math.random().toString(36).substr(2, 9);
}

function generateGameText() {
    const texts = [
        "The five boxing wizards jump quickly into the ring with great excitement and energy.",
        "Pack my box with five dozen liquor jugs for the upcoming celebration party tonight.",
        "How vexingly quick daft zebras jump when surprised by loud noises in the wild.",
        "The quick brown fox jumps over the lazy dog while the sun shines brightly overhead.",
        "Jackdaws love my big sphinx of quartz that sits proudly in the garden center."
    ];
    return texts[Math.floor(Math.random() * texts.length)];
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Handle matchmaking
    socket.on('find-match', (playerData) => {
        console.log(`Player ${socket.id} looking for match`);
        
        if (waitingPlayers.length > 0) {
            // Match found - create game room
            const opponent = waitingPlayers.shift();
            const roomId = generateRoomId();
            const gameText = generateGameText();
            
            const gameRoom = {
                id: roomId,
                players: [
                    { id: socket.id, socket: socket, data: playerData, progress: 0, finished: false },
                    { id: opponent.id, socket: opponent.socket, data: opponent.data, progress: 0, finished: false }
                ],
                text: gameText,
                startTime: null,
                status: 'waiting'
            };
            
            gameRooms.set(roomId, gameRoom);
            
            // Join both players to room
            socket.join(roomId);
            opponent.socket.join(roomId);
            
            // Notify both players
            socket.emit('match-found', {
                room: roomId,
                opponent: opponent.data,
                isHost: true,
                text: gameText
            });
            
            opponent.socket.emit('match-found', {
                room: roomId,
                opponent: playerData,
                isHost: false,
                text: gameText
            });
            
            console.log(`Match created: Room ${roomId}`);
            
            // Start countdown after short delay
            setTimeout(() => {
                io.to(roomId).emit('game-countdown', { countdown: 3 });
                startCountdown(roomId, 3);
            }, 2000);
            
        } else {
            // Add to waiting list
            waitingPlayers.push({
                id: socket.id,
                socket: socket,
                data: playerData
            });
            
            socket.emit('waiting-for-match');
            console.log(`Player ${socket.id} added to waiting list`);
        }
    });
    
    // Handle game progress updates
    socket.on('progress-update', (data) => {
        const room = gameRooms.get(data.room);
        if (!room) return;
        
        // Update player progress
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.progress = data.progress;
            player.wpm = data.wpm;
            
            // Broadcast to opponent
            socket.to(data.room).emit('opponent-progress', {
                progress: data.progress,
                wpm: data.wmp || 0
            });
            
            // Check if player finished
            if (data.progress >= 100 && !player.finished) {
                player.finished = true;
                player.finishTime = Date.now();
                
                // Check if this player won
                const otherPlayer = room.players.find(p => p.id !== socket.id);
                if (!otherPlayer.finished) {
                    // This player won
                    io.to(data.room).emit('game-finish', {
                        winner: socket.id,
                        winnerData: player.data
                    });
                    
                    console.log(`Game finished in room ${data.room}, winner: ${socket.id}`);
                    
                    // Clean up room after delay
                    setTimeout(() => {
                        gameRooms.delete(data.room);
                    }, 30000);
                }
            }
        }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        // Remove from waiting list
        const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
        if (waitingIndex !== -1) {
            waitingPlayers.splice(waitingIndex, 1);
            console.log(`Removed ${socket.id} from waiting list`);
        }
        
        // Handle game room disconnection
        for (const [roomId, room] of gameRooms.entries()) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                // Notify opponent
                socket.to(roomId).emit('opponent-disconnected');
                
                // Clean up room
                gameRooms.delete(roomId);
                console.log(`Room ${roomId} cleaned up due to disconnection`);
                break;
            }
        }
    });
    
    // Cancel matchmaking
    socket.on('cancel-matchmaking', () => {
        const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
        if (waitingIndex !== -1) {
            waitingPlayers.splice(waitingIndex, 1);
            console.log(`Player ${socket.id} cancelled matchmaking`);
        }
    });
});

// Countdown function for game start
function startCountdown(roomId, count) {
    const room = gameRooms.get(roomId);
    if (!room || count <= 0) {
        // Start game
        if (room) {
            room.status = 'active';
            room.startTime = Date.now();
            io.to(roomId).emit('game-start', { text: room.text });
        }
        return;
    }
    
    setTimeout(() => {
        io.to(roomId).emit('game-countdown', { countdown: count - 1 });
        startCountdown(roomId, count - 1);
    }, 1000);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        activeRooms: gameRooms.size,
        waitingPlayers: waitingPlayers.length,
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`QuickKeys server running on port ${PORT}`);
    console.log(`Game URL: http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: '*',
  methods: ["GET", "POST"],
  credentials: false
}));

// Serve static files from the dist directory
app.use(express.static('dist'));

app.get('/', (req, res) => {
  res.json({ message: 'Chat server is running' });
});

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
    credentials: false
  },
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  path: '/socket.io/'
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Map(),
        messages: []
      });
    }
    
    const room = rooms.get(roomId);
    room.users.set(socket.id, {
      id: socket.id,
      username,
      typing: false
    });
    
    io.to(roomId).emit('user-joined', { 
      userId: socket.id, 
      username,
      users: Array.from(room.users.values())
    });
    
    socket.emit('room-history', {
      messages: room.messages,
      users: Array.from(room.users.values())
    });
    
    socket.data.roomId = roomId;
    socket.data.username = username;
  });

  socket.on('send-message', (message) => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);
    
    if (!roomId || !room) return;
    
    room.messages.push(message);
    io.to(roomId).emit('new-message', message);
  });

  socket.on('message-delivered', ({ messageId, roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    io.to(roomId).emit('message-status-update', {
      messageId,
      status: 'delivered'
    });
  });

  socket.on('react-to-message', ({ messageId, roomId, userId, emoji }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    const message = room.messages.find(m => m.id === messageId);
    if (message) {
      if (!message.reactions) {
        message.reactions = {};
      }
      message.reactions[userId] = emoji;
      
      io.to(roomId).emit('message-reaction', {
        messageId,
        userId,
        emoji
      });
    }
  });

  socket.on('typing', (isTyping) => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);
    
    if (!roomId || !room || !room.users.has(socket.id)) return;
    
    const user = room.users.get(socket.id);
    user.typing = isTyping;
    
    socket.to(roomId).emit('user-typing', {
      userId: socket.id,
      username: socket.data.username,
      isTyping
    });
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);
    
    if (!roomId || !room) return;
    
    const user = room.users.get(socket.id);
    room.users.delete(socket.id);
    
    if (user) {
      io.to(roomId).emit('user-left', {
        userId: socket.id,
        username: user.username,
        users: Array.from(room.users.values())
      });
    }
    
    if (room.users.size === 0) {
      rooms.delete(roomId);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
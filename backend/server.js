// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth'); // Authentication routes
const chatRoomRoutes = require('./routes/chatRoom'); // Chat room routes
const messageRoutes = require('./routes/message'); // Message routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Basic Route (for testing)
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Use Routes
app.use('/api/auth', authRoutes); // Mount authentication routes under /api/auth
app.use('/api/chatrooms', chatRoomRoutes); // Mount chat room routes under /api/chatrooms
app.use('/api/messages', messageRoutes); // Mount message routes under /api/messages

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack trace
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

// Create an HTTP server
const server = http.createServer(app);

// Set up Socket.IO
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow connections from your frontend
    methods: ['GET', 'POST'],
  },
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a chat room
  socket.on('joinRoom', (chatRoomId) => {
    socket.join(chatRoomId); // Join the room
    console.log(`User ${socket.id} joined room ${chatRoomId}`);
  });

  // Send a message
  socket.on('sendMessage', async ({ chatRoomId, senderId, content }) => {
    try {
      // Save the message to the database
      const message = new Message({ chatRoomId, senderId, content });
      await message.save();

      // Broadcast the message to everyone in the chat room
      io.to(chatRoomId).emit('receiveMessage', message);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');
const socketHandler = require('./socketHandler');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: process.env.ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRouter = require('./routes/auth');
const chatRoomRouter = require('./routes/chatrooms');
const messagesRouter = require('./routes/messages');

app.use('/api/auth', authRouter);
app.use('/api/chatrooms', chatRoomRouter);
app.use('/api/messages', messagesRouter);

// Initialize socket handler
socketHandler(io);

// Error handling middleware should be last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8747;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
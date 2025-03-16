/**
 * Main server entry point
 * 
 * Sets up Express server, middleware, database connection,
 * routes, and Socket.IO for real-time communication.
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const socketHandler = require('./socketHandler');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const config = require('./config');

// Configure logging based on environment
if (config.environment === 'test') {
    // Suppress mongoose logging in test
    mongoose.set('debug', false);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: config.server.origin,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: config.server.origin,
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB (only if not already connecting in tests)
if (!process.env.JEST_WORKER_ID) {
    mongoose.connect(config.database.url)
        .then(() => logger.info('Connected to MongoDB'))
        .catch(err => logger.error('MongoDB connection error:', err));
}

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

// Start server (only if not in test mode)
if (!process.env.JEST_WORKER_ID) {
    const PORT = config.server.port;
    server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

// Export for testing
module.exports = app;
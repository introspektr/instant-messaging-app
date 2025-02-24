const Message = require('./models/Message');
const ChatRoom = require('./models/ChatRoom');
const jwt = require('jsonwebtoken');

const socketHandler = (io) => {
    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.userId);

        // Handle joining a chat room
        socket.on('joinRoom', async ({ roomId }) => {
            try {
                const chatRoom = await ChatRoom.findById(roomId);
                if (!chatRoom) {
                    socket.emit('error', 'Chat room not found');
                    return;
                }

                // Check if user is a participant
                if (!chatRoom.participants.includes(socket.userId)) {
                    socket.emit('error', 'Not authorized to join this room');
                    return;
                }

                socket.join(roomId);
                console.log(`User ${socket.userId} joined room ${roomId}`);

                // Notify others in the room
                socket.to(roomId).emit('userJoined', {
                    userId: socket.userId,
                    message: 'User joined the chat'
                });

            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Handle sending messages
        socket.on('sendMessage', async ({ roomId, content }) => {
            try {
                const message = new Message({
                    content,
                    sender: socket.userId,
                    chatRoom: roomId,
                });

                await message.save();
                await message.populate('sender', 'username');

                // Broadcast the message to everyone in the room
                io.to(roomId).emit('newMessage', {
                    message: {
                        _id: message._id,
                        content: message.content,
                        sender: message.sender,
                        timestamp: message.timestamp
                    }
                });

            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Handle leaving a chat room
        socket.on('leaveRoom', async ({ roomId }) => {
            socket.leave(roomId);
            console.log(`User ${socket.userId} left room ${roomId}`);

            // Notify others in the room
            socket.to(roomId).emit('userLeft', {
                userId: socket.userId,
                message: 'User left the chat'
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.userId);
        });
    });
};

module.exports = socketHandler; 
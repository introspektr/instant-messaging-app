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
        console.log('New client connected');

        // Emit the list of rooms the user is a participant in
        const emitUserRooms = async () => {
            try {
                const rooms = await ChatRoom.find({ participants: socket.userId })
                    .populate('createdBy', 'username _id')
                    .populate('participants', 'username');
                socket.emit('rooms', rooms);
            } catch (error) {
                socket.emit('error', error.message);
            }
        };

        // Call emitUserRooms when a user connects
        emitUserRooms();

        // Handle creating a new chat room
        socket.on('createRoom', async (roomName) => {
            try {
                console.log('Server: Creating room:', roomName); // Debugging log
                const newRoom = await ChatRoom.create({
                    name: roomName,
                    createdBy: socket.userId,
                    participants: [socket.userId]
                });

                emitUserRooms(); // Emit updated list of rooms
            } catch (error) {
                console.error('Error creating room:', error.message); // Debugging log
                socket.emit('error', error.message);
            }
        });

        // Handle joining a chat room
        socket.on('joinRoom', async ({ roomId }) => {
            if (!roomId) {
                socket.emit('error', 'Invalid room ID');
                return;
            }

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
        socket.on('sendMessage', async (message) => {
            try {
                const messageObj = new Message({
                    content: message.text,
                    sender: socket.userId,
                    chatRoom: message.roomId,
                });

                await messageObj.save();
                await messageObj.populate('sender', 'username');

                // Broadcast the message to everyone in the room
                io.to(message.roomId).emit('message', {
                    message: {
                        _id: messageObj._id,
                        content: messageObj.content,
                        sender: messageObj.sender.username,
                        timestamp: messageObj.timestamp
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

        // Handle fetching messages for a specific room
        socket.on('getMessages', async ({ roomId }) => {
            try {
                const messages = await Message.find({ chatRoom: roomId })
                    .populate('sender', 'username')
                    .sort({ timestamp: 1 }); // Sort messages by timestamp
                socket.emit('messages', messages);
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Handle deleting a chat room
        socket.on('deleteRoom', async ({ roomId }) => {
            try {
                const room = await ChatRoom.findById(roomId);
                if (!room) {
                    socket.emit('error', 'Chat room not found');
                    return;
                }

                if (room.createdBy.toString() !== socket.userId) {
                    socket.emit('error', 'Not authorized to delete this room');
                    return;
                }

                await room.remove();
                io.emit('roomDeleted', { roomId }); // Notify all clients about the deletion
            } catch (error) {
                console.error('Error deleting room:', error.message); // Debugging log
                socket.emit('error', error.message);
            }
        });

        // Handle deleting a message
        socket.on('deleteMessage', ({ messageId }) => {
            // Logic to delete the message from the database
            // Emit an event to update other clients
            io.emit('messageDeleted', { messageId });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.userId);
        });
    });
};

module.exports = socketHandler; 
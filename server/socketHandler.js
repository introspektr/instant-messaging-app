const Message = require('./models/Message');
const ChatRoom = require('./models/ChatRoom');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

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
        socket.on('createRoom', async (data) => {
            try {
                // Extract room name from the data object
                const roomName = typeof data === 'string' ? data : data.name;
                
                console.log('Server: Creating room:', roomName); // Debugging log
                const newRoom = await ChatRoom.create({
                    name: roomName,
                    createdBy: socket.userId,
                    participants: [socket.userId]
                });

                // Populate the createdBy field before emitting
                await newRoom.populate('createdBy', 'username _id');
                await newRoom.populate('participants', 'username');
                
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

                // Broadcast the message to everyone in the room with a consistent format
                io.to(message.roomId).emit('message', {
                    message: {
                        _id: messageObj._id,
                        content: messageObj.content,
                        sender: {
                            _id: messageObj.sender._id,
                            username: messageObj.sender.username
                        },
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

                // Use findByIdAndDelete instead of remove()
                await ChatRoom.findByIdAndDelete(roomId);
                
                // Also delete associated messages
                await Message.deleteMany({ chatRoom: roomId });
                
                io.emit('roomDeleted', { roomId }); // Notify all clients about the deletion
            } catch (error) {
                console.error('Error deleting room:', error.message); // Debugging log
                socket.emit('error', error.message);
            }
        });

        // Handle deleting a message
        socket.on('deleteMessage', async ({ messageId, roomId }) => {
            try {
                const message = await Message.findById(messageId);
                
                if (!message) {
                    socket.emit('error', 'Message not found');
                    return;
                }
                
                // Check if user is the sender of the message
                if (message.sender.toString() !== socket.userId) {
                    socket.emit('error', 'Not authorized to delete this message');
                    return;
                }
                
                // Delete the message
                await Message.findByIdAndDelete(messageId);
                
                // Notify all clients in the room about the deletion
                io.to(roomId).emit('messageDeleted', { messageId });
            } catch (error) {
                console.error('Error deleting message:', error.message);
                socket.emit('error', error.message);
            }
        });

        // Handle getting rooms
        socket.on('getRooms', async () => {
            try {
                await emitUserRooms();
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Handle getting room participants
        socket.on('getRoomParticipants', async ({ roomId }) => {
            try {
                const room = await ChatRoom.findById(roomId)
                    .populate('participants', 'username _id');
                
                if (!room) {
                    socket.emit('error', 'Chat room not found');
                    return;
                }
                
                socket.emit('roomParticipants', room.participants);
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Handle adding a user to a room
        socket.on('addUserToRoom', async ({ roomId, username }) => {
            try {
                // Find the room
                const room = await ChatRoom.findById(roomId);
                if (!room) {
                    socket.emit('error', 'Chat room not found');
                    return;
                }

                // Check if the current user is the creator of the room
                if (room.createdBy.toString() !== socket.userId) {
                    socket.emit('error', 'Only the room creator can add users');
                    return;
                }

                // Find the user to add by username
                const userToAdd = await User.findOne({ username });
                if (!userToAdd) {
                    socket.emit('error', 'User not found');
                    return;
                }

                // Check if user is already a participant
                if (room.participants.includes(userToAdd._id)) {
                    socket.emit('error', 'User is already in this room');
                    return;
                }

                // Add the user to the room's participants
                room.participants.push(userToAdd._id);
                await room.save();
                
                // Populate the updated room data
                await room.populate('participants', 'username _id');
                await room.populate('createdBy', 'username _id');

                // Notify all clients about the updated room
                io.emit('roomUpdated', room);
                
                // Notify the specific user that they've been added to a room
                // Find all socket connections for this user
                const userSockets = await io.fetchSockets();
                for (const userSocket of userSockets) {
                    if (userSocket.userId && userSocket.userId.toString() === userToAdd._id.toString()) {
                        // Emit the updated rooms list to this user
                        const userRooms = await ChatRoom.find({ participants: userToAdd._id })
                            .populate('createdBy', 'username _id')
                            .populate('participants', 'username');
                        userSocket.emit('rooms', userRooms);
                        break;
                    }
                }

                // Emit updated participants to everyone in the room
                io.to(roomId).emit('roomParticipants', room.participants);
                
                // Success message to the room creator
                socket.emit('success', `${username} has been added to the room`);

            } catch (error) {
                console.error('Error adding user to room:', error);
                socket.emit('error', error.message);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.userId);
        });
    });
};

module.exports = socketHandler; 
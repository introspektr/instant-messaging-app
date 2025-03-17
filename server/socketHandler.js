/**
 * Socket.IO Handler
 * 
 * Manages real-time communication between clients using Socket.IO.
 * Handles authentication, room management, messaging, and notifications.
 */
const Message = require('./models/Message');
const ChatRoom = require('./models/ChatRoom');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { ObjectId } = require('mongodb');
const logger = require('./utils/logger');
const config = require('./config');

/**
 * Initialize socket handlers
 * 
 * @param {Object} io - Socket.IO server instance
 */
const socketHandler = (io) => {
    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                logger.warn('Socket connection attempt without token');
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, config.jwt.secret);
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            logger.error('Socket authentication error:', error.message);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        logger.debug('New connection from:', socket.userId);

        // Emit the list of rooms the user is a participant in
        const emitUserRooms = async () => {
            try {
                const rooms = await ChatRoom.find({ participants: socket.userId })
                    .populate('createdBy', 'username _id firstName lastName')
                    .populate('participants', 'username firstName lastName');
                socket.emit('rooms', rooms);
            } catch (error) {
                logger.error('Error fetching user rooms:', error.message);
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
                
                logger.debug(`User ${socket.userId} creating room: ${roomName}`);
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
                logger.error('Error creating room:', error.message);
                socket.emit('error', error.message);
            }
        });

        // Handle joining a chat room
        socket.on('joinRoom', async ({ roomId }) => {
            try {
                const chatRoom = await ChatRoom.findById(roomId);
                if (!chatRoom) {
                    logger.warn(`User ${socket.userId} attempted to join non-existent room ${roomId}`);
                    socket.emit('error', 'Chat room not found');
                    return;
                }

                if (!chatRoom.participants.includes(socket.userId)) {
                    logger.warn(`User ${socket.userId} attempted to join unauthorized room ${roomId}`);
                    socket.emit('error', 'Not authorized to join this room');
                    return;
                }

                socket.join(roomId);
                logger.debug(`User ${socket.userId} joined room ${roomId}`);
                // Emit room data to the client
                socket.emit('roomData', chatRoom);
            } catch (error) {
                logger.error(`Error joining room ${roomId}:`, error.message);
                socket.emit('error', error.message);
            }
        });

        // Handle sending messages
        socket.on('sendMessage', async (message) => {
            try {
                // Validate message data
                if (!message.text || !message.roomId || !message.sender) {
                    throw new Error('Invalid message data');
                }

                const messageObj = new Message({
                    content: message.text,
                    sender: message.sender,
                    chatRoom: message.roomId,
                });

                await messageObj.save();
                await messageObj.populate('sender', 'username firstName lastName');

                logger.debug(`Message sent in room ${message.roomId} by user ${socket.userId}`);

                // Broadcast the message with consistent format
                io.to(message.roomId).emit('message', {
                    _id: messageObj._id,
                    content: messageObj.content,
                    sender: {
                        _id: messageObj.sender._id,
                        username: messageObj.sender.username,
                        firstName: messageObj.sender.firstName,
                        lastName: messageObj.sender.lastName
                    },
                    timestamp: messageObj.timestamp
                });

            } catch (error) {
                logger.error('Error sending message:', error.message);
                socket.emit('error', error.message);
            }
        });

        // Handle leaving a chat room
        socket.on('leaveRoom', async ({ roomId }) => {
            socket.leave(roomId);
            logger.debug(`User ${socket.userId} left room ${roomId}`);

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
                    .populate('sender', 'username firstName lastName')
                    .sort({ timestamp: 1 }); // Sort messages by timestamp
                socket.emit('messages', messages);
                logger.debug(`Fetched ${messages.length} messages for room ${roomId}`);
            } catch (error) {
                logger.error(`Error fetching messages for room ${roomId}:`, error.message);
                socket.emit('error', error.message);
            }
        });

        // Handle deleting a chat room
        socket.on('deleteRoom', async ({ roomId }) => {
            try {
                const room = await ChatRoom.findById(roomId);
                if (!room) {
                    logger.warn(`User ${socket.userId} attempted to delete non-existent room ${roomId}`);
                    socket.emit('error', 'Chat room not found');
                    return;
                }

                // Check if the user is the creator of the room
                if (room.createdBy.toString() !== socket.userId) {
                    logger.warn(`User ${socket.userId} attempted unauthorized deletion of room ${roomId}`);
                    socket.emit('error', 'Not authorized to delete this room');
                    return;
                }

                // Use findByIdAndDelete instead of remove()
                await ChatRoom.findByIdAndDelete(roomId);
                
                // Also delete associated messages
                await Message.deleteMany({ chatRoom: roomId });
                
                logger.info(`Room ${roomId} deleted by user ${socket.userId}`);
                io.emit('roomDeleted', { roomId }); // Notify all clients about the deletion
            } catch (error) {
                logger.error(`Error deleting room ${roomId}:`, error.message);
                socket.emit('error', error.message);
            }
        });

        // Handle deleting a message
        socket.on('deleteMessage', async ({ messageId, roomId }) => {
            try {
                const message = await Message.findById(messageId);
                
                if (!message) {
                    logger.warn(`User ${socket.userId} attempted to delete non-existent message ${messageId}`);
                    socket.emit('error', 'Message not found');
                    return;
                }
                
                // Check if user is the sender of the message
                if (message.sender.toString() !== socket.userId) {
                    logger.warn(`User ${socket.userId} attempted unauthorized deletion of message ${messageId}`);
                    socket.emit('error', 'Not authorized to delete this message');
                    return;
                }
                
                await Message.findByIdAndDelete(messageId);
                logger.debug(`Message ${messageId} deleted by user ${socket.userId}`);
                io.to(roomId).emit('messageDeleted', { messageId });
            } catch (error) {
                logger.error(`Error deleting message ${messageId}:`, error.message);
                socket.emit('error', error.message);
            }
        });

        // Handle getting rooms
        socket.on('getRooms', async () => {
            try {
                await emitUserRooms();
            } catch (error) {
                logger.error('Error getting rooms:', error.message);
                socket.emit('error', error.message);
            }
        });

        // Handle getting room participants
        socket.on('getRoomParticipants', async ({ roomId }) => {
            try {
                const room = await ChatRoom.findById(roomId)
                    .populate('participants', 'username _id firstName lastName');
                
                if (!room) {
                    logger.warn(`User ${socket.userId} requested participants for non-existent room ${roomId}`);
                    socket.emit('error', 'Chat room not found');
                    return;
                }
                
                socket.emit('roomParticipants', room.participants);
                logger.debug(`Fetched ${room.participants.length} participants for room ${roomId}`);
            } catch (error) {
                logger.error(`Error getting participants for room ${roomId}:`, error.message);
                socket.emit('error', error.message);
            }
        });

        // Handle adding a user to a room
        socket.on('addUserToRoom', async ({ roomId, username }) => {
            try {
                // Find the room
                const room = await ChatRoom.findById(roomId);
                if (!room) {
                    logger.warn(`User ${socket.userId} attempted to add user to non-existent room ${roomId}`);
                    socket.emit('error', 'Chat room not found');
                    return;
                }

                // Check if the current user is the creator of the room
                if (room.createdBy.toString() !== socket.userId) {
                    logger.warn(`User ${socket.userId} attempted unauthorized user addition to room ${roomId}`);
                    socket.emit('error', 'Only the room creator can add users');
                    return;
                }

                // Find the user to add by username
                const userToAdd = await User.findOne({ username });
                if (!userToAdd) {
                    logger.warn(`User ${socket.userId} attempted to add non-existent user ${username}`);
                    socket.emit('error', 'User not found');
                    return;
                }

                // Check if user is already a participant
                if (room.participants.includes(userToAdd._id)) {
                    logger.warn(`User ${socket.userId} attempted to add already participating user ${username}`);
                    socket.emit('error', 'User is already in this room');
                    return;
                }

                // Add the user to the room's participants
                room.participants.push(userToAdd._id);
                await room.save();
                
                // Populate the updated room data
                await room.populate('participants', 'username _id firstName lastName');
                await room.populate('createdBy', 'username _id firstName lastName');

                logger.info(`User ${username} added to room ${roomId} by ${socket.userId}`);

                // Notify all clients about the updated room
                io.emit('roomUpdated', room);
                
                // Notify the specific user that they've been added to a room
                // Find all socket connections for this user
                const userSockets = await io.fetchSockets();
                for (const userSocket of userSockets) {
                    if (userSocket.userId && userSocket.userId.toString() === userToAdd._id.toString()) {
                        // Emit the updated rooms list to this user
                        const userRooms = await ChatRoom.find({ participants: userToAdd._id })
                            .populate('createdBy', 'username _id firstName lastName')
                            .populate('participants', 'username firstName lastName');
                        userSocket.emit('rooms', userRooms);
                        break;
                    }
                }

                // Emit updated participants to everyone in the room
                io.to(roomId).emit('roomParticipants', room.participants);
                
                // Success message to the room creator
                socket.emit('success', `${username} has been added to the room`);

            } catch (error) {
                logger.error(`Error adding user to room ${roomId}:`, error.message);
                socket.emit('error', error.message);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            logger.debug(`User disconnected: ${socket.userId}`);
        });
    });
};

module.exports = socketHandler; 
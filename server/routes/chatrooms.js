/**
 * Chat Rooms Routes
 * 
 * This file defines all API endpoints related to chat rooms in the application.
 * It handles creating, reading, updating, and deleting chat rooms, as well as
 * managing participants and fetching messages within rooms.
 * 
 * MERN Stack Context:
 * - This is part of the Express.js backend (the 'E' in MERN)
 * - These routes define the API that the React frontend will communicate with
 * - Each route corresponds to a specific URL path and HTTP method
 */
const express = require('express');
const router = express.Router(); // Create a new router object to define routes
const ChatRoom = require('../models/ChatRoom'); // Import the ChatRoom model (MongoDB schema)
const auth = require('../middleware/auth'); // Authentication middleware to protect routes
const Message = require('../models/Message'); // Import the Message model for related operations
const { success, error } = require('../utils/responseHandler'); // Standardized response formatting
const { validateRequest, validations } = require('../middleware/validate'); // Request validation

/**
 * POST /api/chatrooms
 * Creates a new chat room
 * 
 * Middleware:
 * - auth: Ensures user is authenticated
 * - validations.createChatRoom: Validates the request data
 * - validateRequest: Handles validation errors
 * 
 * Request body:
 * - name: The name of the chat room
 * 
 * Response:
 * - 201: Chat room created successfully with room details
 * - 400: Validation error
 * - 500: Server error
 */
router.post('/', auth, validations.createChatRoom, validateRequest, async (req, res) => {
    try {
        const { name } = req.body; // Extract the room name from request body

        // Create a new chat room with the authenticated user as creator and participant
        const chatRoom = new ChatRoom({
            name,
            createdBy: req.user._id,
            participants: [req.user._id] // Creator is automatically a participant
        });

        await chatRoom.save(); // Save the chat room to the database

        // Populate creator details to include in response (MongoDB populate = JOIN in SQL)
        await chatRoom.populate('createdBy', 'username email');

        // Return success response with the newly created chat room
        return success(res, 201, 'Chat room created successfully', { chatRoom });
    } catch (err) {
        // Handle any errors during creation
        return error(res, 500, 'Failed to create chat room', { details: err.message });
    }
});

/**
 * GET /api/chatrooms
 * Retrieves all chat rooms
 * 
 * This route is not protected, so anyone can see available chat rooms
 * 
 * Response:
 * - 200: List of all chat rooms
 * - 500: Server error
 */
router.get('/', async (req, res) => {
    try {
        // Find all chat rooms in the database
        const chatRooms = await ChatRoom.find();
        return success(res, 200, 'Chat rooms retrieved successfully', { chatRooms });
    } catch (err) {
        return error(res, 500, 'Failed to fetch chat rooms', { details: err.message });
    }
});

/**
 * GET /api/chatrooms/:id
 * Retrieves a specific chat room by ID
 * 
 * URL parameter:
 * - id: The MongoDB ObjectId of the chat room
 * 
 * Middleware:
 * - auth: Ensures user is authenticated
 * - validations.roomId: Validates the room ID format
 * - validateRequest: Handles validation errors
 * 
 * Response:
 * - 200: Chat room details with populated creator and participants
 * - 404: Chat room not found
 * - 500: Server error
 */
router.get('/:id', auth, validations.roomId, validateRequest, async (req, res) => {
    try {
        // Find chat room by ID and populate related fields
        // 'populate' is a Mongoose method that works like a JOIN in SQL
        const chatRoom = await ChatRoom.findById(req.params.id)
            .populate('createdBy', 'username email')
            .populate('participants', 'username email')
            .populate('messages.sender', 'username email');

        if (!chatRoom) {
            return error(res, 404, 'Chat room not found');
        }

        return success(res, 200, 'Chat room retrieved successfully', { chatRoom });
    } catch (err) {
        return error(res, 500, 'Failed to fetch chat room', { details: err.message });
    }
});

/**
 * PUT /api/chatrooms/:id
 * Updates a specific chat room (only by creator)
 * 
 * URL parameter:
 * - id: The MongoDB ObjectId of the chat room
 * 
 * Request body:
 * - name: The new name for the chat room
 * 
 * Middleware:
 * - auth: Ensures user is authenticated
 * - validations: Validates request parameters and body
 * 
 * Response:
 * - 200: Updated chat room details
 * - 404: Chat room not found or user not authorized
 * - 500: Server error
 */
router.put('/:id', auth, validations.roomId, validations.createChatRoom, validateRequest, async (req, res) => {
    try {
        const { name } = req.body;
        
        // findOneAndUpdate combines finding and updating in one database operation
        // { new: true } returns the updated document instead of the original
        const chatRoom = await ChatRoom.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id }, // Only the creator can update
            { name },
            { new: true }
        ).populate('createdBy', 'username email');

        if (!chatRoom) {
            return error(res, 404, 'Chat room not found or you are not authorized to update it');
        }

        return success(res, 200, 'Chat room updated successfully', { chatRoom });
    } catch (err) {
        return error(res, 500, 'Failed to update chat room', { details: err.message });
    }
});

/**
 * DELETE /api/chatrooms/:id
 * Deletes a specific chat room (only by creator)
 * 
 * URL parameter:
 * - id: The MongoDB ObjectId of the chat room
 * 
 * Middleware:
 * - auth: Ensures user is authenticated
 * - validations.roomId: Validates the room ID format
 * 
 * Response:
 * - 200: Success message if deleted
 * - 404: Chat room not found or user not authorized
 * - 500: Server error
 */
router.delete('/:id', auth, validations.roomId, validateRequest, async (req, res) => {
    try {
        // Find and delete the chat room where the authenticated user is the creator
        const chatRoom = await ChatRoom.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!chatRoom) {
            return error(res, 404, 'Chat room not found or you are not authorized to delete it');
        }

        // Also delete all messages in the chat room (cascading delete)
        await Message.deleteMany({ chatRoom: req.params.id });

        return success(res, 200, 'Chat room deleted successfully');
    } catch (err) {
        return error(res, 500, 'Failed to delete chat room', { details: err.message });
    }
});

/**
 * POST /api/chatrooms/:id/participants
 * Adds a participant to a chat room
 * 
 * URL parameter:
 * - id: The MongoDB ObjectId of the chat room
 * 
 * Request body:
 * - userId: The ID of the user to add
 * 
 * Middleware:
 * - auth: Ensures user is authenticated
 * - validations.roomId: Validates the room ID format
 * 
 * Response:
 * - 200: Updated chat room with new participant
 * - 400: User already a participant
 * - 404: Chat room not found
 * - 500: Server error
 */
router.post('/:id/participants', auth, validations.roomId, validateRequest, async (req, res) => {
    try {
        const { userId } = req.body;
        const chatRoom = await ChatRoom.findById(req.params.id);
        
        if (!chatRoom) {
            return error(res, 404, 'Chat room not found');
        }
        
        // Check if user is already a participant
        if (chatRoom.participants.includes(userId)) {
            return error(res, 400, 'User is already a participant');
        }
        
        // Add the new participant to the room
        chatRoom.participants.push(userId);
        await chatRoom.save();
        
        // Populate participant details for the response
        await chatRoom.populate('participants', 'username email');
        
        return success(res, 200, 'Participant added successfully', { chatRoom });
    } catch (err) {
        return error(res, 500, 'Failed to add participant', { details: err.message });
    }
});

/**
 * DELETE /api/chatrooms/:id/participants/:userId
 * Removes a participant from a chat room
 * 
 * URL parameters:
 * - id: The MongoDB ObjectId of the chat room
 * - userId: The ID of the user to remove
 * 
 * Authorization:
 * - Room creator can remove any participant
 * - Users can remove themselves
 * 
 * Middleware:
 * - auth: Ensures user is authenticated
 * - validations.roomId: Validates the room ID format
 * 
 * Response:
 * - 200: Updated chat room without removed participant
 * - 400: User is not a participant
 * - 403: Not authorized to remove participant
 * - 404: Chat room not found
 * - 500: Server error
 */
router.delete('/:id/participants/:userId', auth, validations.roomId, validateRequest, async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findById(req.params.id);
        
        if (!chatRoom) {
            return error(res, 404, 'Chat room not found');
        }
        
        // Only creator can remove participants or users can remove themselves
        if (chatRoom.createdBy.toString() !== req.user._id.toString() && 
            req.params.userId !== req.user._id.toString()) {
            return error(res, 403, 'Not authorized to remove participants');
        }
        
        // Check if user is a participant
        if (!chatRoom.participants.includes(req.params.userId)) {
            return error(res, 400, 'User is not a participant');
        }
        
        // Filter out the participant to be removed
        chatRoom.participants = chatRoom.participants.filter(
            participant => participant.toString() !== req.params.userId
        );
        
        await chatRoom.save();
        await chatRoom.populate('participants', 'username email');
        
        return success(res, 200, 'Participant removed successfully', { chatRoom });
    } catch (err) {
        return error(res, 500, 'Failed to remove participant', { details: err.message });
    }
});

/**
 * GET /api/chatrooms/:id/messages
 * Retrieves messages for a specific chat room
 * 
 * URL parameter:
 * - id: The MongoDB ObjectId of the chat room
 * 
 * Middleware:
 * - auth: Ensures user is authenticated
 * - validations.roomId: Validates the room ID format
 * 
 * Response:
 * - 200: List of messages for the chat room (limited to 50)
 * - 500: Server error
 * 
 * Note: Messages are sorted by timestamp in descending order (newest first)
 */
router.get('/:id/messages', auth, validations.roomId, validateRequest, async (req, res) => {
    try {
        // Find messages for the specified chat room
        const messages = await Message.find({ chatRoom: req.params.id })
            .populate('sender', 'username')  // Include sender details
            .sort({ timestamp: -1 })         // Sort by timestamp descending (newest first)
            .limit(50);                      // Limit to last 50 messages for performance

        return success(res, 200, 'Messages retrieved successfully', { messages });
    } catch (err) {
        return error(res, 500, 'Failed to fetch messages', { details: err.message });
    }
});

// Export the router to be mounted in the main Express app
module.exports = router; 
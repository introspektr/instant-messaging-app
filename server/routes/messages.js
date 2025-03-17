/**
 * Messages Routes
 * 
 * This file defines API endpoints for handling chat messages, including:
 * - Retrieving messages for a specific chat room
 * - Paginated message retrieval
 * - Creating new messages
 * - Deleting messages
 * 
 * MERN Stack Context:
 * - Part of the Express backend (E in MERN)
 * - Manages the chat message data flow between client and database
 * - These endpoints will be called by the React frontend via HTTP requests
 */
const express = require('express');
const router = express.Router(); // Create a router to define message routes
const Message = require('../models/Message'); // Import Message model for database operations
const auth = require('../middleware/auth'); // Authentication middleware
const { validateRequest, validations } = require('../middleware/validate'); // Request validation
const { param } = require('express-validator'); // For parameter validation
const { success, error } = require('../utils/responseHandler'); // Standardized response formatting

/**
 * GET /api/messages/:roomId
 * Get all messages for a specific chat room
 * 
 * URL parameter:
 * - roomId: The MongoDB ObjectId of the chat room
 * 
 * Middleware:
 * - auth: Ensures user is authenticated
 * - validations.roomId: Validates the room ID format
 * - validateRequest: Handles validation errors
 * 
 * Response:
 * - 200: List of messages (limited to 50)
 * - 400: Invalid room ID
 * - 401: Not authenticated
 * - 500: Server error
 * 
 * Note: Messages are sorted by timestamp in descending order (newest first)
 */
router.get('/:roomId', 
    auth,
    validations.roomId,
    validateRequest,
    async (req, res) => {
        try {
            // Find messages for the given room, populate sender details,
            // sort by timestamp descending (newest first), and limit to 50 messages
            const messages = await Message.find({ chatRoom: req.params.roomId })
                .populate('sender', 'username email firstName lastName')
                .sort({ timestamp: -1 })
                .limit(50);

            return success(res, 200, 'Messages retrieved successfully', { messages });
        } catch (err) {
            return error(res, 500, 'Failed to fetch messages', { details: err.message });
        }
    }
);

/**
 * GET /api/messages/:roomId/page/:page
 * Get paginated messages for a specific chat room
 * 
 * URL parameters:
 * - roomId: The MongoDB ObjectId of the chat room
 * - page: The page number to retrieve (starting from 1)
 * 
 * Middleware:
 * - auth: Ensures user is authenticated
 * - Validates roomId and page parameters
 * - validateRequest: Handles validation errors
 * 
 * Response:
 * - 200: Paginated list of messages with pagination metadata
 * - 400: Invalid parameters
 * - 401: Not authenticated
 * - 500: Server error
 * 
 * Note: This implementation uses skip/limit pagination for simplicity.
 * For large collections, cursor-based pagination would be more efficient.
 */
router.get('/:roomId/page/:page', 
    auth,
    [
        ...validations.roomId,
        param('page')
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer')
    ],
    validateRequest,
    async (req, res) => {
        try {
            // Parse page number and define pagination parameters
            const page = parseInt(req.params.page);
            const limit = 20; // Messages per page
            const skip = (page - 1) * limit; // Calculate how many documents to skip

            // Find messages with pagination
            const messages = await Message.find({ chatRoom: req.params.roomId })
                .populate('sender', 'username email firstName lastName')
                .sort({ timestamp: -1 }) // Newest first
                .skip(skip)
                .limit(limit);

            // Get total message count for pagination metadata
            const total = await Message.countDocuments({ chatRoom: req.params.roomId });

            // Return messages with pagination information
            return success(res, 200, 'Paginated messages retrieved successfully', {
                messages,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalMessages: total
                }
            });
        } catch (err) {
            return error(res, 500, 'Failed to fetch paginated messages', { details: err.message });
        }
    }
);

/**
 * POST /api/messages/:roomId
 * Create a new message in a chat room
 * 
 * URL parameter:
 * - roomId: The MongoDB ObjectId of the chat room
 * 
 * Request body:
 * - content: The text content of the message
 * 
 * Middleware:
 * - auth: Ensures user is authenticated
 * - validations.roomId: Validates the room ID format
 * - validations.message: Validates the message content
 * - validateRequest: Handles validation errors
 * 
 * Response:
 * - 201: Message created successfully with message details
 * - 400: Invalid parameters
 * - 401: Not authenticated
 * - 500: Server error
 */
router.post('/:roomId', 
    auth,
    validations.roomId,
    validations.message,
    validateRequest,
    async (req, res) => {
        try {
            // Create a new message with content, sender, and chat room
            const message = new Message({
                content: req.body.content,
                sender: req.user._id, // Set authenticated user as sender
                chatRoom: req.params.roomId
            });

            // Save message to the database
            await message.save();
            
            // Populate sender details for the response
            await message.populate('sender', 'username email firstName lastName');

            return success(res, 201, 'Message sent successfully', { message });
        } catch (err) {
            return error(res, 500, 'Failed to send message', { details: err.message });
        }
    }
);

/**
 * DELETE /api/messages/:messageId
 * Delete a specific message
 * 
 * URL parameter:
 * - messageId: The MongoDB ObjectId of the message to delete
 * 
 * Middleware:
 * - auth: Ensures user is authenticated
 * - Validates messageId parameter
 * - validateRequest: Handles validation errors
 * 
 * Authorization:
 * - Only the message sender can delete their own messages
 * 
 * Response:
 * - 200: Message deleted successfully
 * - 400: Invalid message ID
 * - 401: Not authenticated
 * - 403: Not authorized (not the message sender)
 * - 404: Message not found
 * - 500: Server error
 */
router.delete('/:messageId', 
    auth,
    [
        param('messageId')
            .isMongoId()
            .withMessage('Invalid message ID')
    ],
    validateRequest,
    async (req, res) => {
        try {
            // Find the message by ID
            const message = await Message.findById(req.params.messageId);
            
            if (!message) {
                return error(res, 404, 'Message not found');
            }

            // Check if the authenticated user is the sender of the message
            if (message.sender.toString() !== req.user._id.toString()) {
                return error(res, 403, 'Not authorized to delete this message');
            }

            // Delete the message
            await Message.findByIdAndDelete(req.params.messageId);
            return success(res, 200, 'Message deleted successfully');
        } catch (err) {
            return error(res, 500, 'Failed to delete message', { details: err.message });
        }
    }
);

// Export the router to be mounted in the main Express app
module.exports = router; 
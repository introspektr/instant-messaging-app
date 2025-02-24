const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const { validateRequest, validations } = require('../middleware/validate');
const { param } = require('express-validator');

// Get messages for a specific room
router.get('/:roomId', 
    auth,
    validations.roomId,
    validateRequest,
    async (req, res, next) => {
        try {
            const messages = await Message.find({ chatRoom: req.params.roomId })
                .populate('sender', 'username email')
                .sort({ timestamp: -1 })
                .limit(50);

            res.json(messages);
        } catch (error) {
            next(error);
        }
    }
);

// Get messages with pagination
router.get('/:roomId/page/:page', 
    auth,
    [
        ...validations.roomId,
        param('page')
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer')
    ],
    validateRequest,
    async (req, res, next) => {
        try {
            const page = parseInt(req.params.page);
            const limit = 20;
            const skip = (page - 1) * limit;

            const messages = await Message.find({ chatRoom: req.params.roomId })
                .populate('sender', 'username email')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Message.countDocuments({ chatRoom: req.params.roomId });

            res.json({
                messages,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalMessages: total
            });
        } catch (error) {
            next(error);
        }
    }
);

// Add message to a specific room
router.post('/:roomId', 
    auth,
    validations.roomId,
    validations.message,
    validateRequest,
    async (req, res, next) => {
        try {
            const message = new Message({
                content: req.body.content,
                sender: req.user._id,
                chatRoom: req.params.roomId
            });

            await message.save();
            await message.populate('sender', 'username email');

            res.status(201).json(message);
        } catch (error) {
            next(error);
        }
    }
);

// Delete a message
router.delete('/:messageId', 
    auth,
    [
        param('messageId')
            .isMongoId()
            .withMessage('Invalid message ID')
    ],
    validateRequest,
    async (req, res, next) => {
        try {
            const message = await Message.findById(req.params.messageId);
            
            if (!message) {
                return res.status(404).json({ error: 'Message not found' });
            }

            // Check if the user is the sender of the message
            if (message.sender.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Not authorized to delete this message' });
            }

            await Message.findByIdAndDelete(req.params.messageId);
            res.json({ message: 'Message deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router; 
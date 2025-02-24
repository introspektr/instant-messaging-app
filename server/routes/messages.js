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

module.exports = router; 
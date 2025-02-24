const { validationResult, body, param } = require('express-validator');

// Middleware to check validation results
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validation rules for different routes
const validations = {
    register: [
        body('username')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long'),
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
    ],

    login: [
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
    ],

    createChatRoom: [
        body('name')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Chat room name must be at least 3 characters long'),
    ],

    roomId: [
        param('id')
            .isMongoId()
            .withMessage('Invalid room ID'),
    ],

    message: [
        body('content')
            .trim()
            .notEmpty()
            .withMessage('Message content cannot be empty'),
    ],
};

module.exports = { validateRequest, validations }; 
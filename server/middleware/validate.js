/**
 * Validation Middleware
 * 
 * This file defines validation rules and middleware for validating 
 * incoming requests before they reach the route handlers.
 * 
 * MERN Stack Context:
 * - Part of the Express backend (E in MERN)
 * - Acts as a filter/guard for incoming requests
 * - Prevents invalid data from reaching the database
 * - Uses express-validator to define and check validation rules
 */
const { validationResult, body, param } = require('express-validator');
const { error: errorResponse } = require('../utils/responseHandler');

/**
 * Middleware to check validation results
 * 
 * This function examines the validation results from express-validator
 * and sends a standardized error response if validation fails.
 * 
 * How it works:
 * 1. express-validator middleware runs first and attaches validation results to request
 * 2. This middleware checks if there are any validation errors
 * 3. If errors exist, it returns a 400 Bad Request with error details
 * 4. If no errors, it calls next() to proceed to the route handler
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return errorResponse(
            res, 
            400, 
            'Validation failed', 
            { details: errors.array() }
        );
    }
    next();
};

/**
 * Validation Rules
 * 
 * Each property defines an array of validation rules for different routes.
 * These rules are applied as middleware before the route handler.
 * 
 * Express-validator provides various validation methods:
 * - body(): validates request body fields
 * - param(): validates URL parameters
 * - query(): validates query string parameters
 * 
 * Chain methods like .isEmail(), .isLength() to define validation criteria
 * Use .withMessage() to provide custom error messages
 */
const validations = {
    /**
     * User registration validation rules
     * 
     * Validates:
     * - username: at least 3 characters
     * - email: must be valid email format
     * - password: at least 6 characters
     */
    register: [
        body('username')
            .trim()                          // Remove whitespace
            .isLength({ min: 3 })            // Check length
            .withMessage('Username must be at least 3 characters long'),
        body('email')
            .isEmail()                       // Check email format
            .withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })            // Check password length
            .withMessage('Password must be at least 6 characters long'),
    ],

    /**
     * User login validation rules
     * 
     * Validates:
     * - email: must be valid email format
     * - password: must not be empty
     */
    login: [
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .notEmpty()                      // Check that field is not empty
            .withMessage('Password is required'),
    ],

    /**
     * Chat room creation validation rules
     * 
     * Validates:
     * - name: at least 3 characters
     */
    createChatRoom: [
        body('name')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Chat room name must be at least 3 characters long'),
    ],

    /**
     * Room ID validation (ensures it's a valid MongoDB ObjectId)
     * 
     * Validates:
     * - roomId parameter follows MongoDB ObjectId format (24 hex characters)
     */
    roomId: [
        param('roomId')                      // Check URL parameter
            .isMongoId()                     // Verify it's a valid MongoDB ID
            .withMessage('Invalid room ID'),
    ],

    /**
     * Message content validation
     * 
     * Validates:
     * - content: must not be empty after trimming whitespace
     */
    message: [
        body('content')
            .trim()
            .notEmpty()                      // Ensures content isn't empty
            .withMessage('Message content cannot be empty'),
    ],
};

// Export both the validation rules and middleware function
module.exports = { validateRequest, validations }; 
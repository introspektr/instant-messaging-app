/**
 * Global Error Handling Middleware
 * 
 * This middleware catches all errors thrown during request processing
 * and transforms them into standardized API responses.
 * 
 * MERN Stack Context:
 * - Part of the Express backend (E in MERN)
 * - Acts as a safety net for errors across the application
 * - Ensures all errors are logged and handled consistently
 * - Prevents server crashes by catching unhandled errors
 * 
 * How Express Error Handling Works:
 * 1. When next(error) is called in any route or middleware
 * 2. Express skips all remaining non-error middleware
 * 3. This middleware (with 4 parameters) catches the error
 * 4. We return a consistent error response to the client
 */
const logger = require('../utils/logger');
const { error: errorResponse } = require('../utils/responseHandler');

/**
 * Error handler middleware function
 * 
 * Express identifies this as an error handler because it has 4 parameters
 * 
 * @param {Error} err - The error object thrown or passed to next()
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function (not used here)
 */
const errorHandler = (err, req, res, next) => {
    // Log the error for server-side debugging
    logger.error(`Error: ${err.message}`, err.stack);

    /**
     * MongoDB Duplicate Key Error (code 11000)
     * 
     * Occurs when trying to insert a document that violates a unique index
     * Example: Creating a user with an email that already exists
     */
    if (err.code === 11000) {
        // Extract the field name that caused the duplicate key error
        const field = Object.keys(err.keyPattern)[0];
        return errorResponse(
            res, 
            400, 
            'Duplicate value entered', 
            { field }
        );
    }

    /**
     * MongoDB Validation Error
     * 
     * Occurs when a document fails Mongoose schema validation
     * Example: Missing required fields or invalid data formats
     */
    if (err.name === 'ValidationError') {
        // Extract all validation error messages into an array
        const errors = Object.values(err.errors).map(error => error.message);
        return errorResponse(
            res, 
            400, 
            'Validation error', 
            { details: errors }
        );
    }

    /**
     * JWT Authentication Error
     * 
     * Occurs when a JWT token is invalid
     * Example: Token has been tampered with or incorrectly formed
     */
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 401, 'Invalid token');
    }

    /**
     * JWT Token Expiration Error
     * 
     * Occurs when a JWT token has expired
     * Example: User trying to access a protected route with an old token
     */
    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Token expired');
    }

    /**
     * Default Error Handler
     * 
     * Catches any other errors not specifically handled above
     * Uses the error's status code if available, otherwise defaults to 500
     */
    return errorResponse(
        res, 
        err.status || 500, 
        err.message || 'Internal server error'
    );
};

// Export the middleware for use in the Express app
module.exports = errorHandler; 
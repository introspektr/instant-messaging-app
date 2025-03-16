/**
 * Authentication Middleware
 * 
 * This middleware protects routes by verifying the JWT token and
 * ensuring the user is authenticated before proceeding to the route handler.
 * 
 * MERN Stack Context:
 * - Part of the Express backend (E in MERN)
 * - Implements JWT (JSON Web Token) authentication
 * - Acts as a gatekeeper for protected routes
 * - Attached to routes that require authentication
 * 
 * How JWT Authentication Works:
 * 1. When a user logs in, the server creates a signed JWT token
 * 2. The client stores this token (typically in localStorage)
 * 3. For protected requests, the client includes the token in the Authorization header
 * 4. This middleware verifies the token and allows/denies access
 */
const jwt = require('jsonwebtoken'); // Library to verify JWT tokens
const User = require('../models/User'); // User model to look up the authenticated user
const logger = require('../utils/logger'); // Logger utility for errors
const { error: errorResponse } = require('../utils/responseHandler'); // Standard error response
const config = require('../config'); // Application configuration

/**
 * Authentication middleware function
 * 
 * This function is added to routes that require authentication:
 * router.get('/protected-route', auth, routeHandler);
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const auth = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        // Format should be: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        // If no token provided, return authentication error
        if (!token) {
            return errorResponse(res, 401, 'Authentication required');
        }

        // Verify the token is valid and not expired
        // This will throw an error if the token is invalid or expired
        const decoded = jwt.verify(token, config.jwt.secret);
        
        // Find the user by ID (from the decoded token)
        // This confirms the user still exists in the database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return errorResponse(res, 401, 'User not found');
        }

        // Attach user and token to request
        // These will be available in the route handler that follows
        req.user = user; // The authenticated user document
        req.token = token; // The verified token
        
        // Everything is valid, proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Log authentication errors for troubleshooting
        logger.error('Authentication error:', error.message);
        
        // Return standardized error response
        // This could be due to an invalid token, expired token, etc.
        return errorResponse(res, 401, 'Authentication failed');
    }
};

// Export the middleware for use in routes
module.exports = auth; 
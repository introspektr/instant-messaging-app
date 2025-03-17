/**
 * Authentication Routes
 * 
 * This file defines API endpoints for user authentication, including:
 * - User registration (signup)
 * - User login
 * - Protected routes for authenticated users
 * - User logout
 * 
 * MERN Stack Context:
 * - Part of the Express backend (E in MERN)
 * - Handles the authentication logic using JWT (JSON Web Tokens)
 * - Creates and verifies tokens that will be stored on the client (browser)
 */
const express = require('express');
const router = express.Router(); // Create a router object to define routes
const jwt = require('jsonwebtoken'); // Library for creating and verifying JWTs
const User = require('../models/User'); // User model for database operations
const auth = require('../middleware/auth'); // Middleware to protect routes
const { success, error } = require('../utils/responseHandler'); // Standardized response formatting
const { validateRequest, validations } = require('../middleware/validate'); // Request validation
const config = require('../config'); // Application configuration

/**
 * POST /api/auth/register
 * Register a new user (signup)
 * 
 * Middleware:
 * - validations.register: Validates username, email, and password
 * - validateRequest: Handles validation errors
 * 
 * Request body:
 * - username: User's desired username
 * - firstName: User's first name (optional)
 * - lastName: User's last name (optional)
 * - email: User's email address
 * - password: User's password (will be hashed before storing)
 * 
 * Response:
 * - 201: User created successfully with user details and JWT token
 * - 400: Validation error or user already exists
 * - 500: Server error
 */
router.post('/register', 
    validations.register,
    validateRequest,
    async (req, res) => {
        try {
            const { username, email, password, firstName, lastName } = req.body;

            // Check if user with this email or username already exists
            const existingUser = await User.findOne({ 
                $or: [{ email }, { username }] 
            });

            if (existingUser) {
                return error(res, 400, 'User with this email or username already exists');
            }

            // Create new user (password will be hashed by the model's pre-save hook)
            const user = new User({ 
                username, 
                email, 
                password,
                firstName: firstName || '',
                lastName: lastName || '' 
            });
            await user.save();

            // Generate JWT token - this will be used for authenticating future requests
            // The token contains the user ID and expires after a set period
            const token = jwt.sign(
                { userId: user._id }, 
                config.jwt.secret, 
                { expiresIn: config.jwt.expiresIn }
            );

            // Return success with user details (excluding password) and token
            return success(res, 201, 'User created successfully', {
                user: {
                    id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                },
                token
            });

        } catch (err) {
            return error(res, 500, 'Registration failed', { details: err.message });
        }
    }
);

/**
 * POST /api/auth/login
 * Log in an existing user
 * 
 * Middleware:
 * - validations.login: Validates email and password
 * - validateRequest: Handles validation errors
 * 
 * Request body:
 * - email: User's email address
 * - password: User's password
 * 
 * Response:
 * - 200: Login successful with user details and JWT token
 * - 401: Invalid credentials
 * - 500: Server error
 */
router.post('/login',
    validations.login,
    validateRequest,
    async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return error(res, 401, 'Invalid credentials');
            }

            // Verify password using the model's comparePassword method
            // This will compare the plain text password with the hashed one
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return error(res, 401, 'Invalid credentials');
            }

            // Generate JWT token for authentication
            const token = jwt.sign(
                { userId: user._id }, 
                config.jwt.secret, 
                { expiresIn: config.jwt.expiresIn }
            );

            // Return success with user details and token
            return success(res, 200, 'Login successful', {
                user: {
                    id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                },
                token
            });

        } catch (err) {
            return error(res, 500, 'Login failed', { details: err.message });
        }
    }
);

/**
 * GET /api/auth/me
 * Get the authenticated user's profile
 * 
 * Middleware:
 * - auth: Ensures user is authenticated and attaches user object to request
 * 
 * Response:
 * - 200: User details
 * - 401: Not authenticated
 * - 500: Server error
 * 
 * Note: This is a protected route - only accessible with a valid JWT token
 */
router.get('/me', auth, async (req, res) => {
    try {
        // The auth middleware already attached the user to the request
        // We just need to return it as a response
        return success(res, 200, 'User profile retrieved successfully', {
            user: {
                id: req.user._id,
                username: req.user.username,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email
            }
        });
    } catch (err) {
        return error(res, 500, 'Failed to retrieve user profile', { details: err.message });
    }
});

/**
 * POST /api/auth/logout
 * Log out the current user
 * 
 * Middleware:
 * - auth: Ensures user is authenticated
 * 
 * Response:
 * - 200: Logout successful
 * - 401: Not authenticated
 * - 500: Server error
 * 
 * Note: In a JWT-based authentication system, the actual token invalidation
 * is typically handled on the client side by removing the token from storage.
 * A more robust system would implement token blacklisting on the server.
 */
router.post('/logout', auth, async (req, res) => {
    try {
        // In a real application, you might want to add the token to a blacklist
        // or implement a token revocation mechanism
        
        // For now, we just confirm successful logout
        // The client will remove the token from storage
        return success(res, 200, 'Logged out successfully');
    } catch (err) {
        return error(res, 500, 'Logout failed', { details: err.message });
    }
});

/**
 * PUT /api/auth/profile
 * Update the authenticated user's profile
 * 
 * Middleware:
 * - auth: Ensures user is authenticated
 * 
 * Request body:
 * - firstName: User's first name
 * - lastName: User's last name
 * 
 * Response:
 * - 200: Profile updated successfully
 * - 400: Validation error
 * - 401: Not authenticated
 * - 500: Server error
 */
router.put('/profile', auth, async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        
        // Find the authenticated user and update profile fields
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return error(res, 404, 'User not found');
        }
        
        // Update fields if provided
        if (firstName !== undefined) {
            user.firstName = firstName.trim();
        }
        
        if (lastName !== undefined) {
            user.lastName = lastName.trim();
        }
        
        await user.save();
        
        return success(res, 200, 'Profile updated successfully', {
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (err) {
        return error(res, 500, 'Failed to update profile', { details: err.message });
    }
});

// Export the router to be mounted in the main Express app
module.exports = router; 
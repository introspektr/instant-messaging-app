/**
 * Response Handler Utility
 * 
 * This module provides standardized methods for formatting API responses
 * to ensure consistency across all endpoints in the application.
 * 
 * MERN Stack Context:
 * - Used across the Express backend (E in MERN) API routes
 * - Creates a consistent response format for the React frontend to parse
 * - Makes API behavior predictable for frontend developers
 * - Simplifies error handling and success responses
 * 
 * Why Standardized Responses Matter:
 * - Consistent structure makes frontend code simpler
 * - Clear success/error indicators
 * - Standard fields for message and data payload
 * - Proper HTTP status codes for different scenarios
 * 
 * Response Format:
 * {
 *   success: boolean,     // Was the request successful?
 *   message: string,      // Human-readable message
 *   data/errors: object   // Response payload or error details
 * }
 */

/**
 * Send a success response
 * 
 * Used when an API operation completes successfully to return data
 * with a consistent format to the client.
 * 
 * Example usage:
 * ```
 * return success(res, 201, 'User created successfully', { user });
 * ```
 * 
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 *                             200: OK - Standard success
 *                             201: Created - Resource created
 *                             204: No Content - Success with no body
 * @param {string} message - Success message for the client
 * @param {Object} data - Response data payload
 * @returns {Object} Express response
 */
const success = (res, statusCode = 200, message = 'Success', data = {}) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Send an error response
 * 
 * Used when an API operation fails to return error details
 * with a consistent format to the client.
 * 
 * Example usage:
 * ```
 * return error(res, 404, 'User not found', { id: 'Invalid user ID' });
 * ```
 * 
 * Common Status Codes:
 * - 400: Bad Request (client error, invalid data)
 * - 401: Unauthorized (authentication required)
 * - 403: Forbidden (authenticated but not authorized)
 * - 404: Not Found (resource doesn't exist)
 * - 500: Internal Server Error (unexpected server error)
 * 
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Error message for the client
 * @param {Object} errors - Detailed error information (optional)
 * @returns {Object} Express response
 */
const error = (res, statusCode = 500, message = 'Error', errors = null) => {
    // Create the base response object
    const response = {
        success: false,
        message
    };

    // Add detailed errors if provided
    if (errors) {
        response.errors = errors;
    }

    // Send the response with appropriate status code
    return res.status(statusCode).json(response);
};

// Export the utility functions for use throughout the application
module.exports = {
    success,
    error
}; 
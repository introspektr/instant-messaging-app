/**
 * Logger Utility
 * 
 * This module provides consistent logging across the application, with
 * different severity levels and environment-based configuration.
 * 
 * MERN Stack Context:
 * - A utility used across the Express backend (E in MERN)
 * - Standardizes log output for easier debugging and monitoring
 * - Configures logging behavior based on environment (development/test/production)
 * - Replaces direct console.log calls with structured logging
 * 
 * Why Use a Custom Logger?
 * - Consistent timestamp format for all logs
 * - Severity level labeling (INFO, WARN, ERROR, DEBUG)
 * - Environment-aware logging (suppresses logs in test environment)
 * - Can be extended to write logs to files or external services
 */

/**
 * Log informational messages
 * 
 * For general application information like startup messages,
 * successful operations, or status updates.
 * Not displayed in test environment.
 * 
 * Example: logger.info('Server started on port 3000');
 * 
 * @param {...any} args - Content to log
 */
const info = (...args) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(new Date().toISOString(), '[INFO]', ...args);
    }
};

/**
 * Log warning messages
 * 
 * For potential issues that don't prevent the application from working
 * but might indicate problems or unexpected behavior.
 * Not displayed in test environment.
 * 
 * Example: logger.warn('API rate limit approaching');
 * 
 * @param {...any} args - Content to log
 */
const warn = (...args) => {
    if (process.env.NODE_ENV !== 'test') {
        console.warn(new Date().toISOString(), '[WARN]', ...args);
    }
};

/**
 * Log error messages
 * 
 * For exceptions, failures, and other error conditions that affect
 * application functionality. These should be addressed.
 * Not displayed in test environment.
 * 
 * Example: logger.error('Database connection failed:', error);
 * 
 * @param {...any} args - Content to log (often includes Error objects)
 */
const error = (...args) => {
    if (process.env.NODE_ENV !== 'test') {
        console.error(new Date().toISOString(), '[ERROR]', ...args);
    }
};

/**
 * Log debug messages
 * 
 * For detailed information useful during development and debugging.
 * Only displayed in development environment.
 * 
 * Example: logger.debug('Request payload:', req.body);
 * 
 * @param {...any} args - Content to log
 */
const debug = (...args) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(new Date().toISOString(), '[DEBUG]', ...args);
    }
};

// Export the logger functions for use throughout the application
module.exports = {
    info,
    warn,
    error,
    debug
}; 
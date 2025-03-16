/**
 * Application Configuration
 * 
 * Centralizes all configuration values and environment variables.
 * Provides defaults for development and handles environment-specific settings.
 */
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./utils/logger');

// Determine which .env file to load based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

// Load environment variables from appropriate .env file
dotenv.config({ path: path.resolve(__dirname, envFile) });

/**
 * Configuration object containing all application settings
 */
const config = {
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/chat-app'
  },
  server: {
    port: process.env.PORT || 8747,
    origin: process.env.ORIGIN || 'http://localhost:5173'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_dev_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  environment: process.env.NODE_ENV || 'development'
};

// Log configuration on startup (only in non-test environments)
if (process.env.NODE_ENV !== 'test') {
  logger.info('Configuration loaded:');
  logger.info('Environment:', config.environment);
  logger.info('Database URL exists:', !!config.database.url);
  logger.info('Server port:', config.server.port);
  logger.info('CORS origin:', config.server.origin);
  logger.info('JWT configuration exists:', !!config.jwt.secret);
}

module.exports = config; 
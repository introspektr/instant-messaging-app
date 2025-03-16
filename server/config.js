const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const config = {
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/chat-app'
  },
  server: {
    port: process.env.PORT || 8747,
    origin: process.env.ORIGIN || 'http://localhost:5173'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_dev_secret_key'
  }
};

// Log configuration on startup (without sensitive info)
console.log('Configuration loaded:');
console.log('Database URL exists:', !!config.database.url);
console.log('Server port:', config.server.port);
console.log('CORS origin:', config.server.origin);
console.log('JWT secret exists:', !!config.jwt.secret);

module.exports = config; 
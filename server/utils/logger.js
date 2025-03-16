// Simple logger utility
const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data ? data : '');
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error ? error : '');
  },
  debug: (message, data) => {
    console.log(`[DEBUG] ${message}`, data ? data : '');
  },
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data ? data : '');
  }
};

module.exports = logger; 
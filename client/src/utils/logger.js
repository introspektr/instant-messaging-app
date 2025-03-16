/**
 * Simple logger utility for client-side logging
 * In production, this could be configured to send logs to a server
 */
const logger = {
  debug: (message, data) => {
    if (import.meta.env.MODE !== 'production') {
      console.log(`[DEBUG] ${message}`, data ? data : '');
    }
  },
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data ? data : '');
  },
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data ? data : '');
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error ? error : '');
  }
};

export default logger; 
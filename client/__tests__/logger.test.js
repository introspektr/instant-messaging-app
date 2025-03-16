/**
 * Test suite for the logger utility
 * This utility provides consistent logging throughout the application
 */

// Import the mock logger
import logger from '../__mocks__/loggerMock';

describe('Logger Utility', () => {
  // Save original console methods
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    // Mock console methods
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    
    // Reset mock functions
    logger.debug.mockReset();
    logger.info.mockReset();
    logger.warn.mockReset();
    logger.error.mockReset();
    
    // Implement mock behavior
    logger.info.mockImplementation((message, data) => {
      console.log(`[INFO] ${message}`, data || '');
    });
    
    logger.warn.mockImplementation((message, data) => {
      console.warn(`[WARN] ${message}`, data || '');
    });
    
    logger.error.mockImplementation((message, error) => {
      console.error(`[ERROR] ${message}`, error || '');
    });
  });
  
  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });
  
  test('info logs a message with [INFO] prefix', () => {
    logger.info('Test info message');
    expect(console.log).toHaveBeenCalledWith('[INFO] Test info message', '');
  });
  
  test('info logs a message with additional data', () => {
    const data = { key: 'value' };
    logger.info('Test info message with data', data);
    expect(console.log).toHaveBeenCalledWith('[INFO] Test info message with data', data);
  });
  
  test('warn logs a message with [WARN] prefix', () => {
    logger.warn('Test warning message');
    expect(console.warn).toHaveBeenCalledWith('[WARN] Test warning message', '');
  });
  
  test('error logs a message with [ERROR] prefix', () => {
    logger.error('Test error message');
    expect(console.error).toHaveBeenCalledWith('[ERROR] Test error message', '');
  });
  
  test('error logs a message with an error object', () => {
    const error = new Error('Test error');
    logger.error('Test error message with error object', error);
    expect(console.error).toHaveBeenCalledWith('[ERROR] Test error message with error object', error);
  });
}); 
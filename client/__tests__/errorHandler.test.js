import { handleApiError } from '../src/utils/errorHandler';

/**
 * Test suite for the errorHandler utility
 * 
 * This utility provides consistent error handling for API requests.
 */
describe('Error Handler Utility', () => {
  // Mock Response class since it's not available in Node.js environment
  // eslint-disable-next-line no-undef
  global.Response = class Response {
    constructor(body, options = {}) {
      this.body = body;
      this.status = options.status || 200;
      this.statusText = options.statusText || '';
      this._json = JSON.parse(body);
    }
    
    async json() {
      return this._json;
    }
  };

  // Test handling of Response objects
  test('extracts error message from Response object with JSON data', async () => {
    // Mock a Response object with error data
    const mockResponse = new Response(JSON.stringify({ error: 'API error message' }), {
      status: 400,
      statusText: 'Bad Request'
    });
    
    // Mock callback function
    const mockCallback = jest.fn();
    
    // Call the error handler
    await handleApiError(mockResponse, mockCallback);
    
    // Check that callback was called with the correct error message
    expect(mockCallback).toHaveBeenCalledWith('API error message');
  });
  
  // Test handling of Error objects
  test('extracts message from Error object', async () => {
    // Create an Error object with a message
    const mockError = new Error('Error object message');
    
    // Mock callback function
    const mockCallback = jest.fn();
    
    // Call the error handler
    await handleApiError(mockError, mockCallback);
    
    // Check that callback was called with the correct error message
    expect(mockCallback).toHaveBeenCalledWith('Error object message');
  });
  
  // Test handling of plain objects with error property
  test('extracts error from plain object with error property', async () => {
    // Create a plain object with an error property
    const mockErrorObj = { error: 'Plain object error message' };
    
    // Mock callback function
    const mockCallback = jest.fn();
    
    // Call the error handler
    await handleApiError(mockErrorObj, mockCallback);
    
    // Check that callback was called with the correct error message
    expect(mockCallback).toHaveBeenCalledWith('Plain object error message');
  });
  
  // Test handling of plain objects with message property
  test('extracts message from plain object with message property', async () => {
    // Create a plain object with a message property
    const mockMessageObj = { message: 'Plain object message' };
    
    // Mock callback function
    const mockCallback = jest.fn();
    
    // Call the error handler
    await handleApiError(mockMessageObj, mockCallback);
    
    // Check that callback was called with the correct error message
    expect(mockCallback).toHaveBeenCalledWith('Plain object message');
  });
  
  // Test handling of unknown error types
  test('uses default message for unknown error types', async () => {
    const mockCallback = jest.fn();
    
    // Call the error handler with null (which is not a recognized error type)
    await handleApiError(null, mockCallback, 'Default error message');
    
    // Check that callback was called with the default message
    expect(mockCallback).toHaveBeenCalledWith('Default error message');
  });
}); 
/**
 * Jest Setup File
 * 
 * This file runs before your tests and sets up:
 * 1. Testing utilities and extensions
 * 2. Polyfills for browser APIs not available in Node.js
 * 3. Mocks for browser APIs that tests might need
 * 4. Suppression of certain console messages
 */

// Import the testing-library's Jest DOM extensions
// This adds custom matchers like .toBeInTheDocument() to make assertions easier
require('@testing-library/jest-dom');

/**
 * TextEncoder and TextDecoder Polyfills
 * 
 * These browser APIs aren't available in Node.js, but our code might use them.
 * We create simple replacements so tests don't crash when code tries to use them.
 */

// Add TextEncoder polyfill - used to convert strings to Uint8Arrays
global.TextEncoder = class TextEncoder {
  encode(text) {
    // Convert each character in the text to its character code
    // and store it in a Uint8Array (array of 8-bit unsigned integers)
    const buf = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      buf[i] = text.charCodeAt(i);
    }
    return buf;
  }
};

// Add TextDecoder polyfill - used to convert Uint8Arrays back to strings
global.TextDecoder = class TextDecoder {
  decode(buf) {
    // Convert each number in the buffer back to its character representation
    let result = '';
    for (let i = 0; i < buf.length; i++) {
      result += String.fromCharCode(buf[i]);
    }
    return result;
  }
};

/**
 * Mock localStorage
 * 
 * localStorage isn't available in Jest's test environment, so we create a mock version.
 * This allows components that use localStorage to be tested without errors.
 */
Object.defineProperty(window, 'localStorage', {
  value: {
    // Mock functions that return predetermined values
    getItem: jest.fn(() => 'fake-token'), // Always returns a fake token
    setItem: jest.fn(),                   // Does nothing but can be spied on
    removeItem: jest.fn(),                // Does nothing but can be spied on
    clear: jest.fn()                      // Does nothing but can be spied on
  },
  writable: true // Allow tests to override this mock if needed
});

/**
 * Mock fetch API
 * 
 * fetch is a browser API for making HTTP requests.
 * We provide a mock implementation that returns a successful response by default.
 * Individual tests can override this as needed.
 */
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,                     // Simulate a successful response
    json: () => Promise.resolve({}) // Return an empty object as the response data
  })
);

/**
 * Intercept console.error
 * 
 * This replaces the real console.error with a custom function that filters out
 * certain expected error messages during tests.
 */
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress specific warnings and errors that are expected during tests
  if (
    // React act warnings - these often appear in tests but don't indicate real problems
    (typeof args[0] === 'string' && args[0].includes('ReactDOMTestUtils.act')) ||
    // Login error messages that are expected as part of testing error handling
    (typeof args[0] === 'string' && args[0].includes('Login error: Error: Invalid credentials'))
  ) {
    return; // Don't output anything for these errors
  }
  // For all other errors, use the original console.error
  originalConsoleError(...args);
}; 
/**
 * Test Utility Functions
 * 
 * This file provides common utility functions and setup for tests.
 * Using these helpers improves consistency across test files and reduces code duplication.
 */

import { render } from '@testing-library/react';

/**
 * Mock localStorage for testing
 * This object mimics localStorage API but stores data in memory
 * @type {Object}
 */
export const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    _getStore: () => store // Helper for tests to inspect the store
  };
})();

/**
 * Setup localStorage mock before tests
 * @returns {Function} A cleanup function to restore original localStorage
 */
export const setupLocalStorageMock = () => {
  const originalLocalStorage = global.localStorage;
  
  // Replace localStorage with our mock
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
  
  // Clear mock calls before each test
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockLocalStorage.removeItem.mockClear();
  mockLocalStorage.clear.mockClear();
  
  // Return cleanup function
  return () => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  };
};

/**
 * Custom render function with extended options
 * 
 * @param {React.ReactElement} ui - The component to render
 * @param {Object} options - Additional render options
 * @returns {Object} The rendered component with added utilities
 */
export const customRender = (ui, options = {}) => {
  return render(ui, { ...options });
};

/**
 * Create a standard mock function with implementation tracking
 * 
 * @param {Function} [implementation] - Optional default implementation
 * @returns {Function} A Jest mock function
 */
export const createMockFunction = (implementation) => {
  return jest.fn(implementation);
};

// Re-export everything from RTL
export * from '@testing-library/react'; 
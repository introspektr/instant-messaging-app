/**
 * Jest Configuration File
 * 
 * This file configures how Jest will run our tests. Jest is a JavaScript testing framework
 * that allows us to write and run tests for our React components and utilities.
 */
module.exports = {
  // Set the test environment to jsdom, which simulates a browser-like environment for testing
  // This is essential for testing React components that interact with the DOM
  testEnvironment: 'jsdom',
  
  // Setup files that run before each test
  // These files contain global setup code like polyfills and mock implementations
  setupFilesAfterEnv: ['./jest.setup.cjs'],
  
  // Map file extensions to mock implementations
  // This tells Jest how to handle importing non-JavaScript files in tests
  moduleNameMapper: {
    // Image files are mocked with a simple file mock
    // This prevents errors when components import image files
    '\\.(jpg|jpeg|png|gif)$': '<rootDir>/__mocks__/fileMock.js',
    
    // SVG files are mocked with a specific SVG mock
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    
    // CSS files are handled by identity-obj-proxy
    // This allows components to import CSS without errors
    '\\.css$': 'identity-obj-proxy',
    
    // Replace the logger with a mock in tests
    // This prevents unnecessary console output during tests
    '^../src/utils/logger$': '<rootDir>/__mocks__/loggerMock.js'
  },
  
  // Configure how files are transformed before running tests
  // This uses babel-jest to transform JSX and modern JavaScript syntax
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
}; 
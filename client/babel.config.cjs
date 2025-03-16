/**
 * Babel Configuration File
 * 
 * Babel is a JavaScript compiler that converts modern JavaScript code into a version
 * that can run in older browsers. This file configures how Babel transforms our code.
 * 
 * For our testing environment, we need Babel to:
 * 1. Convert modern JS features to compatible code (preset-env)
 * 2. Transform JSX into regular JavaScript functions (preset-react)
 */
module.exports = {
  // Presets are pre-configured sets of Babel plugins
  presets: [
    // @babel/preset-env handles ES6+ syntax transformation
    [
      '@babel/preset-env', 
      { 
        targets: { node: 'current' }  // Optimize for the current Node.js version
      }
    ],
    
    // @babel/preset-react handles JSX transformation
    [
      '@babel/preset-react', 
      { 
        runtime: 'automatic'  // Automatically imports React where needed
                              // (no need for "import React from 'react'" in every file)
      }
    ]
  ],
};
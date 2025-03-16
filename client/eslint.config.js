/**
 * ESLint Configuration File
 * 
 * ESLint is a tool that analyzes your code to find problems and enforce consistent style.
 * This file configures how ESLint will lint your JavaScript and JSX files.
 * 
 * The configuration is an array of objects, each containing rules for specific files.
 */

// Import the required ESLint plugins and configs
import js from '@eslint/js'                // Base JavaScript rules
import globals from 'globals'              // Global variables definitions
import react from 'eslint-plugin-react'    // React-specific rules
import reactHooks from 'eslint-plugin-react-hooks' // Rules for React hooks
import reactRefresh from 'eslint-plugin-react-refresh' // Rules for React Fast Refresh
import jestPlugin from 'eslint-plugin-jest' // Jest testing rules

export default [
  // First config object: ignore the 'dist' directory
  { ignores: ['dist'] },  // Doesn't lint files in the distribution folder
  
  // Second config object: rules for JS and JSX files
  {
    files: ['**/*.{js,jsx}'],  // Apply to all JS and JSX files
    
    // Language options configure the JavaScript features ESLint should expect
    languageOptions: {
      ecmaVersion: 2020,                // Use ECMAScript 2020 features
      globals: globals.browser,         // Include browser globals like window, document, etc.
      parserOptions: {
        ecmaVersion: 'latest',          // Parse the latest ECMAScript features
        ecmaFeatures: { jsx: true },    // Enable JSX parsing
        sourceType: 'module',           // Treat files as ES modules
      },
    },
    
    // Settings shared across all rules
    settings: { react: { version: '18.3' } },  // Tell ESLint which React version we're using
    
    // Plugins extend ESLint with additional rules
    plugins: {
      react,                  // Rules for React
      'react-hooks': reactHooks,    // Rules for React hooks (useState, useEffect, etc.)
      'react-refresh': reactRefresh, // Rules for React Fast Refresh
    },
    
    // The actual linting rules to apply
    rules: {
      // Include all recommended rules from different plugins
      ...js.configs.recommended.rules,           // Base JS recommended rules
      ...react.configs.recommended.rules,        // React recommended rules
      ...react.configs['jsx-runtime'].rules,     // Rules for the new JSX transform
      ...reactHooks.configs.recommended.rules,   // React hooks rules
      
      // Custom rule overrides
      'react/jsx-no-target-blank': 'off',        // Allow target="_blank" without rel="noreferrer"
      'react-refresh/only-export-components': [  // Configure React Refresh rule
        'warn',                                 // Warning level, not error
        { allowConstantExport: true },          // Allow exporting constants
      ],
    },
  },
  
  // Third config object: rules specific to test files
  {
    files: ['**/__tests__/**/*.{js,jsx}', '**/*.test.{js,jsx}'],  // Only apply to test files
    
    // Add Jest-specific rules
    plugins: {
      jest: jestPlugin,  // Rules for Jest testing
    },
    
    // Add Jest globals like describe, it, expect, etc.
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
      },
    },
    
    // Test-specific rules
    rules: {
      'jest/no-disabled-tests': 'warn',     // Warn about disabled tests (it.skip, describe.skip)
      'jest/no-focused-tests': 'error',     // Error on focused tests (it.only, describe.only)
      'jest/no-identical-title': 'error',   // Error on duplicate test titles
      'jest/valid-expect': 'error',         // Error on invalid expect() usage
    },
  },
]

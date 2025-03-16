# Instant Messaging App - Backend Tests

This document explains the backend testing setup for the Instant Messaging App.

## Overview

The backend tests use:
- **Jest** as the test runner
- **@shelf/jest-mongodb** for in-memory MongoDB testing
- **Supertest** for HTTP request testing
- **Socket.io-client** for websocket testing

## Test Structure

The tests are organized into the following categories:

1. **Authentication Tests** (`auth.test.js`):
   - User registration
   - User login
   - Protected route access

2. **Chat Room Tests** (`chatrooms.test.js`):
   - Room creation
   - Room listing
   - Room detail retrieval

3. **Message Tests** (`messages.test.js`):
   - Message retrieval
   - Message pagination
   - Authentication requirements

4. **Socket.io Tests** (`socket.test.js`):
   - Socket connection
   - Room creation via sockets
   - Message sending and receiving
   - Room joining

## Running Tests

To run all tests:
```bash
npm test
```

To run tests in watch mode (for development):
```bash
npm run test:watch
```

## Test Environment

Tests run using:
- An in-memory MongoDB database (no external database required)
- Environment variables defined in `.env.test`
- JWT authentication with a test secret key
- Isolated socket.io server

## Adding More Tests

When adding new tests, follow these patterns:
1. Use the existing test structure for consistency
2. Clean up resources after tests
3. Test both successful and error cases
4. For socket tests, make sure to handle connection/disconnection properly 
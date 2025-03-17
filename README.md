# Blab - Instant Messaging Application

A full-stack instant messaging application built with the **MERN stack** (MongoDB, Express, React, Node.js). This application features real-time chat functionality, user authentication, and persistent message storage.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Prerequisites

Ensure the following are installed on your machine before proceeding:

- [Node.js](https://nodejs.org/) (v18.19.0 or later required)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas account)
- [nodemon](https://nodemon.io/) (for development only - will be installed as a dev dependency)

## Project Structure

```bash
full-stack/
├── client                # React frontend
│   ├── src               # Source files
│   │   ├── assets        # Static assets
│   │   ├── components    # Reusable UI components
│   │   ├── pages         # Main application pages
│   │   ├── styles        # CSS files
│   │   ├── utils         # Utility functions
│   │   ├── lib           # Constants and shared libraries
│   │   ├── test-helpers  # Testing utilities
│   │   ├── App.jsx       # Main application component
│   │   ├── App.css       # Application styles
│   │   ├── index.css     # Global styles
│   │   └── main.jsx      # Entry point
│   ├── __tests__         # Frontend tests
│   ├── __mocks__         # Test mocks
│   ├── index.html        # HTML entry point
│   ├── vite.config.js    # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   ├── postcss.config.js # PostCSS configuration
│   ├── jest.config.cjs   # Jest configuration
│   ├── jest.setup.cjs    # Jest setup
│   ├── babel.config.cjs  # Babel configuration
│   ├── eslint.config.js  # ESLint configuration
│   ├── jsconfig.json     # JavaScript configuration
│   ├── components.json   # UI component configuration
│   ├── .env              # Frontend environment variables
│   ├── .env.test         # Test environment variables
│   └── package.json      # Dependencies and scripts
└── server                # Express backend
    ├── models            # MongoDB schemas
    ├── routes            # API route definitions
    ├── middleware        # Express middleware
    ├── utils             # Utility functions and logger
    │   ├── logger.js     # Custom logging utility
    │   └── responseHandler.js # API response formatter
    ├── __tests__         # Backend tests
    ├── socketHandler.js  # WebSocket implementation
    ├── server.js         # Express server setup
    ├── config.js         # Server configuration
    ├── jest.config.js    # Jest configuration for backend
    ├── jest-mongodb-config.js # MongoDB test configuration
    ├── .env              # Backend environment variables
    ├── .env.test         # Test environment variables
    └── package.json      # Dependencies and scripts
```

## Installation

1. **Clone the repository**:

   ```powershell
   git clone https://github.com/introspektr/instant-messaging-app.git full-stack
   cd full-stack
   ```

   _Linux/macOS:_
   ```bash
   git clone https://github.com/introspektr/instant-messaging-app.git full-stack
   cd full-stack
   ```

2. **Set up MongoDB**:

   - **Option 1: Local MongoDB**
     - Make sure MongoDB is installed and running on your local machine
     - Create a database named 'chat-app' (will be created automatically on first run)

   - **Option 2: MongoDB Atlas**
     - Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
     - Set up a new cluster
     - Create a database user and get your connection string

3. **Install server dependencies**:

   ```powershell
   cd server
   $env:MONGOMS_DISABLE_POSTINSTALL=1
   npm install
   ```

   _Linux/macOS:_
   ```bash
   cd server
   MONGOMS_DISABLE_POSTINSTALL=1 npm install
   ```

   This will install all required server dependencies including:
   - Express.js - Web framework
   - Socket.IO - Real-time communication
   - Mongoose - MongoDB object modeling
   - JWT - Authentication
   - bcrypt - Password hashing
   - Dev dependencies like Jest and Supertest for testing

4. **Install client dependencies**:

   ```powershell
   cd ../client
   npm install --legacy-peer-deps
   ```

   _Linux/macOS:_
   ```bash
   cd ../client
   npm install --legacy-peer-deps
   ```

   This will install all required client dependencies including:
   - React - UI library
   - React Router - Client-side routing
   - Socket.IO Client - Real-time communication
   - Tailwind CSS - Utility-first CSS framework
   - Testing libraries for Jest

5. **Configure environment variables**:

   **For the server:**
   
   1. Navigate to the server directory:
      ```powershell
      cd ../server
      ```
      
      _Linux/macOS:_
      ```bash
      cd ../server
      ```
      
   2. Create a new file named `.env`:
      ```powershell
      New-Item -Path .env -ItemType File
      ```
      
      _Linux/macOS:_
      ```bash
      touch .env
      ```
      
   3. Open the `.env` file in your preferred text editor and add the following content:
      ```
      DATABASE_URL=mongodb://localhost:27017/chat-app
      PORT=8747
      ORIGIN=http://localhost:5173
      JWT_SECRET=your_jwt_secret_key_here
      ```
      
   4. Save and close the file.

   **For server tests:**
   
   1. Create a new file named `.env.test` in the server directory:
      ```powershell
      New-Item -Path .env.test -ItemType File
      ```
      
      _Linux/macOS:_
      ```bash
      touch .env.test
      ```
      
   2. Add the following content:
      ```
      DATABASE_URL=mongodb://localhost:27017/chat-app-test
      PORT=8747
      ORIGIN=http://localhost:5173
      JWT_SECRET=test_secret_key
      ```
   
   **For the client:**
   
   1. Navigate to the client directory:
      ```powershell
      cd ../client
      ```
      
      _Linux/macOS:_
      ```bash
      cd ../client
      ```
      
   2. Create a new file named `.env`:
      ```powershell
      New-Item -Path .env -ItemType File
      ```
      
      _Linux/macOS:_
      ```bash
      touch .env
      ```
      
   3. Open the `.env` file in your preferred text editor and add the following content:
      ```
      VITE_SERVER_URL=http://localhost:8747
      ```
      
   4. Save and close the file.

   **Note:** If using MongoDB Atlas, replace the DATABASE_URL with your Atlas connection string.
   For example: `DATABASE_URL=mongodb+srv://username:password@cluster0.example.mongodb.net/chat-app`

## Usage

1. **Start the server**:

   ```powershell
   cd server
   npm run dev
   ```

   _Linux/macOS:_
   ```bash
   cd server
   npm run dev
   ```

   The server will run at http://localhost:8747 by default. The `dev` script uses nodemon to automatically restart the server when changes are detected.

2. **Start the client** (in a new terminal):

   ```powershell
   cd client
   npm run dev
   ```

   _Linux/macOS:_
   ```bash
   cd client
   npm run dev
   ```

   The client will run at http://localhost:5173 by default. This launches a Vite development server that supports hot module replacement.

3. **Access the application** by navigating to http://localhost:5173 in your web browser.

4. **First steps after installation**:
   - Register a new user account
   - Create your first chat room
   - Start messaging!

## Features

- **User Authentication**: Register, login, and secure password storage
- **Real-time Messaging**: Instant message delivery using Socket.IO
- **Chat Rooms**: Create and join different chat rooms
- **User Presence**: See when users are online or offline
- **Message History**: View previous messages when joining a chat room
- **Responsive Design**: Works on both desktop and mobile devices

## Environment Variables

### Server (server/.env)

```
DATABASE_URL=mongodb://localhost:27017/chat-app     # MongoDB connection string
PORT=8747                                           # Server port
ORIGIN=http://localhost:5173                        # Client origin for CORS
JWT_SECRET=your_jwt_secret_key_here                 # JWT signing secret
```

### Server Test Environment (server/.env.test)

```
DATABASE_URL=mongodb://localhost:27017/chat-app-test  # Test database connection string
PORT=8747                                             # Server port
ORIGIN=http://localhost:5173                          # Client origin for CORS
JWT_SECRET=test_secret_key                            # JWT signing secret for tests
```

### Client (client/.env)

```
VITE_SERVER_URL=http://localhost:8747               # Server API URL
```

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login and receive JWT token
- **GET /api/auth/me** - Get the authenticated user's profile
- **PUT /api/auth/profile** - Update user profile (first name, last name)
- **POST /api/auth/logout** - Logout the current user

### Chat Rooms

- **GET /api/chatrooms** - Get all chat rooms
- **POST /api/chatrooms** - Create a new chat room
- **GET /api/chatrooms/:id** - Get a specific chat room
- **PUT /api/chatrooms/:id** - Update a chat room (creator only)
- **DELETE /api/chatrooms/:id** - Delete a chat room
- **POST /api/chatrooms/:id/participants** - Add a participant to a chat room
- **DELETE /api/chatrooms/:id/participants/:userId** - Remove a participant from a chat room
- **GET /api/chatrooms/:id/messages** - Get messages for a specific chat room

### Messages

- **GET /api/messages/:roomId** - Get messages for a specific chat room
- **GET /api/messages/:roomId/page/:page** - Get paginated messages for a chat room
- **POST /api/messages** - Create a new message
- **DELETE /api/messages/:messageId** - Delete a specific message (sender only)

## Testing

The application includes unit and integration tests for both frontend and backend. Tests are configured to run with Jest.

### Running Server Tests

```powershell
cd server
npm test
```

_Linux/macOS:_
```bash
cd server
npm test
```

The server tests use the `@shelf/jest-mongodb` preset which creates an in-memory MongoDB instance for testing. This means:
- You don't need to have MongoDB running separately for the tests
- Tests run in isolation and don't affect your real database
- The configuration is defined in `server/jest.config.js` and `server/jest-mongodb-config.js`

### Running Client Tests

```powershell
cd client
npm test
```

_Linux/macOS:_
```bash
cd client
npm test
```

The client tests use Jest with React Testing Library to test components and functionality.

### Test Files

- **Server tests**: Located in `server/__tests__/`
- **Client tests**: Located in `client/__tests__/`

### Additional Testing Notes

- The server tests override the JWT secret key with a test-specific value
- Console output is minimized during tests to keep the output clean
- The server doesn't actually listen on a port during tests (it's just used for route testing)
- Test environment loads from `.env.test` instead of `.env` (via config.js)
- The custom logger utility automatically suppresses logs during test runs

## Troubleshooting

### MongoDB Memory Server Installation Issues

If you encounter errors during server installation related to `mongodb-memory-server`, try these solutions:

1. **Recommended Solution: Skip MongoDB Memory Server download during installation**

   MongoDB Memory Server tries to download MongoDB binaries during installation, which can fail due to network, permissions, or file system issues. The most reliable approach is to skip this step during installation:

   ```powershell
   cd server
   $env:MONGOMS_DISABLE_POSTINSTALL=1
   npm install
   ```

   _Linux/macOS:_
   ```bash
   cd server
   MONGOMS_DISABLE_POSTINSTALL=1 npm install
   ```

2. **Running Tests After Installation**

   If you've installed the server dependencies with `MONGOMS_DISABLE_POSTINSTALL=1`, you'll need to make MongoDB available for tests in one of these ways:

   a) **Use your local MongoDB instance instead of the in-memory version:**
      
      Modify the `server/jest.config.js` file to disable the MongoDB memory server:
      
      ```js
      module.exports = {
        testEnvironment: 'node',
        testTimeout: 30000,
        // Comment out or remove this line:
        // preset: '@shelf/jest-mongodb',
      };
      ```
      
      Make sure your local MongoDB is running when you run the tests.

   b) **Or set the environment variable each time you run tests:**
      
      ```powershell
      $env:MONGOMS_SYSTEM_BINARY="C:\path\to\your\mongod.exe"
      npm test
      ```

      _Linux/macOS:_
      ```bash
      MONGOMS_SYSTEM_BINARY=/path/to/your/mongod npm test
      ```

3. **Alternative Approaches**

   - **Skip the tests during development:**
     ```powershell
     npm install --ignore-scripts
     ```

     _Linux/macOS:_
     ```bash
     npm install --ignore-scripts
     ```

   - **For production deployments** where tests don't need to run:
     ```powershell
     npm install --omit=dev
     ```

     _Linux/macOS:_
     ```bash
     npm install --omit=dev
     ```

### React Dependency Conflicts

If you encounter errors during client installation related to React version conflicts, try these solutions:

1. **React 19 and Testing Library compatibility issue**

   If you see an error like this:
   ```
   npm error While resolving: @testing-library/react@14.2.1
   npm error Found: react@19.0.0
   npm error peer react@"^18.0.0" from @testing-library/react@14.2.1
   ```

   **Solution**:
   Install with the `--legacy-peer-deps` flag:
   ```powershell
   cd client
   npm install --legacy-peer-deps
   ```

   _Linux/macOS:_
   ```bash
   cd client
   npm install --legacy-peer-deps
   ```

   This flag allows npm to install packages even if there are peer dependency conflicts.

2. **Alternative Solution: Downgrading React**

   If you prefer to resolve the dependency conflicts properly:
   ```powershell
   cd client
   npm install react@18.3.1 react-dom@18.3.1 --save
   npm install
   ```

   _Linux/macOS:_
   ```bash
   cd client
   npm install react@18.3.1 react-dom@18.3.1 --save
   npm install
   ```

   This will downgrade React to version 18, which is compatible with the testing libraries.

## License

This project is licensed under the MIT License. 
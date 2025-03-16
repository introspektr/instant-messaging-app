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

## Prerequisites

Ensure the following are installed on your machine before proceeding:

- [Node.js](https://nodejs.org/) (v18.19.0 or later required)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas account)

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
│   │   ├── App.jsx       # Main application component
│   │   └── main.jsx      # Entry point
│   ├── __tests__         # Frontend tests
│   ├── .env              # Frontend environment variables
│   └── package.json      # Dependencies and scripts
└── server                # Express backend
    ├── models            # MongoDB schemas
    ├── routes            # API route definitions
    ├── middleware        # Express middleware
    ├── utils             # Utility functions
    ├── __tests__         # Backend tests
    ├── socketHandler.js  # WebSocket implementation
    ├── server.js         # Express server setup
    ├── config.js         # Server configuration
    ├── .env              # Backend environment variables
    └── package.json      # Dependencies and scripts
```

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/instant-messaging-app.git
   cd instant-messaging-app/full-stack
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

   ```bash
   cd server
   npm install
   ```

4. **Install client dependencies**:

   ```bash
   cd ../client
   npm install
   ```

5. **Configure environment variables**:

   **For the server:**
   
   1. Navigate to the server directory:
      ```bash
      cd server
      ```
      
   2. Create a new file named `.env`:
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
   
   **For the client:**
   
   1. Navigate to the client directory:
      ```bash
      cd ../client
      ```
      
   2. Create a new file named `.env`:
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

   ```bash
   cd server
   npm run dev
   ```

   The server will run at http://localhost:8747 by default.

2. **Start the client** (in a new terminal):

   ```bash
   cd client
   npm run dev
   ```

   The client will run at http://localhost:5173 by default.

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

### Client (client/.env)

```
VITE_SERVER_URL=http://localhost:8747               # Server API URL
```

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login and receive JWT token
- **GET /api/auth/me** - Get the authenticated user's profile
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

The application includes unit and integration tests for both frontend and backend.

### Running Server Tests

```bash
cd server
npm test
```

### Running Client Tests

```bash
cd client
npm test
```

---

## License

This project is licensed under the MIT License. 
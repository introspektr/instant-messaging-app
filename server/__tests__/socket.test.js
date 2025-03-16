const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const socketHandler = require('../socketHandler');

// Hard-code test secret for tests
const JWT_SECRET = 'test_jwt_secret_key';

describe('Socket.io Integration', () => {
  let httpServer;
  let io;
  let clientSocket;
  let testUser;
  let authToken;
  let testRoom;
  let originalConsoleLog;
  let originalConsoleError;

  beforeAll(async () => {
    // Silence console during tests
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Create HTTP server
    httpServer = createServer();
    io = new Server(httpServer);
    
    // Set JWT_SECRET environment variable for tests
    process.env.JWT_SECRET = JWT_SECRET;
    
    // Apply socket handler
    socketHandler(io);
    
    // Start server on a random port
    await new Promise((resolve) => {
      httpServer.listen(0, () => {
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Clean up resources
    if (clientSocket && clientSocket.connected) {
      clientSocket.close();
    }
    io.close();
    httpServer.close();
    
    // Restore console
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  beforeEach(async () => {
    // Clean up collections
    await User.deleteMany({});
    await ChatRoom.deleteMany({});
    await Message.deleteMany({});

    // Create a test user
    testUser = await User.create({
      username: 'socketuser',
      email: 'socketuser@example.com',
      password: 'password123'
    });

    // Create a test room
    testRoom = await ChatRoom.create({
      name: 'Socket Test Room',
      createdBy: testUser._id,
      participants: [testUser._id]
    });

    // Generate auth token with hard-coded secret
    authToken = jwt.sign(
      { userId: testUser._id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create a new client socket for each test
    const port = httpServer.address().port;
    try {
      clientSocket = Client(`http://localhost:${port}`, {
        auth: {
          token: authToken
        }
      });

      // Wait for connection
      await new Promise((resolve, reject) => {
        clientSocket.on('connect', resolve);
        clientSocket.on('connect_error', (err) => {
          reject(err);
        });
        
        // Set a timeout for connection
        setTimeout(() => reject(new Error('Connection timeout')), 3000);
      });
    } catch (error) {
      // Don't log the error, just let the test fail
    }
  });

  afterEach(() => {
    // Clean up socket connection
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  test('should connect with valid token', (done) => {
    expect(clientSocket.connected).toBe(true);
    done();
  });

  test('should receive rooms on connection', (done) => {
    clientSocket.on('rooms', (rooms) => {
      expect(Array.isArray(rooms)).toBe(true);
      expect(rooms.length).toBe(1);
      expect(rooms[0]).toHaveProperty('name', 'Socket Test Room');
      done();
    });
  });

  test('should create a new room', (done) => {
    clientSocket.emit('createRoom', { name: 'New Test Room' });
    
    clientSocket.on('rooms', (rooms) => {
      // Skip the initial rooms event
      if (rooms.length === 1) return;
      
      expect(rooms.length).toBe(2);
      const newRoom = rooms.find(room => room.name === 'New Test Room');
      expect(newRoom).toBeTruthy();
      expect(newRoom.createdBy._id).toBe(testUser._id.toString());
      done();
    });
  });

  test('should join a room', (done) => {
    clientSocket.emit('joinRoom', { roomId: testRoom._id.toString() });
    
    clientSocket.on('roomData', (room) => {
      expect(room).toHaveProperty('_id', testRoom._id.toString());
      expect(room).toHaveProperty('name', 'Socket Test Room');
      done();
    });
  });

  test('should send and receive messages', (done) => {
    // Join the room first
    clientSocket.emit('joinRoom', { roomId: testRoom._id.toString() });
    
    clientSocket.on('roomData', () => {
      // Now send a message
      clientSocket.emit('sendMessage', {
        text: 'Hello from test',
        roomId: testRoom._id.toString(),
        sender: testUser._id.toString()
      });
    });
    
    clientSocket.on('message', (message) => {
      expect(message).toHaveProperty('content', 'Hello from test');
      expect(message.sender).toHaveProperty('_id', testUser._id.toString());
      expect(message.sender).toHaveProperty('username', 'socketuser');
      done();
    });
  });
}); 
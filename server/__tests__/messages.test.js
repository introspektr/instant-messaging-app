const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');

// Hard-code test secret for tests
const JWT_SECRET = 'test_jwt_secret_key';

// Use a different approach for requiring the server
let app;
beforeAll(() => {
  // Set JWT_SECRET environment variable for tests
  process.env.JWT_SECRET = JWT_SECRET;
  
  // Temporarily silence console
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  console.log = jest.fn();
  console.error = jest.fn();
  
  app = require('../server');
  
  // Restore console
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('Messages API', () => {
  let authToken;
  let testUser;
  let testRoom;

  beforeEach(async () => {
    // Clean up collections
    await User.deleteMany({});
    await ChatRoom.deleteMany({});
    await Message.deleteMany({});

    // Create a test user
    testUser = await User.create({
      username: 'messageuser',
      email: 'messageuser@example.com',
      password: 'password123'
    });

    // Create a test room
    testRoom = await ChatRoom.create({
      name: 'Message Test Room',
      createdBy: testUser._id,
      participants: [testUser._id]
    });

    // Generate auth token with hard-coded secret
    authToken = jwt.sign(
      { userId: testUser._id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/messages/:roomId', () => {
    it('should return messages for a room', async () => {
      // Create some test messages
      await Message.create([
        {
          content: 'Test message 1',
          sender: testUser._id,
          chatRoom: testRoom._id,
          timestamp: new Date(Date.now() - 2000)
        },
        {
          content: 'Test message 2',
          sender: testUser._id,
          chatRoom: testRoom._id,
          timestamp: new Date(Date.now() - 1000)
        }
      ]);

      const response = await request(app)
        .get(`/api/messages/${testRoom._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('messages');
      expect(Array.isArray(response.body.data.messages)).toBe(true);
      expect(response.body.data.messages.length).toBe(2);
      
      // Messages should be sorted by timestamp (newest first with default -1 sort)
      expect(response.body.data.messages[0]).toHaveProperty('content', 'Test message 2');
      expect(response.body.data.messages[1]).toHaveProperty('content', 'Test message 1');
    });

    it('should return empty array for room with no messages', async () => {
      const response = await request(app)
        .get(`/api/messages/${testRoom._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('messages');
      expect(Array.isArray(response.body.data.messages)).toBe(true);
      expect(response.body.data.messages.length).toBe(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/messages/${testRoom._id}`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/messages/:roomId/page/:page', () => {
    it('should return paginated messages', async () => {
      // Create 25 test messages
      const messages = [];
      for (let i = 1; i <= 25; i++) {
        messages.push({
          content: `Message ${i}`,
          sender: testUser._id,
          chatRoom: testRoom._id,
          timestamp: new Date(Date.now() - (25 - i) * 1000) // Newest messages last
        });
      }
      await Message.create(messages);

      // Get first page (newest messages)
      const response = await request(app)
        .get(`/api/messages/${testRoom._id}/page/1`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      // Check if the response has the messages property
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('messages');
      expect(Array.isArray(response.body.data.messages)).toBe(true);

      // Check pagination response format
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('currentPage', 1);
      expect(response.body.data.pagination).toHaveProperty('totalPages');
      expect(response.body.data.pagination).toHaveProperty('totalMessages');
      
      // First message should be the newest (Message 25)
      const firstMessage = response.body.data.messages ? 
        response.body.data.messages[0] : 
        response.body.data.messages[0];
        
      expect(firstMessage).toHaveProperty('content', 'Message 25');
    });
  });
}); 
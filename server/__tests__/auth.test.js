const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

describe('Authentication API', () => {
  beforeEach(async () => {
    // Clean up users collection before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('username', 'testuser');
      expect(response.body.data.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('token');
      
      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.username).toBe(userData.username);
      
      // Password should be hashed
      expect(user.password).not.toBe(userData.password);
    });

    it('should not register a user with existing email', async () => {
      // Create a user first
      const existingUser = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      await User.create(existingUser);

      // Try to register with the same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User with this email or username already exists');
      expect(response.body).toHaveProperty('success', false);
    });

    it('should not register a user with existing username', async () => {
      // Create a user first
      const existingUser = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      await User.create(existingUser);

      // Try to register with the same username
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'new@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User with this email or username already exists');
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      // Create a user first with a known password
      const password = 'Password123!';
      const user = new User({
        username: 'loginuser',
        email: 'login@example.com',
        password: password  // Will be hashed by the pre-save hook
      });
      await user.save();

      // Attempt to login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should reject login with incorrect password', async () => {
      // Create a user first
      await User.create({
        username: 'wrongpassword',
        email: 'wrong@example.com',
        password: await bcrypt.hash('correctpass', 10)
      });

      // Attempt to login with wrong password
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpass'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject login for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data when authenticated', async () => {
      // Create a user
      const user = await User.create({
        username: 'meuser',
        email: 'me@example.com',
        password: 'password123'
      });

      // Create token directly
      const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Get user data with token
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id', user._id.toString());
      expect(response.body.data.user).toHaveProperty('username', 'meuser');
      expect(response.body.data.user).toHaveProperty('email', 'me@example.com');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app).get('/api/auth/me');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Authentication required');
      expect(response.body).toHaveProperty('success', false);
    });
  });
}); 
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
        firstName: 'Test',
        lastName: 'User',
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
      expect(response.body.data.user).toHaveProperty('firstName', 'Test');
      expect(response.body.data.user).toHaveProperty('lastName', 'User');
      expect(response.body.data.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('token');
      
      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.username).toBe(userData.username);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      
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
        firstName: 'Me',
        lastName: 'User',
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
      expect(response.body.data.user).toHaveProperty('firstName', 'Me');
      expect(response.body.data.user).toHaveProperty('lastName', 'User');
      expect(response.body.data.user).toHaveProperty('email', 'me@example.com');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app).get('/api/auth/me');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Authentication required');
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile when authenticated', async () => {
      // Create a user
      const user = await User.create({
        username: 'profileuser',
        firstName: '',
        lastName: '',
        email: 'profile@example.com',
        password: 'password123'
      });

      // Create token directly
      const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Update profile
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('firstName', 'John');
      expect(response.body.data.user).toHaveProperty('lastName', 'Doe');
      
      // Verify changes were saved to database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.firstName).toBe('John');
      expect(updatedUser.lastName).toBe('Doe');
    });

    it('should update only firstName when only firstName is provided', async () => {
      // Create a user
      const user = await User.create({
        username: 'partialupdate',
        firstName: 'Old',
        lastName: 'Name',
        email: 'partial@example.com',
        password: 'password123'
      });

      // Create token directly
      const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Update only firstName
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'New'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty('firstName', 'New');
      expect(response.body.data.user).toHaveProperty('lastName', 'Name'); // Unchanged
      
      // Verify in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.firstName).toBe('New');
      expect(updatedUser.lastName).toBe('Name'); // Unchanged
    });

    it('should reject unauthenticated profile update request', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({
          firstName: 'John',
          lastName: 'Doe'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
}); 
// auth.js

const express = require('express');
const User = require('../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to validate email format
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Register a new user
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    console.log('Attempting to register user with email:', email); // Debugging log

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists'); // Debugging log
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating new user'); // Debugging log

    // Create and save the new user
    const user = new User({ email, password, firstName, lastName });
    await user.save();

    console.log('User registered successfully:', user); // Debugging log

    // Generate a JWT token for immediate login after registration
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token generated:', token); // Debugging log

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Error during registration:', error); // Debugging log
    res.status(500).json({ message: 'Server error' });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    console.log('Attempting to find user with email:', email); // Debugging log

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found'); // Debugging log
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user); // Debugging log

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match'); // Debugging log
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password matches'); // Debugging log

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token generated:', token); // Debugging log

    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error); // Debugging log
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware

// Protect all routes in this file
router.use(authMiddleware);

// Create a new chat room
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const createdBy = req.userId; // Get the user ID from the request object

    // Create the chat room
    const chatRoom = new ChatRoom({ name, createdBy, participants: [createdBy] });
    await chatRoom.save();

    res.status(201).json(chatRoom);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create chat room', error: err.message });
  }
});

// Get all chat rooms for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.userId; // Get the user ID from the request object

    // Find chat rooms where the user is a participant
    const chatRooms = await ChatRoom.find({ participants: userId }).populate('createdBy', 'firstName lastName');

    res.status(200).json(chatRooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat rooms', error: err.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

// Send a message in a chat room
router.post('/', async (req, res) => {
  try {
    const { chatRoomId, senderId, content } = req.body;

    // Check if the chat room exists
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Create the message
    const message = new Message({ chatRoomId, senderId, content });
    await message.save();

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
});

// Get all messages in a chat room
router.get('/:chatRoomId', async (req, res) => {
  try {
    const { chatRoomId } = req.params;

    // Find all messages in the chat room
    const messages = await Message.find({ chatRoomId }).populate('senderId', 'firstName lastName');

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
});

module.exports = router;
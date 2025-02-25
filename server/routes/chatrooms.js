const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// Create a new chat room
router.post('/', auth, async (req, res) => {
    try {
        const { name } = req.body;

        const chatRoom = new ChatRoom({
            name,
            createdBy: req.user._id,
            participants: [req.user._id] // Creator is automatically a participant
        });

        await chatRoom.save();

        // Populate creator details
        await chatRoom.populate('createdBy', 'username email');

        res.status(201).json({
            message: 'Chat room created successfully',
            chatRoom
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all chat rooms
router.get('/', async (req, res) => {
    try {
        const chatRooms = await ChatRoom.find();
        res.json(chatRooms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat rooms' });
    }
});

// Get a specific chat room
router.get('/:id', auth, async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findById(req.params.id)
            .populate('createdBy', 'username email')
            .populate('participants', 'username email')
            .populate('messages.sender', 'username email');

        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }

        res.json(chatRoom);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a chat room
router.put('/:id', auth, async (req, res) => {
    try {
        const { name } = req.body;
        const chatRoom = await ChatRoom.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            { name },
            { new: true }
        ).populate('createdBy', 'username email');

        if (!chatRoom) {
            return res.status(404).json({ 
                error: 'Chat room not found or you are not authorized to update it' 
            });
        }

        res.json(chatRoom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a chat room (only by creator)
router.delete('/:id', auth, async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!chatRoom) {
            return res.status(404).json({ 
                error: 'Chat room not found or you are not authorized to delete it' 
            });
        }

        res.json({ message: 'Chat room deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add participant to chat room
router.post('/:id/participants', auth, async (req, res) => {
    try {
        const { userId } = req.body;
        const chatRoom = await ChatRoom.findById(req.params.id);

        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }

        if (chatRoom.participants.includes(userId)) {
            return res.status(400).json({ error: 'User is already a participant' });
        }

        chatRoom.participants.push(userId);
        await chatRoom.save();
        await chatRoom.populate('participants', 'username email');

        res.json({
            message: 'Participant added successfully',
            chatRoom
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get messages for a specific chat room
router.get('/:id/messages', auth, async (req, res) => {
    try {
        const messages = await Message.find({ chatRoom: req.params.id })
            .populate('sender', 'username')
            .sort({ timestamp: -1 })
            .limit(50); // Limit to last 50 messages

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 
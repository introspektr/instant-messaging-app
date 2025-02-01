const mongoose = require('mongoose');

// Define the Message schema
const messageSchema = new mongoose.Schema({
  chatRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom', // Reference to the ChatRoom model
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true, // Remove extra spaces
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
});

// Create the Message model
const Message = mongoose.model('Message', messageSchema);

// Export the Message model
module.exports = Message;
const mongoose = require('mongoose');

// Define the ChatRoom schema
const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Remove extra spaces
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  }],
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically set the update date
  },
});

// Update the `updatedAt` field before saving
chatRoomSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the ChatRoom model
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

// Export the ChatRoom model
module.exports = ChatRoom;
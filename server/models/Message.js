/**
 * Message Model
 * 
 * Defines the schema for chat messages sent within chat rooms.
 * Each message belongs to a chat room and is sent by a user.
 */
const mongoose = require('mongoose');

/**
 * Message Schema
 * 
 * @property {String} content - The content of the message
 * @property {ObjectId} sender - Reference to the User who sent the message
 * @property {ObjectId} chatRoom - Reference to the ChatRoom the message belongs to
 * @property {Date} timestamp - When the message was sent
 */
const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    chatRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message; 
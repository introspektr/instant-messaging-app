/**
 * ChatRoom Model
 * 
 * Defines the schema for chat rooms where users can communicate.
 * Each chat room has participants and stores messages.
 */
const mongoose = require('mongoose');
const Message = require('./Message');

/**
 * ChatRoom Schema
 * 
 * @property {String} name - The name of the chat room
 * @property {ObjectId} createdBy - Reference to the User who created the room
 * @property {Array<ObjectId>} participants - Array of Users who are in the room
 * @property {Date} createdAt - When the chat room was created
 */
const chatRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Chat room name is required'],
        trim: true,
        minlength: [3, 'Chat room name must be at least 3 characters long']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Pre-remove middleware to delete associated messages
 * Automatically deletes all messages in a chat room when the room is removed
 */
chatRoomSchema.pre('remove', async function(next) {
    try {
        await Message.deleteMany({ chatRoom: this._id });
        next();
    } catch (err) {
        next(err);
    }
});

/**
 * Static method to delete a chat room and its messages
 * 
 * @param {String} chatRoomId - The ID of the chat room to delete
 * @returns {Boolean} True if deletion was successful
 * @throws {Error} If deletion fails
 */
chatRoomSchema.statics.deleteWithMessages = async function(chatRoomId) {
    try {
        // Delete all messages in the chatroom
        await Message.deleteMany({ chatRoom: chatRoomId });
        // Delete the chatroom
        await this.findByIdAndDelete(chatRoomId);
        return true;
    } catch (err) {
        throw err;
    }
};

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
module.exports = ChatRoom; 
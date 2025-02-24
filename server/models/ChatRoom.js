const mongoose = require('mongoose');
const Message = require('./Message');

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

// Add pre-remove middleware to delete associated messages
chatRoomSchema.pre('remove', async function(next) {
    try {
        await Message.deleteMany({ chatRoom: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

// Add static method to handle cascade deletion (alternative approach)
chatRoomSchema.statics.deleteWithMessages = async function(chatRoomId) {
    try {
        // Delete all messages in the chatroom
        await Message.deleteMany({ chatRoom: chatRoomId });
        // Delete the chatroom
        await this.findByIdAndDelete(chatRoomId);
        return true;
    } catch (error) {
        throw error;
    }
};

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
module.exports = ChatRoom; 
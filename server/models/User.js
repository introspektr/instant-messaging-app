/**
 * User Model
 * 
 * Defines the schema for user data including authentication details
 * and provides methods for password hashing and verification.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * 
 * @property {String} username - Unique username for the user
 * @property {String} firstName - First name of the user
 * @property {String} lastName - Last name of the user
 * @property {String} email - Unique email address for the user
 * @property {String} password - Hashed password for authentication
 * @property {Date} createdAt - Timestamp when the user was created
 */
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    firstName: {
        type: String,
        trim: true,
        default: ''
    },
    lastName: {
        type: String,
        trim: true,
        default: ''
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Pre-save middleware to hash the user's password
 * Runs before each save() operation on a User document
 */
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Compare a candidate password with the user's hashed password
 * 
 * @param {String} candidatePassword - Plain text password to verify
 * @returns {Boolean} True if password matches, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User; 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, // Ensure email is unique
    trim: true,   // Remove extra spaces
    lowercase: true, // Convert email to lowercase
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6, // Enforce minimum password length
  },
  firstName: { 
    type: String, 
    default: '',  // Optional field
  },
  lastName: { 
    type: String, 
    default: '',  // Optional field
  },
});

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10); // Hash with bcrypt
  }
  next();
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
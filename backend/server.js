// server.js 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth'); // Import authentication routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Basic Route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Use Authentication Routes
app.use('/api', authRoutes); // Mount authentication routes under /api

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
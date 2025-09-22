const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const storageRoutes = require('./routes/storage.routes');
const parkingRoutes = require('./routes/parking.routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../../frontend')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/parking', parkingRoutes);

// Serve frontend for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    console.log('Running in fallback mode without database connection');
    return false;
  }
};

// Start the server with or without database
const startServer = async () => {
  let dbConnected = false;
  
  try {
    dbConnected = await connectDB();
  } catch (err) {
    console.error('Error in database connection:', err);
  }
  
  // Start server even if DB connection fails
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!dbConnected) {
      console.log('WARNING: Running without database connection. Some features may not work.');
    }
  });
};

startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit the process in development mode
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Don't exit the process in development mode
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}); 
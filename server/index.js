require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Route imports
const AuthRouter = require('./routes/AuthRouter');
const EventRouter = require('./routes/EventRouter');
const PredictionRouter = require('./routes/PredictionRouter'); // prediction routes
const FavoriteRouter = require('./routes/FavoriteRouter'); // favorites routes
const UserRouter = require('./routes/UserRouter'); // user routes

// Database connection
require('./models/db');

const PORT = process.env.PORT || 8080;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir);
}

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173', // react  app's URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/ping', (req, res) => {
    res.send('Pong');
});

// Route mounting
app.use('/auth', AuthRouter);
app.use('/api/events', EventRouter);
app.use('/api/predictions', PredictionRouter); // New prediction routes
app.use('/api/favorites', FavoriteRouter); // New favorites routes
app.use('/api/users', UserRouter); // New user routes

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server with error handling
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
    } else {
        console.error('Error starting server:', err);
    }
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // don't exit the process, just log the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // don't exit the process, just log the error
});
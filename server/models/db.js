const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_CONN;

if (!mongo_url) {
    console.error('MongoDB connection string is missing. Please check your .env file.');
    process.exit(1);
}

mongoose.connect(mongo_url)
    .then(() => {
        console.log('MongoDB Connected...');    
    })
    .catch((err) => {
        console.error('MongoDB Connection Error:', err.message);
        console.error('Full error:', err);
        // Don't exit the process, just log the error
        // This allows the server to start even if MongoDB connection fails
    });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});
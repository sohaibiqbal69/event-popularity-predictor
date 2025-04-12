// server/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: String,
    description: String,
    date: Date,
    location: String,
    platform: String, // E.g., "Ticketmaster", "Eventbrite"
    platformId: String, // Unique ID from the platform
    imageUrl: String,
    // ... other relevant fields
});

module.exports = mongoose.model('Event', eventSchema);
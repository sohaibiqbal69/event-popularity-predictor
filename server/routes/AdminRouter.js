const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/AdminAuth');
const AdminEvent = require('../models/AdminEvent');
const User = require('../models/User');

// Get admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const totalEvents = await AdminEvent.countDocuments();
        const totalUsers = await User.countDocuments();
        const recentEvents = await AdminEvent.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalEvents,
            totalUsers,
            recentEvents
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new event
router.post('/events', adminAuth, async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            createdBy: req.user._id
        };

        const event = new AdminEvent(eventData);
        await event.save();

        res.status(201).json(event);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all events
router.get('/events', adminAuth, async (req, res) => {
    try {
        const events = await AdminEvent.find()
            .sort({ createdAt: -1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update an event
router.put('/events/:id', adminAuth, async (req, res) => {
    try {
        const event = await AdminEvent.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an event
router.delete('/events/:id', adminAuth, async (req, res) => {
    try {
        const event = await AdminEvent.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users (for admin management)
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 
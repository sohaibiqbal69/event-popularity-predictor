const express = require('express');
const router = express.Router();
const { 
  getAllEvents,
  getEventDetails  // Add new controller method
} = require('../controllers/EventController');

// Existing route
router.get('/', getAllEvents);

// New event details route
router.get('/:eventId', getEventDetails);

module.exports = router;
const express = require('express');
const router = express.Router();
const { 
  addToFavorites, 
  removeFromFavorites, 
  getFavorites, 
  checkFavorite 
} = require('../controllers/FavoriteController');
const auth = require('../middleware/Auth');

// All routes require authentication
router.use(auth);

// Get user's favorites
router.get('/', getFavorites);

// Check if an event is favorited
router.get('/:eventId/check', checkFavorite);

// Add event to favorites
router.post('/:eventId', addToFavorites);

// Remove event from favorites
router.delete('/:eventId', removeFromFavorites);

module.exports = router; 
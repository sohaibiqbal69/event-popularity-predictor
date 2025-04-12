const Favorite = require('../models/Favorite');
const mongoose = require('mongoose');
const axios = require('axios');

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch event details with retry logic
const fetchEventDetailsWithRetry = async (eventId, retries = 0) => {
  try {
    const response = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events/${eventId}`,
      {
        params: { apikey: TICKETMASTER_API_KEY }
      }
    );
    return response.data;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await delay(RETRY_DELAY);
      return fetchEventDetailsWithRetry(eventId, retries + 1);
    }
    throw error;
  }
};

// Add an event to favorites
const addToFavorites = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user_id: userId,
      ticketmaster_id: eventId
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Event already in favorites' });
    }

    // Fetch initial event details
    try {
      const eventDetails = await fetchEventDetailsWithRetry(eventId);
      
      // Create new favorite with event details
      await Favorite.create({
        user_id: userId,
        ticketmaster_id: eventId,
        lastKnownDetails: {
          name: eventDetails.name,
          date: eventDetails.dates?.start?.localDate,
          venue: eventDetails._embedded?.venues?.[0]?.name,
          image: eventDetails.images?.[0]?.url,
          location: eventDetails._embedded?.venues?.[0]?.city?.name
        }
      });
    } catch (error) {
      // If we can't fetch details, still add to favorites but without details
      await Favorite.create({
        user_id: userId,
        ticketmaster_id: eventId
      });
    }

    res.status(201).json({ isFavorited: true });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Error adding to favorites' });
  }
};

// Get user's favorite events
const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await Favorite.find({
      user_id: userId
    }).sort({ created_at: -1 });

    // Fetch event details for each favorite
    const favoriteEvents = await Promise.all(
      favorites.map(async (favorite) => {
        try {
          const event = await fetchEventDetailsWithRetry(favorite.ticketmaster_id);
          
          // Update lastKnownDetails in database
          await Favorite.findByIdAndUpdate(favorite._id, {
            lastKnownDetails: {
              name: event.name,
              date: event.dates?.start?.localDate,
              venue: event._embedded?.venues?.[0]?.name,
              image: event.images?.[0]?.url,
              location: event._embedded?.venues?.[0]?.city?.name
            }
          });

          return {
            id: favorite._id,
            ticketmaster_id: favorite.ticketmaster_id,
            created_at: favorite.created_at,
            name: event.name,
            date: event.dates?.start?.localDate,
            venue: event._embedded?.venues?.[0]?.name,
            image: event.images?.[0]?.url,
            location: event._embedded?.venues?.[0]?.city?.name
          };
        } catch (error) {
          console.error(`Error fetching event details for ${favorite.ticketmaster_id}:`, error);
          // Return last known details if available, otherwise return basic info
          return {
            id: favorite._id,
            ticketmaster_id: favorite.ticketmaster_id,
            created_at: favorite.created_at,
            ...favorite.lastKnownDetails || {
              name: 'Event (Details Temporarily Unavailable)',
              date: null,
              venue: null,
              image: null,
              location: null
            }
          };
        }
      })
    );

    res.json(favoriteEvents);
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Error getting favorites' });
  }
};

// Remove an event from favorites
const removeFromFavorites = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const result = await Favorite.deleteOne({
      user_id: userId,
      ticketmaster_id: eventId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.status(200).json({ isFavorited: false });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Error removing from favorites' });
  }
};

// Check if an event is favorited
const checkFavorite = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const favorite = await Favorite.findOne({
      user_id: userId,
      ticketmaster_id: eventId
    });

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ message: 'Error checking favorite status' });
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite
}; 
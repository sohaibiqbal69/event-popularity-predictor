const axios = require('axios');
const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000';

// Get predictions for all events
const getPredictions = async (req, res) => {
    try {
        const { category, page, size } = req.query;
        const params = {
            apikey: TICKETMASTER_API_KEY,
            locale: '*',
            page: page || 0,
            size: size || 20,
            segmentName: category !== 'all' ? category : undefined
        };

        const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events', { params });
        const events = response.data._embedded?.events || [];

        // Process events with sentiment analysis from Flask app
        const processedEvents = await Promise.all(events.map(async event => {
            const eventName = event.name;
            
            try {
                // Get sentiment data from Flask app
                const sentimentResponse = await axios.get(`${FLASK_API_URL}/api/event-sentiment/${encodeURIComponent(eventName)}`);
                const sentimentData = sentimentResponse.data;
                
                return {
                    id: event.id,
                    name: event.name,
                    date: event.dates.start.localDate,
                    image: event.images?.[0]?.url,
                    location: event._embedded?.venues?.[0]?.name,
                    sentiment_score: sentimentData.sentiment_score,
                    social_volume: sentimentData.social_volume,
                    trend_score: sentimentData.trend_score,
                    using_mock_data: false
                };
            } catch (error) {
                console.error(`Error fetching sentiment for ${eventName}:`, error);
                // If sentiment analysis fails, return event without sentiment data
                return {
                    id: event.id,
                    name: event.name,
                    date: event.dates.start.localDate,
                    image: event.images?.[0]?.url,
                    location: event._embedded?.venues?.[0]?.name
                };
            }
        }));

        // Filter out events with no prediction data
        const validEvents = processedEvents.filter(event => event.sentiment_score !== undefined);

        res.json({
            events: validEvents,
            page: response.data.page || { number: 0, totalPages: 1 }
        });

    } catch (error) {
        console.error('Prediction error:', error);
        res.status(error.response?.status || 500).json({
            message: error.response?.data?.message || 'Error fetching predictions'
        });
    }
};

// Get prediction for a specific event
const getEventPrediction = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Get event details from Ticketmaster
        const eventResponse = await axios.get(`https://app.ticketmaster.com/discovery/v2/events/${eventId}`, {
            params: { apikey: TICKETMASTER_API_KEY }
        });
        
        const event = eventResponse.data;
        const eventName = event.name;
        
        try {
            // Get sentiment data from Flask app
            const sentimentResponse = await axios.get(`${FLASK_API_URL}/api/event-sentiment/${encodeURIComponent(eventName)}`);
            const sentimentData = sentimentResponse.data;
            
            // Return event with sentiment data
            res.json({
                id: event.id,
                name: event.name,
                date: event.dates.start.localDate,
                image: event.images?.[0]?.url,
                location: event._embedded?.venues?.[0]?.name,
                sentiment_score: sentimentData.sentiment_score,
                social_volume: sentimentData.social_volume,
                trend_score: sentimentData.trend_score,
                using_mock_data: false
            });
        } catch (error) {
            console.error(`Error fetching sentiment for ${eventName}:`, error);
            // If sentiment analysis fails, return a 404
            res.status(404).json({
                message: 'No sentiment data available for this event'
            });
        }
    } catch (error) {
        console.error('Event prediction error:', error);
        res.status(error.response?.status || 500).json({
            message: error.response?.data?.message || 'Error fetching event prediction'
        });
    }
};

const calculateMetrics = (redditData) => {
  // Calculate sentiment score using VADER
  const sentimentScore = redditData.sentiment_score;
  const weightedSentimentScore = redditData.weighted_sentiment_score;
  
  // Calculate social volume
  const totalEngagement = redditData.total_engagement;
  const normalizedEngagement = redditData.normalized_engagement || totalEngagement;
  
  // Calculate trend score based on recent engagement
  const recentEngagement = redditData.recent_engagement || totalEngagement;
  const trendScore = recentEngagement / totalEngagement;
  
  // Calculate popularity metrics
  const pastPopularity = weightedSentimentScore * 100;
  const currentPopularity = (weightedSentimentScore * 0.85 + (normalizedEngagement / 100) * 0.15) * 100;
  const predictedPopularity = (weightedSentimentScore * 0.8 + (normalizedEngagement / 100) * 0.2) * 100;
  
  return {
    sentimentScore,
    weightedSentimentScore,
    socialVolume: normalizedEngagement,
    trendScore,
    pastPopularity,
    currentPopularity,
    predictedPopularity
  };
};

module.exports = { getPredictions, getEventPrediction };
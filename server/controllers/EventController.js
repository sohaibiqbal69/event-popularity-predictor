const axios = require('axios');

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const TICKETMASTER_API_ENDPOINT = 'https://app.ticketmaster.com/discovery/v2/events';
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000';

// Simple in-memory rate limiter
const rateLimiter = {
    lastRequestTime: 0,
    minInterval: 1000, // Minimum 1 second between requests
    async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.minInterval) {
            const waitTime = this.minInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTime = Date.now();
    }
};

const getAllEvents = async (req, res) => {
    try {
        const { category, page, size } = req.query;
        
        await rateLimiter.waitForRateLimit();
        
        const params = {
            apikey: TICKETMASTER_API_KEY,
            locale: '*',
            page: page || 0,
            size: size || 20,
            segmentName: category !== 'all' ? category : undefined
        };

        const response = await axios.get(TICKETMASTER_API_ENDPOINT, { params });
        const events = response.data._embedded?.events || [];

        // Process events with sentiment analysis from Flask API
        const processedEvents = await Promise.all(events.map(async event => {
            try {
                const sentimentResponse = await axios.get(
                    `${FLASK_API_URL}/api/event-sentiment/${encodeURIComponent(event.name)}`
                );
                const sentimentData = sentimentResponse.data;

                return {
                    id: event.id,
                    name: event.name,
                    date: event.dates.start.localDate,
                    image: event.images?.[0]?.url,
                    sentiment_score: sentimentData.sentiment_score,
                    social_volume: sentimentData.social_volume,
                    location: event._embedded?.venues?.[0]?.name
                };
            } catch (error) {
                console.error(`Error fetching sentiment for ${event.name}:`, error);
                // Return event without sentiment data if the Flask API call fails
                return {
                    id: event.id,
                    name: event.name,
                    date: event.dates.start.localDate,
                    image: event.images?.[0]?.url,
                    location: event._embedded?.venues?.[0]?.name
                };
            }
        }));

        res.json({
            events: processedEvents,
            page: response.data.page || { number: 0, totalPages: 1 }
        });

    } catch (error) {
        console.error('Ticketmaster API error:', error);
        if (error.response?.status === 429) {
            res.status(429).json({ message: 'Rate limit exceeded. Please try again in a few moments.' });
        } else {
            res.status(error.response?.status || 500).json({
                message: error.response?.data?.message || 'Error fetching events'
            });
        }
    }
};

const getEventDetails = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Wait for rate limit before making request
        await rateLimiter.waitForRateLimit();
        
        const response = await axios.get(`${TICKETMASTER_API_ENDPOINT}/${eventId}`, {
            params: { apikey: TICKETMASTER_API_KEY }
        });

        const event = response.data;
        const venue = event._embedded?.venues?.[0];
        
        res.json({
            id: event.id,
            name: event.name,
            date: event.dates.start.localDate,
            time: event.dates.start.localTime,
            description: event.description || event.info || event.additionalInfo,
            venue: venue?.name,
            location: {
                address: venue?.address?.line1,
                city: venue?.city?.name,
                state: venue?.state?.stateCode,
                postalCode: venue?.postalCode,
                country: venue?.country?.countryCode
            },
            images: event.images,
            url: event.url,
            priceRanges: event.priceRanges,
            pleaseNote: event.pleaseNote,
            additionalInfo: event.additionalInfo,
            accessibility: event.accessibility,
            ageRestrictions: event.ageRestrictions,
            ticketing: event.ticketing
        });

    } catch (error) {
        console.error('Event details error:', error);
        if (error.response?.status === 429) {
            res.status(429).json({ message: 'Rate limit exceeded. Please try again in a few moments.' });
        } else {
            res.status(error.response?.status || 500).json({
                message: error.response?.data?.message || 'Error fetching event details'
            });
        }
    }
};

module.exports = { getAllEvents, getEventDetails };
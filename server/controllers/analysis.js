const vader = require('vader-sentiment');

const analyzeSentiment = async (text) => {
    try {
        // Combine all text for analysis
        const combinedText = Array.isArray(text) ? text.join(' ') : text;
        
        // Get the intensity scores using VADER
        const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(combinedText);
        
        // VADER compound score is between -1 and 1
        const score = intensity.compound;
        
        // Calculate social volume (if text is an array, use its length)
        const volume = Array.isArray(text) ? text.length : 1;
        
        return {
            score: score,
            volume: volume,
            detail: {
                positive: intensity.pos,
                negative: intensity.neg,
                neutral: intensity.neu
            }
        };
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        return {
            score: 0,
            volume: 0,
            detail: {
                positive: 0,
                negative: 0,
                neutral: 1
            }
        };
    }
};

const predictTrend = (eventName) => {
    // This is a mock implementation
    // In a real application, you would use machine learning or statistical analysis
    const mockTrend = {
        direction: Math.random() > 0.5 ? 'up' : 'down',
        factors: ['social media buzz', 'ticket sales velocity', 'similar events performance']
    };

    return mockTrend;
};

module.exports = { analyzeSentiment, predictTrend }; 
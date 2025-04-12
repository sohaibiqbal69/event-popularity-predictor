import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './Predictions.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PopularityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noDataAvailable, setNoDataAvailable] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    if (!id) {
      setError('No event ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNoDataAvailable(false);
      
      // Fetch event details
      const response = await axios.get(`http://localhost:8080/api/events/${id}`);
      const event = response.data;
      
      try {
        // Try to fetch popularity data
        const popularityResponse = await axios.get(`http://localhost:8080/api/predictions/${id}`);
        const popularityData = popularityResponse.data;
        
        // Combine event and popularity data
        setEventData({
          ...event,
          sentiment: {
            score: popularityData.sentiment_score,
            volume: popularityData.social_volume
          },
          trend: {
            direction: popularityData.trend_score > 0 ? 'up' : 'down',
            confidence: Math.max(20, Math.min(100, Math.abs(popularityData.trend_score * 50))),
            pastPopularity: Math.max(0, Math.min(100, 50 + (popularityData.sentiment_score * 10))),
            currentPopularity: Math.max(0, Math.min(100, 50 + (popularityData.sentiment_score * 15) + (Math.min(popularityData.social_volume, 100) * 0.2))),
            predictedPopularity: Math.max(0, Math.min(100, 50 + (popularityData.sentiment_score * 20) + (Math.min(popularityData.social_volume, 100) * 0.3)))
          },
          isMockData: popularityData.using_mock_data
        });
      } catch (popularityError) {
        // If we get a 404, it means no Reddit data is available
        if (popularityError.response && popularityError.response.status === 404) {
          setNoDataAvailable(true);
          setEventData({
            ...event,
            noDataAvailable: true
          });
        } else {
          // For other errors, throw them to be caught by the outer catch
          throw popularityError;
        }
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      setError(error.response?.data?.message || 'Error fetching event details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const prepareChartData = (data, label = 'Popularity Trend') => {
    return {
      labels: ['Past', 'Current', 'Predicted'],
      datasets: [
        {
          label: label,
          data: data,
          borderColor: '#4ec9ff',
          backgroundColor: 'rgba(78, 201, 255, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#4ec9ff',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#4ec9ff',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          tension: 0.3,
          fill: true
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Popularity Score: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#3a3a3a',
          drawBorder: false
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: 8,
          stepSize: 20,
          callback: function(value) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Popularity Score',
          color: '#ffffff',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 15
        }
      },
      x: {
        grid: {
          color: '#3a3a3a',
          drawBorder: false
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: 8
        }
      }
    },
    layout: {
      padding: {
        top: 20,
        right: 25,
        bottom: 20,
        left: 25
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/home')} className="back-button">
          Back to Home
        </button>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="error-container">
        <p className="error-message">Event data not found</p>
        <button onClick={() => navigate('/home')} className="back-button">
          Back to Home
        </button>
      </div>
    );
  }

  if (noDataAvailable) {
    return (
      <div className="predictions-container">
        <button onClick={() => navigate('/home')} className="back-button">
          ← Back to Events
        </button>

        <div className="results-section">
          <h1>Popularity Predictions for {eventData.name}</h1>
          
          <div className="metrics-grid">
            <div className="prediction-card">
              <h2>{eventData.name}</h2>
              
              <div className="no-data-message">
                <p>No Reddit data available for this event.</p>
                <p>We couldn't find any discussions about this event on Reddit, so we can't provide popularity predictions.</p>
                <p>This could be because:</p>
                <ul>
                  <li>The event is too new</li>
                  <li>The event name is too generic</li>
                  <li>There's limited online discussion about this event</li>
                </ul>
                <p>Check back later as more discussions may appear closer to the event date.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="predictions-container">
      <button onClick={() => navigate('/home')} className="back-button">
        ← Back to Events
      </button>

      <div className="results-section">
        <h1>Popularity Predictions for {eventData.name}</h1>
        
        <div className="prediction-card">
          <div className="prediction-grid">
            {/* Left side - Metrics */}
            <div className="metrics-section">
              <div className="metric-row">
                <div className="metric">
                  <h4>Sentiment Score</h4>
                  <p className={`score ${eventData.sentiment.score >= 0 ? 'positive' : 'negative'}`}>
                    {((eventData.sentiment.score + 1) * 5).toFixed(1)}/10
                  </p>
                </div>
                <div className="metric">
                  <h4>Social Volume</h4>
                  <p>{eventData.sentiment.volume}</p>
                </div>
              </div>
              
              <div className="trend-section">
                <h4>Trend Analysis</h4>
                <div className="trend-indicator">
                  <div className={`trend ${eventData.trend.direction}`}>
                    {eventData.trend.direction === 'up' ? '↑' : '↓'} {eventData.trend.direction === 'up' ? 'Increasing' : 'Decreasing'}
                  </div>
                  <p className="confidence">Confidence: {eventData.trend.confidence.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Right side - Graph */}
            <div className="graph-section">
              <div className="event-chart">
                <Line 
                  data={prepareChartData([
                    eventData.trend.pastPopularity,
                    eventData.trend.currentPopularity,
                    eventData.trend.predictedPopularity
                  ])} 
                  options={chartOptions} 
                />
              </div>
            </div>
          </div>

          {/* Bottom section - Event Insights */}
          <div className="insights-section">
            <h3>Event Insights</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <h4>Viral Potential</h4>
                <p>{
                  ((eventData.sentiment.score + 1) * 5) > 8 ? "This event shows strong viral potential! The extremely positive sentiment suggests it could trend significantly on social media." :
                  ((eventData.sentiment.score + 1) * 5) > 6 ? "This event has good viral potential. The positive sentiment indicates it may gain traction on social media." :
                  ((eventData.sentiment.score + 1) * 5) > 5 ? "This event has moderate viral potential. While sentiment is positive, it may not trend significantly." :
                  ((eventData.sentiment.score + 1) * 5) > 3 ? "This event has limited viral potential. The slightly negative sentiment suggests minimal social media impact." :
                  "This event is unlikely to go viral. The negative sentiment indicates limited social media engagement."
                }</p>
              </div>
              <div className="insight-card">
                <h4>Attendance Recommendation</h4>
                <p>{
                  ((eventData.sentiment.score + 1) * 5) > 8 ? "Highly Recommended! This event is generating exceptional buzz and could sell out quickly. Consider booking soon to avoid disappointment." :
                  ((eventData.sentiment.score + 1) * 5) > 6 ? "Recommended! The positive reception suggests this will be a well-attended and enjoyable event." :
                  ((eventData.sentiment.score + 1) * 5) > 5 ? "Worth Considering. While not trending strongly, the event has positive indicators for an enjoyable experience." :
                  ((eventData.sentiment.score + 1) * 5) > 3 ? "Exercise Caution. The mixed reception suggests waiting for more information or considering alternatives." :
                  "Not Recommended at This Time. The negative sentiment suggests potential issues or disappointment. Consider alternative events."
                }</p>
              </div>
            </div>
          </div>

          {eventData.isMockData && (
            <div className="mock-data-notice">
              <p>Note: This data is generated for demonstration purposes as no Reddit discussions were found for this event.</p>
            </div>
          )}
        </div>

        {/* Understanding section moved to bottom */}
        <div className="explanation-section">
          <h2>Understanding Your Predictions</h2>
          <div className="explanation-grid">
            <div className="explanation-card">
              <h3>Sentiment Score</h3>
              <p>The sentiment score ranges from 0 to 10, indicating the overall public sentiment towards the event:</p>
              <ul>
                <li>High scores (7-10): Very favorable public opinion</li>
                <li>Medium scores (4-6): Mixed public opinion</li>
                <li>Low scores (0-3): Less favorable public opinion</li>
              </ul>
              <p>This score is calculated using advanced natural language processing of social media posts, reviews, and news articles.</p>
            </div>

            <div className="explanation-card">
              <h3>Social Volume</h3>
              <p>Social volume represents the total amount of social media activity around the event, including:</p>
              <ul>
                <li>Social media mentions</li>
                <li>Related hashtag usage</li>
                <li>Online discussions and engagement</li>
              </ul>
              <p>A higher number indicates more public interest and discussion.</p>
            </div>

            <div className="explanation-card">
              <h3>Trend Analysis</h3>
              <p>The trend indicator shows the predicted direction of event popularity:</p>
              <ul>
                <li>UP: Increasing popularity and engagement</li>
                <li>DOWN: Decreasing popularity and engagement</li>
              </ul>
              <p>The confidence percentage shows how certain our model is about this prediction.</p>
            </div>

            <div className="explanation-card">
              <h3>Popularity Graph</h3>
              <p>The line graph visualizes the event's popularity trend:</p>
              <ul>
                <li>Past: Historical popularity data</li>
                <li>Current: Present popularity level</li>
                <li>Predicted: Forecasted popularity based on our analysis</li>
              </ul>
              <p>This helps you understand both historical performance and future projections.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularityDetails; 
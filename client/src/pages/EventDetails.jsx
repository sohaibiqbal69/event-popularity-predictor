import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEventDetails = useCallback(async () => {
    if (!id) {
      setError('No event ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:8080/api/events/${id}`);
      setEventData(response.data);
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency || 'USD'
    }).format(price.min);
  };

  const formatDateTime = (date, time) => {
    const eventDate = new Date(date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = dayNames[eventDate.getDay()];
    const monthName = monthNames[eventDate.getMonth()];
    const day = eventDate.getDate();
    const year = eventDate.getFullYear();
    
    return `${dayName} • ${monthName} ${day}, ${year}`;
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatLocation = (venue, location) => {
    if (!venue) return '';
    const parts = [venue];
    if (location?.city && location?.state) {
      parts.push(`${location.city}, ${location.state}`);
    }
    return parts.join(', ');
  };

  const handleBuyTickets = () => {
    if (eventData?.url) {
      window.open(eventData.url, '_blank');
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
        <p className="error-message">Event not found</p>
        <button onClick={() => navigate('/home')} className="back-button">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <button onClick={() => navigate('/home')} className="back-button">
        ← Back to Events
      </button>

      <div className="event-header">
        {eventData.images?.[0]?.url && (
          <div className="event-image">
            <img src={eventData.images[0].url} alt={eventData.name} />
          </div>
        )}
        <div className="event-title">
          <h1>{eventData.name}</h1>
          <div className="event-meta">
            <p className="event-datetime">
              {formatDateTime(eventData.date)}
            </p>
            {eventData.time && (
              <p className="event-time">
                {formatTime(eventData.time)}
              </p>
            )}
            <p className="event-location">
              {formatLocation(eventData.venue, eventData.location)}
            </p>
          </div>
          <div className="event-actions">
            {eventData.url && (
              <button onClick={handleBuyTickets} className="buy-tickets-button">
                <i className="fas fa-ticket-alt"></i>
                Buy Tickets
              </button>
            )}
            <button onClick={() => navigate(`/predictions/${eventData.id}`)} className="popularity-button">
              <i className="fas fa-chart-line"></i>
              View Popularity Trends
            </button>
          </div>
        </div>
      </div>

      <div className="event-content">
        {eventData.description && (
          <div className="event-description">
            <h2>About This Event</h2>
            <p>{eventData.description}</p>
          </div>
        )}

        {eventData.priceRanges && eventData.priceRanges.length > 0 && (
          <div className="price-info">
            <h2>Ticket Information</h2>
            <div className="price-ranges">
              {eventData.priceRanges.map((range, index) => (
                <div key={index} className="price-range">
                  <span className="price-type">{range.type}</span>
                  <span className="price-value">
                    {range.min === range.max 
                      ? formatPrice(range)
                      : `${formatPrice(range)} - ${new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: range.currency || 'USD'
                        }).format(range.max)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {eventData.pleaseNote && (
          <div className="additional-info">
            <h2>Important Information</h2>
            <p>{eventData.pleaseNote}</p>
          </div>
        )}

        {eventData.accessibility && eventData.accessibility.info && (
          <div className="additional-info">
            <h2>Accessibility Information</h2>
            <p>{eventData.accessibility.info}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
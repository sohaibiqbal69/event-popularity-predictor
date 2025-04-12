import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './EventCard.css';

const API_URL = 'http://localhost:8080';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteCheckAttempted, setFavoriteCheckAttempted] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = dayNames[date.getDay()];
    const monthName = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${dayName} • ${monthName} ${day}, ${year}`;
  };

  useEffect(() => {
    // Only check favorite status once per component mount
    if (event.id && !favoriteCheckAttempted) {
      checkFavoriteStatus();
    }
  }, [event.id, favoriteCheckAttempted]);

  const handleAuthError = (error) => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log('Auth error in EventCard component, clearing token...');
      localStorage.removeItem('token');
      localStorage.removeItem('loggedInUser');
      window.dispatchEvent(new Event('tokenChanged'));
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        console.log('No token found, skipping favorite check');
        setFavoriteCheckAttempted(true);
        return;
      }

      console.log('Making API call to check favorite status with token:', token.substring(0, 10) + '...');
      
      const response = await axios.get(`${API_URL}/api/favorites/${event.id}/check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('Favorite check response:', response.data);
      setIsFavorited(response.data.isFavorited);
    } catch (error) {
      // For favorite checks, we don't want to trigger a logout on 403
      // Just log the error and continue
      console.error('Error checking favorite status:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      // Don't call handleAuthError here
    } finally {
      // Mark that we've attempted to check favorite status
      setFavoriteCheckAttempted(true);
    }
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (isLoading) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }

      console.log('Making API call to update favorite status with token:', token.substring(0, 10) + '...');
      
      setIsLoading(true);
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (isFavorited) {
        await axios.delete(`${API_URL}/api/favorites/${event.id}`, config);
      } else {
        await axios.post(`${API_URL}/api/favorites/${event.id}`, {}, config);
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      // For favorite operations, we don't want to trigger a logout on 403
      // Just log the error and continue
      console.error('Error updating favorite status:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      // Don't call handleAuthError here
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventDetails = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="event-card" onClick={handleEventDetails}>
      {event.image && (
        <div className="event-image">
          <img src={event.image} alt={event.name} />
        </div>
      )}
      <div className="event-content">
        <h3>{event.name}</h3>
        <div className="event-details">
          <p className="event-date">
            {event.date && formatDate(event.date)}
          </p>
          <p className="event-location">
            {event.location}
          </p>
        </div>
      </div>
      <button
        className={`favorite-button ${isFavorited ? 'favorited' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={handleFavoriteClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading-spinner"></span>
        ) : (
          <span className="heart-icon">{isFavorited ? '❤️' : '🤍'}</span>
        )}
      </button>
    </div>
  );
};

export default EventCard; 
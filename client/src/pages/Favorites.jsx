import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Favorites.css';

const API_URL = 'http://localhost:8080';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      if (error.response && error.response.status === 403) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        navigate('/login');
        return;
      }
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      await axios.delete(`${API_URL}/api/favorites/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setFavorites(favorites.filter(fav => fav.ticketmaster_id !== eventId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      if (error.response && error.response.status === 403) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        navigate('/login');
        return;
      }
      setError('Failed to remove favorite. Please try again.');
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading">Loading favorites...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchFavorites} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <h1>My Favorite Events</h1>
      {favorites.length === 0 ? (
        <div className="no-favorites">
          <p>You haven't favorited any events yet.</p>
          <button onClick={() => navigate('/')} className="browse-events-button">
            Browse Events
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="favorite-card">
              {favorite.image && (
                <div className="favorite-image">
                  <img src={favorite.image} alt={favorite.name} />
                </div>
              )}
              <div 
                className="favorite-content"
                onClick={() => handleEventClick(favorite.ticketmaster_id)}
              >
                <h3>{favorite.name}</h3>
                {favorite.date && (
                  <p className="event-date">
                    <i className="far fa-calendar"></i>
                    {new Date(favorite.date).toLocaleDateString()}
                  </p>
                )}
                {favorite.venue && (
                  <p className="event-venue">
                    <i className="fas fa-map-marker-alt"></i>
                    {favorite.venue}
                  </p>
                )}
              </div>
              <button
                className="remove-favorite-button"
                onClick={() => handleRemoveFavorite(favorite.ticketmaster_id)}
              >
                Remove from Favorites
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites; 
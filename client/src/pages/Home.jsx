import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EventCard from '../components/EventCard';
import PaginationControls from '../components/PaginationControls';
import './Home.css';

const API_URL = 'http://localhost:8080';
const EVENTS_API_URL = 'http://localhost:5000';

// Define eventsPerPage as a constant outside the component
const EVENTS_PER_PAGE = 9;

// Define categories based on Ticketmaster's classification
const CATEGORIES = [
  { id: 'all', name: 'All Events', icon: '🌟' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'arts', name: 'Arts & Theatre', icon: '🎭' },
  { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'film', name: 'Film', icon: '🎬' }
];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  // Remove debounced search effect
  useEffect(() => {
    fetchEvents(currentPage, '', selectedCategory);
  }, [currentPage, selectedCategory]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  };

  const handleAuthError = (error) => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log('Auth error in Home component, clearing token...');
      localStorage.removeItem('token');
      localStorage.removeItem('loggedInUser');
      window.dispatchEvent(new Event('tokenChanged'));
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }
  };

  const getCachedEvents = (page, search, category) => {
    const cacheKey = `events_page_${page}_${search}_${category}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        return data;
      } catch (e) {
        console.error('Error parsing cached events:', e);
      }
    }
    return null;
  };

  const cacheEvents = (page, search, category, events) => {
    const cacheKey = `events_page_${page}_${search}_${category}`;
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: events
      }));
    } catch (e) {
      console.error('Error caching events:', e);
    }
  };

  const fetchEvents = async (page, search = '', category = 'all') => {
    let mounted = true;
    try {
      setLoading(true);
      
      // Check cache first
      const cachedEvents = getCachedEvents(page, search, category);
      if (cachedEvents) {
        setEvents(cachedEvents);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        size: EVENTS_PER_PAGE,
        page: page
      });

      if (search) {
        params.append('keyword', search);
      }

      if (category !== 'all') {
        params.append('category', category);
      }

      const response = await axios.get(`${EVENTS_API_URL}/api/trending-events?${params}`, {
        headers: getAuthHeaders()
      });
      
      if (mounted) {
        if (response.data.events && Array.isArray(response.data.events)) {
          setEvents(response.data.events);
          cacheEvents(page, search, category, response.data.events);
        } else if (Array.isArray(response.data)) {
          setEvents(response.data);
          cacheEvents(page, search, category, response.data);
        } else {
          console.error('Unexpected API response structure:', response.data);
          setEvents([]);
        }
      }
    } catch (error) {
      if (mounted) {
        console.error('Error fetching events:', error);
        handleAuthError(error);
        setError('Failed to load events. Please try again later.');
        setEvents([]);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
    
    return () => {
      mounted = false;
    };
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearchLoading(true);
    setSearchError(null);
    try {
      const params = new URLSearchParams({
        size: EVENTS_PER_PAGE,
        page: 0,
        keyword: searchQuery
      });
      
      const response = await axios.get(`${EVENTS_API_URL}/api/trending-events?${params}`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.events && Array.isArray(response.data.events)) {
        setSearchResults(response.data.events);
        setEvents(response.data.events);
        setIsSearching(true);
      } else if (Array.isArray(response.data)) {
        setSearchResults(response.data);
        setEvents(response.data);
        setIsSearching(true);
      } else {
        throw new Error('Unexpected API response structure');
      }
    } catch (error) {
      console.error('Error searching events:', error);
      handleAuthError(error);
      setSearchError('Failed to search events. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setSearchError(null);
    fetchEvents(currentPage, '', selectedCategory); // Reset to show all events
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleEventDetails = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handlePopularityDetails = (eventId) => {
    navigate(`/predictions/${eventId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
      fetchEvents(newPage, '', selectedCategory);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading trending events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => fetchEvents(currentPage, '', selectedCategory)} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Trending Events</h1>
        <p>Discover popular upcoming events</p>
        
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="search-button"
              onClick={handleSearch}
              disabled={isSearchLoading}
            >
              {isSearchLoading ? 'Searching...' : 'Search'}
            </button>
            {isSearching && (
              <button className="clear-search" onClick={clearSearch}>
                Clear
              </button>
            )}
          </div>
          {searchError && <div className="search-error">{searchError}</div>}
        </div>

        <div className="categories-container">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </header>

      {events.length === 0 ? (
        <div className="no-results">
          <h2>No events found</h2>
          <p>Try adjusting your search or category filters</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
      
      {events.length > 0 && (
        <div className="pagination-container">
          <PaginationControls
            currentPage={currentPage}
            totalPages={5} // You might want to calculate this based on your total events
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
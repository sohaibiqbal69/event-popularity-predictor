import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaSignOutAlt, FaHeart, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);

  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:8080/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.profileImage) {
          setProfileImage(response.data.profileImage);
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    fetchProfileImage();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    window.dispatchEvent(new Event('tokenChanged'));
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <svg className="sidebar-logo" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#1a1a1a"/>
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#4ec9ff" fontSize="20" fontWeight="bold">
              ES
            </text>
          </svg>
        </div>
        <h2>Event Sage</h2>
      </div>
      
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <Link to="/home" className={`nav-item ${isActive('/home') ? 'active' : ''}`}>
            <FaHome className="nav-icon" />
            <span>Home</span>
          </Link>
          
          <Link to="/favorites" className={`nav-item ${isActive('/favorites') ? 'active' : ''}`}>
            <FaHeart className="nav-icon" />
            <span>Favorites</span>
          </Link>

          <Link to="/about" className={`nav-item ${isActive('/about') ? 'active' : ''}`}>
            <FaInfoCircle className="nav-icon" />
            <span>About Us</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
            {profileImage ? (
              <div className="profile-image-container">
                <img src={profileImage} alt="Profile" className="profile-image" />
              </div>
            ) : (
              <FaUser className="nav-icon" />
            )}
            <span>Profile</span>
          </Link>
          
          <button onClick={handleLogout} className="nav-item logout-button">
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
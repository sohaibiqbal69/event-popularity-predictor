import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaSignOutAlt, FaHeart, FaInfoCircle, FaBars } from 'react-icons/fa';
import axios from 'axios';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    // Only save to localStorage when user manually toggles
    if (localStorage.getItem('sidebarCollapsed') !== null) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed]);

  // Force collapsed state on mount
  useEffect(() => {
    setIsCollapsed(true);
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.marginLeft = '80px';
      mainContent.classList.add('sidebar-collapsed');
    }
  }, []); // Run once on mount

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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.marginLeft = !isCollapsed ? '80px' : '250px';
    }
  };

  const handleNavClick = () => {
    if (!isCollapsed) {
      setIsCollapsed(true);
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.classList.add('sidebar-collapsed');
      }
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mainContent = document.querySelector('.main-content');
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
        if (mainContent) {
          mainContent.classList.add('sidebar-collapsed');
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check initial size

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle initial state
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (window.innerWidth <= 768 || isCollapsed) {
      if (mainContent) {
        mainContent.style.marginLeft = '80px';
        mainContent.classList.add('sidebar-collapsed');
      }
    }
  }, []); // Run once on mount

  return (
    <>
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
            <FaBars />
          </button>
          <h2>Event Sage</h2>
        </div>
        
        <div className="sidebar-content">
          <nav className="sidebar-nav">
            <Link to="/home" className={`nav-item ${isActive('/home') ? 'active' : ''}`} onClick={handleNavClick}>
              <FaHome className="nav-icon" />
              <span>Home</span>
            </Link>
            
            <Link to="/favorites" className={`nav-item ${isActive('/favorites') ? 'active' : ''}`} onClick={handleNavClick}>
              <FaHeart className="nav-icon" />
              <span>Favorites</span>
            </Link>

            <Link to="/about" className={`nav-item ${isActive('/about') ? 'active' : ''}`} onClick={handleNavClick}>
              <FaInfoCircle className="nav-icon" />
              <span>About Us</span>
            </Link>
          </nav>

          <div className="sidebar-footer">
            <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`} onClick={handleNavClick}>
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
    </>
  );
};

export default Sidebar;
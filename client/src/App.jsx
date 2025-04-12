import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Favorites from './pages/Favorites';
import Signup from './pages/Signup';
import Login from './pages/Login';
import About from './pages/About';
import PopularityDetails from './pages/PopularityDetails';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar.jsx';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      console.log('Checking authentication...', token ? 'Token exists' : 'No token');
      
      if (token) {
        setIsAuthenticated(true);
        console.log('User is authenticated');
      } else {
        setIsAuthenticated(false);
        console.log('User is not authenticated');
        const publicPaths = ['/login', '/signup'];
        if (!publicPaths.includes(location.pathname)) {
          console.log('Redirecting to login...');
          navigate('/login', { replace: true });
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    const handleTokenChange = () => {
      console.log('Token changed, rechecking authentication...');
      checkAuth();
    };

    window.addEventListener('tokenChanged', handleTokenChange);
    window.addEventListener('storage', handleTokenChange);

    return () => {
      window.removeEventListener('tokenChanged', handleTokenChange);
      window.removeEventListener('storage', handleTokenChange);
    };
  }, [navigate, location]);

  const PrivateRoute = ({ element }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      console.log('Access to private route denied, redirecting to login...');
      return <Navigate to="/login" replace />;
    }

    return element;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      {isAuthenticated && <Sidebar />}
      <main className={`main-content ${!isAuthenticated ? 'no-sidebar' : ''}`}>
        <Routes>
          <Route path="/" element={
            isAuthenticated ? 
            <Navigate to="/home" replace /> : 
            <Navigate to="/login" replace />
          } />
          <Route path="/login" element={
            isAuthenticated ? 
            <Navigate to="/home" replace /> : 
            <Login setIsAuthenticated={setIsAuthenticated} />
          } />
          <Route path="/signup" element={
            isAuthenticated ? 
            <Navigate to="/home" replace /> : 
            <Signup />
          } />
          <Route path="/home" element={<PrivateRoute element={<Home />} />} />
          <Route path="/events/:id" element={<PrivateRoute element={<EventDetails />} />} />
          <Route path="/predictions/:id" element={<PrivateRoute element={<PopularityDetails />} />} />
          <Route path="/favorites" element={<PrivateRoute element={<Favorites />} />} />
          <Route path="/about" element={<PrivateRoute element={<About />} />} />
          <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

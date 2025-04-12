import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <h1>About Event Sage</h1>
      
      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          Event Sage is dedicated to helping event enthusiasts make informed decisions 
          about their entertainment choices. We combine real-time data analytics with user 
          preferences to predict event popularity and help you discover trending events 
          before they sell out.
        </p>
      </section>

      <section className="about-section">
        <h2>What We Offer</h2>
        <ul>
          <li>Real-time event popularity predictions</li>
          <li>Comprehensive event details and analytics</li>
          <li>Personalized event recommendations</li>
          <li>Easy ticket purchasing integration</li>
          <li>Favorite events tracking</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>How It Works</h2>
        <p>
          Our advanced algorithm analyzes multiple factors including historical data, 
          social media trends, ticket sales patterns, and user engagement to predict 
          an event's popularity. This helps you stay ahead of the curve and never 
          miss out on must-attend events.
        </p>
      </section>

      <section className="about-section">
        <h2>Contact Us</h2>
        <p>
          Have questions or suggestions? We'd love to hear from you!<br />
          Email: support@eventsage.com<br />
          Follow us on social media for the latest updates.
        </p>
      </section>
    </div>
  );
};

export default About; 
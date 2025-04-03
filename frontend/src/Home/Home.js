import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="welcome-message">
        <h1>Welcome to the AI-powered Tutor System</h1>
        <p>Your personalized learning assistant, ready to help you in Math, Science, History, and more!</p>
        <a href="/tutor" className="start-btn">Start Learning</a>
      </div>
      <div className="image-container">
        <img src="/images/aitutor.jpg" alt="AI Tutor" className="tutor-image" />
      </div>
    </div>
  );
};

export default Home;

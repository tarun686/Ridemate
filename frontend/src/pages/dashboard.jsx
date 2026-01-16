import React from 'react';
import './dashboard.css';
const DashBoard = () => {
  return (
    <div className="page-container">
      {/* ---------- HEADER / NAVBAR ---------- */}
      <header className="header">
        <div className="header-left">
          <div className="logo">Uber</div>
          <nav className="nav-links">
            <a href="#">Ride</a>
            <a href="#">Drive</a>
            <a href="#">Business</a>
            <a href="#">Uber Eats</a>
            <a href="#">About</a>
          </nav>
        </div>
        <div className="header-right">
          <button className="nav-button">
            <FaGlobe /> EN
          </button>
          <button className="nav-button">Help</button>
          <button className="nav-button">Log in</button>
          <button className="signup-button">Sign up</button>
        </div>
      </header>

      {/* ---------- MAIN CONTENT (SPLIT SCREEN) ---------- */}
      <main className="main-content">
        {/* Left Panel */}
        <div className="left-panel">
          <h1>Log in to access your account</h1>

          <a href="#" className="login-option">
            <h2>Rider</h2>
            <FaArrowRight className="arrow-icon" />
          </a>

          <a href="#" className="login-option">
            <h2>Driver</h2>
            <FaArrowRight className="arrow-icon" />
          </a>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <img
            src="https://d1a3f4spmetaargv.cloudfront.net/static/sign-in-image-desktop-v1-32531DE.svg"
            alt="Car on a road"
            className="illustration"
          />
        </div>
      </main>
    </div>
  );
};

export default DashBoard;
import { Link, BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import heroImage from "./assets/images/bg.png";
function Home() {
  return (
    <div className="landing-container">
      {/* Background Section */}
      <div className="hero-section">
      <img src={heroImage} alt="RideMate banner" className="hero-image" />
      </div>

      {/* Main Text */}
      <div className="content">
        <h1 className="title">RIDEMATE</h1>
        <p className="subtitle">Share your wheeeeeeeels.</p>

        <div className="buttons">
          <Link to="/signup" className="btn btn-primary">
            SignUp
          </Link>
          <Link to="/login" className="btn btn-outline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
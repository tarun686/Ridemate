import { Link } from "react-router-dom";
import DashNavbar from "../components/dashnavbar";
import "./Dashboard.css";
import bgVideo from "../assets/images/ridemate-bg1.mp4";
import campus1 from "../assets/images/campus1.jpg";
import campus2 from "../assets/images/campus2.jpg";
import campus3 from "../assets/images/campus3.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping, faMoneyBill1, faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import {faYoutube,faXTwitter,faInstagram} from "@fortawesome/free-brands-svg-icons";
import { useEffect, useState } from "react";

const images = [campus1, campus2, campus3];
const Dashboard = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <DashNavbar />
      <section className="dashboard-hero">
        <video className="bg-video" autoPlay loop muted playsInline>
          <source src={bgVideo} type="video/mp4" />
        </video>

        <div className="video-overlay"></div>

        <div className="hero-content">
          <h1 className="dashboard-title">THIS IS RIDEMATE</h1>
          <p className="dashboard-subtitle">
            Your campus carpool companion.
          </p>

        <div className="dashboard-buttons">
          <Link to="/join-ride" className="dash-btn">
            Join Ride
          </Link>
          <Link to="/create" className="dash-btn outline">
            Create Ride
          </Link>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">

          <div className="about-left">
            <h2>
              RideMate-Your Campus <br />
              <span>Carpooling Network</span>
            </h2>

            <p className="about-highlight">
              At the forefront of smarter and more sustainable campus commuting.
            </p>

            <Link to="/about" className="about-link">
              Learn more →
            </Link>
          </div>

          <div className="about-right">
            <p>
              RideMate is a university-focused carpooling platform designed to
              connect students and faculty traveling along similar routes. We aim
              to reduce daily commuting stress by making rides more affordable,
              reliable, and eco-friendly.
            </p>

            <p>
              Our platform encourages ride-sharing within trusted campus communities,
              helping reduce traffic congestion, fuel costs, and carbon emissions,
              while also fostering meaningful connections between commuters.
            </p>

            <p>
              Whether you are heading to morning lectures, labs, hostels, or weekend
              trips back home, RideMate ensures that your journey is smarter, safer,
              and more social.
            </p>
          </div>
        </div>
      </section>
      <div className="ruler"></div>
      <section className="ridemate-features">
        <div className="features-container">
          <div className="feature-card">
            <FontAwesomeIcon icon={faBagShopping} className="icon1" />
            <h3>Travel Smarter</h3>
            <p>Find students traveling on similar routes and commute without stress.</p>
          </div>

          <div className="feature-card">
            <FontAwesomeIcon icon={faMoneyBill1} className="icon1" />
            <h3>Split Your Costs</h3>
            <p>Share fuel and travel expenses to make daily commuting affordable.</p>
          </div>

          <div className="feature-card">
            <FontAwesomeIcon icon={faSquareCheck} className="icon1" />
            <h3>Ride with Trust</h3>
            <p>University-based users, verified profiles, safer rides.</p>
          </div>

        </div>
      </section>
      <div className="ruler"></div>
      <section className="contact-split">
        <div className="contact-wrapper">
          <div className="contact-left">
            <h2>Contact Us</h2>

            <form className="contact-form">
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
              <textarea placeholder="Your Message" required />
              <button type="submit">Send Message</button>
            </form>
          </div>
          <div className="contact-right">
            <div className="slider">
              <div
                className="slides"
                style={{ width: `${images.length * 100}%`, transform: `translateX(-${slideIndex * (100 / images.length)}%)` }}
              >
                {images.map((img, i) => (
                  <img key={i} src={img} alt="campus" />
                ))}
              </div>


              <div className="slider-overlay">
                <h3>Smarter Campus Commutes</h3>
                <p>Connecting students, one ride at a time.</p>
              </div>
            </div>
          </div>

        </div>
      </section>
      <footer className="dashboard-footer">
        <div className="footer-top">
          <div className="footer-socials">
            <a href="#" aria-label="X"><FontAwesomeIcon icon={faXTwitter} /></a>
            <a href="#" aria-label="YouTube"><FontAwesomeIcon icon={faYoutube} /></a>
            <a href="#" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
          </div>
        </div>
        <div className="footer-logo">RideMate</div>
        <div className="footer-content">
          <div className="footer-col">
            <ul>
              <li>Home</li>
              <li>About Us</li>
              <li>Careers</li>
              <li>Safety</li>
              <li>Blog</li>
              <li>Privacy Policy</li>
            </ul>
          </div>

          <div className="footer-col">
            <ul>
              <li>Customer Terms – Campus Rides</li>
              <li>Customer Terms – Long Routes</li>
              <li>Corporate Affairs</li>
              <li>Driver Terms</li>
              <li>Community Guidelines</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 RideMate. All rights reserved.
        </div>
      </footer>

    </>
  );
};

export default Dashboard;

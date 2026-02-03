import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <>
      <NavBar />

      <section className="dashboard-hero">
        <div>IMAGE</div>
        <h1 className="dashboard-title">Welcome to RideMate</h1>
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

      {/* ABOUT US */}
      <section className="about-section">
        <h2>About Us</h2>
        <p>
          RideMate is a university-exclusive ride sharing platform designed
          to connect students travelling on similar routes.  
          Our goal is to make commuting <strong>affordable, safe, and eco-friendly</strong>
          for everyone on campus.
        </p>
      </section>

      {/* CONTACT US */}
      <section className="contact-section">
        <h2>Contact Us</h2>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" required />
          <button type="submit">Send Message</button>
        </form>
      </section>
    </>
  );
};

export default Dashboard;

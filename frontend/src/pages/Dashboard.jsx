import { Link, BrowserRouter, Routes, Route } from "react-router-dom";
import "./Dashboard.css";
const Dashboard = () => {
    return (
      <div>
        <nav>
          <span>LOGO</span>
          <span className="links">
          <a href="">Home</a>
          <a href="">About Us</a>
          <a href="">Inbox</a>
          <a href="">Profile</a>
          </span>
        </nav>
          <div>
            <img src="https://plus.unsplash.com/premium_vector-1682300635012-a256654b4a2f?q=80&w=1512&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
          </div>
          <div className="button">
            <Link to="" className="btn btn-primary">Create Ride</Link>
            <Link to="" className="btn btn-outline">Join Ride</Link>
          </div>
      </div>
    );
  };
export default Dashboard; 
  
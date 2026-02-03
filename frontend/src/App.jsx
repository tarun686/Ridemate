import { Link, BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NavBar from "./components/NavBar";
import Create from "./pages/Create"
import "./App.css";
import heroImage from "./assets/images/bg.png";
import image1 from "./assets/images/boy.jpg";
import image2 from "./assets/images/map.jpg";
import image3 from "./assets/images/carani.gif";

function Home() {
  return (
    <>
      <NavBar />

      <div className="landing-container">
        <div className="hero-section">
          <img src={heroImage} alt="RideMate banner" className="hero-image" />
        </div>

        <div className="content">
          <h1 className="title">RIDEMATE</h1>
          <p className="tagline">
            Connecting <span>GEU</span> — one ride at a time.
          </p>

          <div className="buttons">
            <Link to="/signup" className="btn btn-primary">SignUp</Link>
            <Link to="/login" className="btn btn-outline">Login</Link>
          </div>
        </div>
      </div>

      <section className="about-section">
        <div className="about-content">
          <div className="title1">Sharing Rides,</div>
          <div className="title1">Sharing Stories</div>
          <hr className="bold-line" />
          <p className="subTitle">
            RideMate is a campus-exclusive ride-sharing platform designed for 
            students of <strong>Graphic Era University</strong>.
          </p>
        </div>

        <div className="about-images">
          <img src={image1} alt="img1" />
          <img src={image2} alt="img2" />
          <img src={image3} alt="img3" className="imagegif" />
        </div>
      </section>
    </>
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
        <Route path="/create" element={<Create />} />
         
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import myimage from "../assets/images/gof.gif";
import Dashboard from "./dashboard";
export default function Login() {


  const navigate = useNavigate();



  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });
      setMessage(res.data.message);
      localStorage.setItem("token", res.data.token);
      setTimeout(() => {
        navigate("/dashboard");  
      }, 800);
    } catch (err) {
      setMessage("Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src={myimage}
          alt="Login Illustration"
          className="login-illustration"
        />
      </div>

      <div className="login-right">
        <div className="form-box">
          <h2 className="title">Welcome Back</h2>
          <p className="subtitle">Login to continue your RideMate journey.</p>

          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn-submit">
              Login
            </button>
          </form>

          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import axios from "axios";
import "./Signup.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/register", {
        name,
        email,
        password,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Signup failed ");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
       
      </div>

      <div className="signup-right">
        <div className="form-box">
          <h2 className="title">Create Account</h2>
          <p className="subtitle">Join RideMate and share your wheeeels 🛞</p>

          <form onSubmit={handleSignup} className="signup-form">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              Sign Up
            </button>
          </form>

          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";
import DashNavbar from "../components/dashnavbar";
import scoVideo from "../assets/images/ridemate-bg2.mp4";
import "./Create.css";

const Create = () => {
  const [from, setFrom] = useState({ name: "", lat: null, lng: null });
  const [to, setTo] = useState({ name: "", lat: null, lng: null });

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(1);
  const [price, setPrice] = useState("");
  const [vehicleno, setVehicleNo] = useState("");
  const [message, setMessage] = useState("");
  const [vehicle,setVehicle]=useState("");

  const fetchLocations = async (query, setSuggestions) => {
    if (query.length < 3) return setSuggestions([]);

    const res = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      { params: { q: query, format: "json", limit: 5 } }
    );

    setSuggestions(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:8080/api/ride/create",
      {
        from,
        to,
        date,
        time,
        availableSeats: seats,
        pricePerSeat: price,
        vehicle,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessage("Ride created successfully!");
  };

  return (
    <>
      <DashNavbar />
      <div className="head-text">
        Become a RideMate driver and save on travel expenses by sharing your ride with other GEU students
      </div>
      <div className="create-page">
        <div className="top-display">
          <div className="create-video">
            <video autoPlay loop muted>
              <source src={scoVideo} type="video/mp4" />
            </video>
          </div>
          <div className="create-card">
            <form onSubmit={handleSubmit}>
              <div className="autocomplete">
                <input
                  placeholder="From"
                  value={from.name}
                  onChange={(e) => {
                    setFrom({ ...from, name: e.target.value });
                    fetchLocations(e.target.value, setFromSuggestions);
                  }}
                />
                {fromSuggestions.length > 0 && (
                  <ul className="suggestions">
                    {fromSuggestions.map((p) => (
                      <li
                        key={p.place_id}
                        onClick={() => {
                          setFrom({ name: p.display_name, lat: p.lat, lng: p.lon });
                          setFromSuggestions([]);
                        }}
                      >
                        {p.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="autocomplete">
                <input
                  placeholder="To"
                  value={to.name}
                  onChange={(e) => {
                    setTo({ ...to, name: e.target.value });
                    fetchLocations(e.target.value, setToSuggestions);
                  }}
                />
                {toSuggestions.length > 0 && (
                  <ul className="suggestions">
                    {toSuggestions.map((p) => (
                      <li
                        key={p.place_id}
                        onClick={() => {
                          setTo({ name: p.display_name, lat: p.lat, lng: p.lon });
                          setToSuggestions([]);
                        }}
                      >
                        {p.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              <input type="number" min="1" value={seats} onChange={(e) => setSeats(e.target.value)} placeholder="Seats" />
              <input placeholder="Vehicle Number" value={vehicleno} onChange={(e) => setVehicleNo(e.target.value)} />
              <input type="number" placeholder="Price per seat" value={price} onChange={(e) => setPrice(e.target.value)} />
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
              >
                <option value="">Select Vehicle Type</option>
                <option value="bike">Bike</option>
                <option value="scooty">Scooty</option>
                <option value="car">Car</option>
              </select>
              <button type="submit">Create Ride</button>
            </form>

            {message && <p className="success">{message}</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Create;

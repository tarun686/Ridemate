import { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
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
  const [vehicle, setVehicle] = useState("");
  const [message, setMessage] = useState("");

  const [myRides, setMyRides] = useState([]);
  const [editingRide, setEditingRide] = useState(null);

  const fetchLocations = async (query, setSuggestions) => {
    if (query.length < 3) return setSuggestions([]);

    const res = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      { params: { q: query, format: "json", limit: 5 } }
    );

    setSuggestions(res.data);
  };

  const fetchMyRides = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "http://localhost:8080/api/ride/my-rides",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMyRides(res.data);
  };

  useEffect(() => {
    fetchMyRides();
  }, []);

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
    fetchMyRides();
  };

  const deleteRide = async (id) => {
    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:8080/api/ride/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchMyRides();
  };

  const updateRide = async () => {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:8080/api/ride/${editingRide._id}`,
      editingRide,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setEditingRide(null);
    fetchMyRides();
  };

  return (
    <>
      <NavBar />

      <div className="create-page">
        <div className="create-card">
          <h2>Create Ride</h2>

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
            <input placeholder="Vehicle Number" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
            <input type="number" placeholder="Price per seat" value={price} onChange={(e) => setPrice(e.target.value)} />

            <button type="submit">Create Ride</button>
          </form>

          {message && <p className="success">{message}</p>}
        </div>

        <div className="rides-section">
          <h2>Your Rides</h2>

          {myRides.map((ride) => (
            <div className="ride-card" key={ride._id}>
              <h3>{ride.from.name} ➝w {ride.to.name}</h3>
              <p>{new Date(ride.date).toDateString()} • {ride.time}</p>
              <p>Seats: {ride.availableSeats} | ₹{ride.pricePerSeat}</p>

              <div className="actions">
                <button onClick={() => setEditingRide(ride)}>Edit</button>
                <button className="danger" onClick={() => deleteRide(ride._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingRide && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Ride</h3>

            <input
              type="time"
              value={editingRide.time}
              onChange={(e) => setEditingRide({ ...editingRide, time: e.target.value })}
            />
            <input
              type="number"
              value={editingRide.pricePerSeat}
              onChange={(e) => setEditingRide({ ...editingRide, pricePerSeat: e.target.value })}
            />

            <div className="actions">
              <button onClick={updateRide}>Save</button>
              <button className="danger" onClick={() => setEditingRide(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Create;

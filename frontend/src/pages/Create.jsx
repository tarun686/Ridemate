import { useState, useEffect } from "react";import axios from "axios";
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
  const [vehicle, setVehicle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const fetchLocations = async (query, setSuggestions) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: query,
            format: "json",
            limit: 5,
          },
        }
      );

      setSuggestions(res.data);
    } catch (error) {
      console.error("Location fetch failed:", error);
      setSuggestions([]);
    }
  };

  const selectLocation = (place, setLocation, setSuggestions) => {
    setLocation({
      name: place.display_name,
      lat: Number(place.lat),
      lng: Number(place.lon),
    });

    setSuggestions([]);
  };

  const getRoute = async (from, to) => {
    return {
      start: {
        lat: from.lat,
        lng: from.lng,
      },
      end: {
        lat: to.lat,
        lng: to.lng,
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    if (!from.lat || !to.lat) {
      setMessage("Please select valid locations from suggestions.");
      return;
    }

    if (!date || !time || !seats || !price || !vehicleno || !vehicle) {
      setMessage("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const route = await getRoute(from, to);
      const dateTime = new Date(`${date}T${time}`);

      await axios.post(
        "http://localhost:8080/api/ride/create",
        {
          from: {
            ...from,
            lat: Number(from.lat),
            lng: Number(from.lng),
          },
          to: {
            ...to,
            lat: Number(to.lat),
            lng: Number(to.lng),
          },
          dateTime,
          availableSeats: Number(seats),
          pricePerSeat: Number(price),
          vehicleNo: vehicleno,
          vehicle,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Ride created successfully!");

      setFrom({ name: "", lat: null, lng: null });
      setTo({ name: "", lat: null, lng: null });
      setDate("");
      setTime("");
      setSeats(1);
      setPrice("");
      setVehicleNo("");
      setVehicle("");
    } catch (error) {
      console.error("Create ride failed:", error);
      setMessage(error.response?.data?.message || "Failed to create ride.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchLocations(fromQuery, setFromSuggestions);
    }, 500);
  
    return () => clearTimeout(delay);
  }, [fromQuery]);
  
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchLocations(toQuery, setToSuggestions);
    }, 500);
  
    return () => clearTimeout(delay);
  }, [toQuery]);
  return (
    <>
      <DashNavbar />

      <div className="head-text">
        Become a RideMate driver and save on travel expenses by sharing your
        ride with other GEU students
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
                    const value = e.target.value;
                    setFrom({ ...from, name: value });
                    setFromQuery(value); 
                  }}
                  required
                />

                {fromSuggestions.length > 0 && (
                  <ul className="suggestions">
                    {fromSuggestions.map((place) => (
                      <li
                        key={place.place_id}
                        onClick={() =>
                          selectLocation(place, setFrom, setFromSuggestions)
                        }
                      >
                        {place.display_name}
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
                    const value = e.target.value;
                    setTo({ ...to, name: value });
                    setToQuery(value);
                  }}
                  required
                />

                {toSuggestions.length > 0 && (
                  <ul className="suggestions">
                    {toSuggestions.map((place) => (
                      <li
                        key={place.place_id}
                        onClick={() =>
                          selectLocation(place, setTo, setToSuggestions)
                        }
                      >
                        {place.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />

              <input
                type="number"
                min="1"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                placeholder="Seats"
                required
              />

              <input
                placeholder="Vehicle Number"
                value={vehicleno}
                onChange={(e) => setVehicleNo(e.target.value)}
                required
              />

              <input
                type="number"
                min="0"
                placeholder="Price per seat"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />

              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="bike">Bike</option>
                <option value="scooty">Scooty</option>
                <option value="car">Car</option>
              </select>

              <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Ride"}
              </button>
            </form>

            {message && <p className="success">{message}</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Create;

import { useState, useEffect } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faLocationDot,
  faLocationCrosshairs,
  faClock,faUser
} from "@fortawesome/free-solid-svg-icons";
import bikeImg from "../assets/images/bike.webp";
import scootyImg from "../assets/images/scooty2.png";
import carImg from "../assets/images/car1.png";
import logo from "../assets/images/ridemate-logo3.png";
import "./Join-ride.css";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});
const FitRoute = ({ geojson }) => {
  const map = useMap();

  useEffect(() => {
    if (geojson) {
      const layer = L.geoJSON(geojson);
      map.fitBounds(layer.getBounds(), { padding: [60, 60] });
    }
  }, [geojson, map]);

  return null;
};

const JoinRide = () => {
  const [pickupText, setPickupText] = useState("");
  const [dropText, setDropText] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);

  const [pickupCoord, setPickupCoord] = useState(null);
  const [dropCoord, setDropCoord] = useState(null);

  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const defaultCenter = [30.3165, 78.0322];

  const fetchSuggestions = async (query, setter) => {
    if (query.length < 3) {
      setter([]);
      return;
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          "User-Agent": "RideMate-University-Project"
        }
      }
    );

    const data = await res.json();
    setter(data);
  };
  const fetchRoute = async (start, end) => {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
    );

    const data = await res.json();

    if (data.routes.length > 0) {
      setRouteGeoJSON({
        type: "Feature",
        geometry: data.routes[0].geometry
      });
    }
  };
  const handleSearch = async () => {
    if (!pickupCoord || !dropCoord) {
      alert("Please select locations from dropdown");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    fetchRoute(pickupCoord, dropCoord);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:8080/api/ride/search?from=${pickupText}&to=${dropText}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTimeout(() => {
        setSearchResults(res.data);
        setIsSearching(false);
      }, 2000);

    } catch (err) {
      console.error(err);
      setIsSearching(false);
    }
  };
  return (
    <div className="joinride-container">
      <div className="joinride-left">
        <div className="nav">
          <button className="menu-btn">
            <FontAwesomeIcon icon={faBars} />
          </button>
          <h3>RideMate</h3>
          <img src={logo} className="canva-logo" />
        </div>

        <h2>Get a ride</h2>
        <div className="input-group autocomplete">
          <span className="input-icon green">
            <FontAwesomeIcon icon={faLocationDot} />
          </span>
          <input
            value={pickupText}
            onChange={(e) => {
              setPickupText(e.target.value);
              fetchSuggestions(e.target.value, setPickupSuggestions);
            }}
            placeholder="Pickup location"
          />
          {pickupSuggestions.length > 0 && (
            <ul className="dropdown">
              {pickupSuggestions.map((p) => (
                <li
                  key={p.place_id}
                  onClick={() => {
                    setPickupText(p.display_name);
                    setPickupCoord([parseFloat(p.lat), parseFloat(p.lon)]);
                    setPickupSuggestions([]);
                  }}
                >
                  {p.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="input-group autocomplete">
          <span className="input-icon red">
            <FontAwesomeIcon icon={faLocationCrosshairs} />
          </span>
          <input
            value={dropText}
            onChange={(e) => {
              setDropText(e.target.value);
              fetchSuggestions(e.target.value, setDropSuggestions);
            }}
            placeholder="Drop location"
          />
          {dropSuggestions.length > 0 && (
            <ul className="dropdown">
              {dropSuggestions.map((p) => (
                <li
                  key={p.place_id}
                  onClick={() => {
                    setDropText(p.display_name);
                    setDropCoord([parseFloat(p.lat), parseFloat(p.lon)]);
                    setDropSuggestions([]);
                  }}
                >
                  {p.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="input-group">
          <FontAwesomeIcon icon={faClock} className="input-icon" />
          <select>
            <option>Pickup now</option>
            <option>Schedule for later</option>
          </select>
        </div>

        <button className="search-btn" onClick={handleSearch}>
          Search Rides
        </button>
        <div className="search-results">
          {!isSearching && hasSearched && searchResults.length > 0 && (
            <h2>Choose a ride
              <p className="choose-sub">Rides we think you'll like</p>
            </h2>
          )}

          {isSearching ? (
            <div className="searching-state">
              <div className="loader"></div>
              <p>Searching rides near you...</p>
            </div>
          ) : hasSearched ? (
            searchResults.length > 0 ? (
              searchResults.map((ride) => (
                <div
                  key={ride._id}
                  className={`ride-card ${selectedRide?._id === ride._id ? "selected" : ""}`}
                  onClick={() => setSelectedRide(ride)}
                >
                  <div className="ride-left-section">
                    <img
                      src={
                        ride.vehicle === "bike"
                          ? bikeImg
                          : ride.vehicle === "scooty"
                            ? scootyImg
                            : carImg
                      }
                      alt={ride.vehicle}
                      className="ride-vehicle-img"
                    />

                    <div className="ride-details">
                      <h4>{ride.vehicle}</h4>
                      <p>5 mins away • {ride.time}</p>
                      <span>
                        {ride.vehicle === "bike"
                          ? "Affordable bike rides"
                          : ride.vehicle === "car"
                            ? "Comfortable carpool"
                            : "Quick scooty rides"}
                      </span>
                    </div>
                  </div>

                  <div className="ride-price">
                    ₹{ride.pricePerSeat}
                    <div><FontAwesomeIcon icon={faUser} />
                    {ride.availableSeats}</div>
                  </div>
                </div>
              ))
            ) : (
              <p>No rides available at the moment</p>
            )
          ) : null}
        </div>
      </div>
      <div className="joinride-right">
        <MapContainer center={defaultCenter} zoom={13} className="map">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {pickupCoord && (
            <Marker position={pickupCoord}>
              <Popup>Pickup</Popup>
            </Marker>
          )}

          {dropCoord && (
            <Marker position={dropCoord}>
              <Popup>Drop</Popup>
            </Marker>
          )}

          {routeGeoJSON && (
            <>
              <GeoJSON data={routeGeoJSON} />
              <FitRoute geojson={routeGeoJSON} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default JoinRide;

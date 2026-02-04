import { useState, useEffect } from "react";
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
  faClock
} from "@fortawesome/free-solid-svg-icons";
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

/* ---------- Fit route ---------- */
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

  const defaultCenter = [30.3165, 78.0322];

  /* ---------- AUTOCOMPLETE ---------- */
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
  const handleSearch = () => {
    if (!pickupCoord || !dropCoord) {
      alert("Please select locations from dropdown");
      return;
    }

    fetchRoute(pickupCoord, dropCoord);
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
      </div>

      {/* MAP */}
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

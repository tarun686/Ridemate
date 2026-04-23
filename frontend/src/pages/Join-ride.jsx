import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faLocationDot,
  faLocationCrosshairs,
  faClock, faUser
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
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SEARCH_RADIUS_KM = 3;

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

  // This stores the ride currently opened in the detail view.
  // When it is null, we show the search/results view.
  const [detailRide, setDetailRide] = useState(null);

  // Payment mode selected on the detail screen.
  const [paymentMode, setPaymentMode] = useState("Cash");

  const defaultCenter = [30.3165, 78.0322];
  const navigate = useNavigate();

  const getVehicleImage = (vehicle) => {
    if (vehicle === "bike") return bikeImg;
    if (vehicle === "scooty") return scootyImg;
    return carImg;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pickupText.trim().length >= 3 && !pickupCoord) {
        fetchSuggestions(pickupText, setPickupSuggestions);
      } else {
        setPickupSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pickupText, pickupCoord]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dropText.trim().length >= 3 && !dropCoord) {
        fetchSuggestions(dropText, setDropSuggestions);
      } else {
        setDropSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [dropText, dropCoord]);

  const formatRideDateTime = (dateTime) => {
    const rideDate = new Date(dateTime);

    return rideDate.toLocaleString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleConfirm = (ride) => {
    navigate(`/ride/${ride._id}/details`);
  };
  const fetchSuggestions = async (query, setter) => {
    if (query.trim().length < 3) {
      setter([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            "User-Agent": "RideMate-University-Project",
          },
        }
      );

      const data = await res.json();
      setter(data);
    } catch (error) {
      console.error("Location suggestions failed:", error);
      setter([]);
    }
  };

  const fetchRoute = async (start, end) => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );

      const data = await res.json();

      if (data.routes?.length > 0) {
        setRouteGeoJSON({
          type: "Feature",
          geometry: data.routes[0].geometry,
        });
      }
    } catch (error) {
      console.error("Route fetch failed:", error);
    }
  };

  const handleSearch = async () => {
    if (!pickupCoord || !dropCoord) {
      alert("Please select locations from dropdown");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setDetailRide(null);
    setSearchResults([]);

    fetchRoute(pickupCoord, dropCoord);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:8080/api/ride/search", {
        params: {
          fromLat: pickupCoord[0],
          fromLng: pickupCoord[1],
          toLat: dropCoord[0],
          toLng: dropCoord[1],
          radiusKm: SEARCH_RADIUS_KM,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to search rides");
    } finally {
      setIsSearching(false);
    }
  };

  const openRideDetails = (ride) => {
    // This changes only the left-side UI.
    // Search results remain stored in searchResults state.
    console.log("Selected ride:", ride);
    setDetailRide(ride);
    setPaymentMode("Cash");
  };

  const goBackToResults = () => {
    // Because we are not routing away or unmounting the page,
    // the old search results are still available.
    setDetailRide(null);
  };

  const requestRide = async (ride) => {
    if (!pickupCoord || !dropCoord) {
      alert("Please select pickup and drop locations first");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:8080/api/ride/${ride._id}/request`,
        {
          from: {
            name: pickupText,
            lat: pickupCoord[0],
            lng: pickupCoord[1],
          },
          to: {
            name: dropText,
            lat: dropCoord[0],
            lng: dropCoord[1],
          },
          paymentMode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Ride request sent to driver!");
      setDetailRide(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to request ride");
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

          <img src={logo} className="canva-logo" alt="RideMate logo" />
        </div>

        {detailRide ? (
          <div className="ride-detail-page">
            <button className="back-btn" onClick={goBackToResults}>
              Back
            </button>

            <div className="ride-detail-header">
              <img
                src={getVehicleImage(detailRide.vehicle)}
                alt={detailRide.vehicle}
                className="ride-detail-vehicle-img"
              />
              <div>
                <h2>{detailRide.vehicle} Ride</h2>
                <p>{formatRideDateTime(detailRide.dateTime)}</p>
                {detailRide.vehicleNo && <span>{detailRide.vehicleNo}</span>}
              </div>
            </div>

            <div className="ride-detail-section">
              <h3>Route</h3>

              <div className="detail-location">
                <FontAwesomeIcon icon={faLocationDot} className="green" />
                <p>{pickupText}</p>
              </div>

              <div className="detail-location">
                <FontAwesomeIcon icon={faLocationCrosshairs} className="red" />
                <p>{dropText}</p>
              </div>
            </div>

            <div className="ride-detail-section">
              <h3>Ride Info</h3>
              <div className="detail-row">
                <span>Pickup distance</span>
                <strong>{detailRide.pickupDistanceKm?.toFixed(1)} km</strong>
              </div>

              <div className="detail-row">
                <span>Drop distance</span>
                <strong>{detailRide.dropDistanceKm?.toFixed(1)} km</strong>
              </div>

              <div className="detail-row">
                <span>Available seats</span>
                <strong>{detailRide.availableSeats}</strong>
              </div>

              <div className="detail-row total-fare">
                <span>Total fare</span>
                <strong>₹{detailRide.pricePerSeat}</strong>
              </div>
            </div>

            <div className="ride-detail-section">
              <h3>Payment</h3>

              <select
                className="payment-select"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
              </select>
            </div>

            <button
              className="confirm-request-btn"
              onClick={() => requestRide(detailRide)}
            >
              Confirm and Request
            </button>
          </div>
        ) : (
          <>
            <h2>Get a ride</h2>

            <div className="input-group autocomplete">
              <span className="input-icon green">
                <FontAwesomeIcon icon={faLocationDot} />
              </span>

              <input
                value={pickupText}
                onChange={(e) => {
                  setPickupText(e.target.value);
                  setPickupCoord(null);
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
                  setDropCoord(null);
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
                <p className="choose-sub">Ride You May Like.</p>
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
                      className="ride-card clickable"
                      onClick={() => openRideDetails(ride)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") openRideDetails(ride);
                      }}
                    >
                      <div className="ride-left-section">
                        <img
                          src={getVehicleImage(ride.vehicle)}
                          alt={ride.vehicle}
                          className="ride-vehicle-img"
                        />

                        <div className="ride-details">
                          <h4>{ride.vehicle}</h4>

                          <p>{formatRideDateTime(ride.dateTime)}</p>

                          <span>
                            Pickup {ride.pickupDistanceKm?.toFixed(1)} km away •
                            Drop {ride.dropDistanceKm?.toFixed(1)} km away
                          </span>

                          {ride.vehicleNo && <small>{ride.vehicleNo}</small>}
                        </div>
                      </div>

                      <div className="ride-price">
                        ₹{ride.pricePerSeat}
                        <div>
                          <FontAwesomeIcon icon={faUser} />{" "}
                          {ride.availableSeats}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No future rides available within {SEARCH_RADIUS_KM} km</p>
                )
              ) : null}
            </div>
          </>
        )}
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

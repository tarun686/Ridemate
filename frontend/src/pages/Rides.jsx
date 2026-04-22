import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationCrosshairs,
  faCircleInfo,
  faBars,
  faUserPen,
} from "@fortawesome/free-solid-svg-icons";
import bikeImg from "../assets/images/bike.webp";
import scootyImg from "../assets/images/scooty2.png";
import carImg from "../assets/images/car1.png";
import createdImg from "/ride.jpg";
import bookedImg from "../assets/images/booked.png";
import "./Rides.css";
import socket from "../socket";

// Helper to get ride date and time
const Rides = () => {
  const [createdRides, setCreatedRides] = useState([]);
  const [bookedRides, setBookedRides] = useState([]);
  const [rideRequests, setRideRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("created");

  // Fetch rides created by the user
  const fetchMyRides = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:8080/api/ride/my-rides", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setCreatedRides(res.data);
  };

  // Fetch rides booked by the user
  const fetchBookedRides = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await axios.get("http://localhost:8080/api/ride/booked-rides", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setBookedRides(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  
  // Fetch ride requests for rides created by the user
  const fetchRideRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:8080/api/ride/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRideRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
  fetchMyRides();
  fetchBookedRides();
  fetchRideRequests();
}, []);


  // Delete a ride created by the user
  const deleteRide = async (id) => {
    const token = localStorage.getItem("token");

    await axios.delete(`http://localhost:8080/api/ride/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchMyRides();
    fetchRideRequests();
  };

  // Accept or reject ride requests
  const acceptRequest = async (rideId, passengerId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:8080/api/ride/${rideId}/request/${passengerId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

        fetchMyRides();
        fetchBookedRides();
        fetchRideRequests();

    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept request");
    }
  };

  // Reject a ride request
  const rejectRequest = async (rideId, passengerId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:8080/api/ride/${rideId}/request/${passengerId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchRideRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject request");
    }
  };

  // Listen for real-time updates on ride request status
  useEffect(() => {
    const handleAccepted = (data) => {
        alert(data.message);
        fetchBookedRides();
      };      
  
    // When a request is accepted, we also want to refresh the booked rides to show the new booking
    const handleRejected = (data) => {
      alert(data.message);
    };
  
    socket.on("ride-request-accepted", handleAccepted);
    socket.on("ride-request-rejected", handleRejected);
  
    return () => {
      socket.off("ride-request-accepted", handleAccepted);
      socket.off("ride-request-rejected", handleRejected);
    };
  }, []);

  
  // Helper to get vehicle image based on type
  const getVehicleImage = (type) => {
    if (type === "bike") return bikeImg;
    if (type === "scooty") return scootyImg;
    if (type === "car") return carImg;
    return null;
  };

  //tabs switch
  const ridesToShow = activeTab === "created" ? createdRides : bookedRides;

  const rightImage =
    activeTab === "created"
      ? createdImg
      : activeTab === "booked"
      ? bookedImg
      : createdImg;
  //

  return (
    <div className="rides-main">
      <div className="rides-left">
        <div className="top-bar">
          <p>
            <FontAwesomeIcon icon={faBars} className="menu-icon" />
          </p>

          <div className="logo">
            <div className="logo-img"></div>
            <p>RIDEMATE</p>
          </div>

          <div className="user-icon">
            <FontAwesomeIcon icon={faUserPen} className="man" />
          </div>
        </div>

        <div className="rides-content">
          <div className="ride-tabs">
            <button
              className={activeTab === "created" ? "active" : ""}
              onClick={() => setActiveTab("created")}
            >
              CREATED
            </button>

            <button
              className={activeTab === "booked" ? "active" : ""}
              onClick={() => setActiveTab("booked")}
            >
              BOOKED
            </button>

            <button
              className={activeTab === "requests" ? "active" : ""}
              onClick={() => setActiveTab("requests")}
            >
              REQUESTS
            </button>
          </div>

          {activeTab !== "requests" &&
            (ridesToShow.length === 0 ? (
              <p className="empty">No rides yet</p>
            ) : (
              ridesToShow.map((ride) => (
                <div className="ride-card" key={ride._id}>
                  <div className="first-line">
                    <div>
                      <p>
                        {new Date(ride.dateTime).toDateString()} •{" "}
                        {new Date(ride.dateTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p>₹{ride.pricePerSeat}</p>
                    </div>
                  </div>

                  <div className="location">
                    <p>
                      <FontAwesomeIcon
                        icon={faLocationCrosshairs}
                        style={{ color: "red" }}
                      />{" "}
                      {ride.from.name}
                    </p>

                    <p>
                      <FontAwesomeIcon
                        icon={faLocationCrosshairs}
                        style={{ color: "green" }}
                      />{" "}
                      {ride.to.name}
                    </p>
                  </div>

                  <div className="actions">
                    <div className="delete-info">
                      {activeTab === "created" && (
                        <button
                          className="danger"
                          onClick={() => deleteRide(ride._id)}
                        >
                          Delete
                        </button>
                      )}

                      <FontAwesomeIcon icon={faCircleInfo} />

                      <img
                        src={getVehicleImage(ride.vehicle)}
                        alt={ride.vehicle}
                        className="vehicle-img"
                      />

                      <p>{ride.vehicleNo}</p>
                    </div>

                    <div className="driver-img"></div>
                  </div>
                </div>
              ))
            ))}
          {activeTab === "requests" && (
            <div className="requests-demo">
              <h3>Ride Requests</h3>

              {rideRequests.length === 0 ? (
                <p className="empty">No ride requests yet</p>
              ) : (
                rideRequests.map((ride) => (
                  <div className="request-ride-card" key={ride._id}>
                    <div className="request-ride-header">
                      <div className="request-route-clean">
                        <div className="route-point">
                          <span className="route-dot pickup-dot"></span>
                          <p>{ride.from.name}</p>
                        </div>

                        <div className="route-line"></div>

                        <div className="route-point">
                          <span className="route-dot drop-dot"></span>
                          <p>{ride.to.name}</p>
                        </div>
                      </div>

                      <span className="request-time">
                        {new Date(ride.dateTime).toLocaleString([], {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="request-meta">
                      <div className="request-meta-item">
                        <img
                          src={getVehicleImage(ride.vehicle)}
                          alt={ride.vehicle}
                          className="request-vehicle-img"
                        />
                        <span>{ride.vehicle}</span>
                      </div>

                      <div className="request-meta-item fare">
                        <span>₹{ride.pricePerSeat}</span>
                      </div>
                    </div>

                    {ride.passengers
                      ?.filter((passenger) => passenger.status === "pending")
                      .map((passenger) => (
                        <div className="request-user-card" key={passenger._id}>
                          <div className="request-user-info">
                            <div className="request-avatar">
                              {(passenger.user?.name || "P")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {passenger.user?.name || "Passenger"}
                              </strong>
                              <p>{passenger.user?.email}</p>
                            </div>
                          </div>

                          <div className="request-actions">
                            <button
                              className="reject-btn"
                              onClick={() =>
                                rejectRequest(ride._id, passenger._id)
                              }
                            >
                              Reject
                            </button>

                            <button
                              className="accept-btn"
                              onClick={() =>
                                acceptRequest(ride._id, passenger._id)
                              }
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rides-right">
        <img src={rightImage} alt="ride visual" className="right-img" />

        <div className="overlay">
          <p>
            {activeTab === "created"
              ? "Share rides. Save money. Travel smart."
              : activeTab === "booked"
              ? "Find rides. Travel together. Save more."
              : "Review requests. Choose your passengers."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Rides;

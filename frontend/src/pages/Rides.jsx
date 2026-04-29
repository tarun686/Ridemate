import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUserPen } from "@fortawesome/free-solid-svg-icons";
import bikeImg from "../assets/images/bike.webp";
import scootyImg from "../assets/images/scooty2.png";
import carImg from "../assets/images/car1.png";
import createdImg from "/ride.jpg";
import bookedImg from "../assets/images/booked.png";
import "./Rides.css";
import RideCard from "../components/Ridecard";
import socket from "../socket";
import { useNavigate } from "react-router-dom";


const Rides = () => {
  const [createdRides, setCreatedRides] = useState([]);
  const [bookedRides, setBookedRides] = useState([]);
  const [rideRequests, setRideRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("created");
  const navigate = useNavigate();
  
  const fetchMyRides = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:8080/api/ride/my-rides", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setCreatedRides(res.data);
  };

  const fetchBookedRides = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:8080/api/ride/booked-rides",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookedRides(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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

  const deleteRide = async (id) => {
    const token = localStorage.getItem("token");

    await axios.delete(`http://localhost:8080/api/ride/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchMyRides();
    fetchRideRequests();
  };

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

  useEffect(() => {
    const handleAccepted = (data) => {
      alert(data.message);
      fetchBookedRides();
    };

    const handleRejected = (data) => {
      alert(data.message);
    };

    // Listen for real-time ride status updates
    const handleRideStarted = (data) => {
      console.log("Ride started:", data);
      fetchMyRides();
      fetchBookedRides();
    };

    const handleRideCompleted = (data) => {
      console.log("Ride completed:", data);
      fetchMyRides();
      fetchBookedRides();
    };

    const handleOTPVerified = (data) => {
      console.log("OTP verified:", data);
      fetchMyRides();
      fetchBookedRides();
    };

    socket.on("ride-request-accepted", handleAccepted);
    socket.on("ride-request-rejected", handleRejected);
    socket.on("ride:started", handleRideStarted);
    socket.on("ride:completed", handleRideCompleted);
    socket.on("ride:passenger-otp-verified", handleOTPVerified);

    return () => {
      socket.off("ride-request-accepted", handleAccepted);
      socket.off("ride-request-rejected", handleRejected);
      socket.off("ride:started", handleRideStarted);
      socket.off("ride:completed", handleRideCompleted);
      socket.off("ride:passenger-otp-verified", handleOTPVerified);
    };
  }, []);

  const getVehicleImage = (type) => {
    if (type === "bike") return bikeImg;
    if (type === "scooty") return scootyImg;
    if (type === "car") return carImg;
    return null;
  };

  const rightImage =
    activeTab === "created"
      ? createdImg
      : activeTab === "booked"
      ? bookedImg
      : createdImg;

  const now = Date.now();

  const activeCreatedRides = [...createdRides]
    .filter((ride) => new Date(ride.dateTime).getTime() >= now)
    .sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

  const historyCreatedRides = [...createdRides]
    .filter((ride) => new Date(ride.dateTime).getTime() < now)
    .sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );

  const sortedBookedRides = [...bookedRides].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );

  const pendingRideRequests = rideRequests.filter((ride) => {
    const rideStartTime = new Date(ride.dateTime).getTime();
    const hasPendingPassengers = ride.passengers?.some(
      (passenger) => passenger.status === "pending"
    );

    return rideStartTime > now && hasPendingPassengers;
  });

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

          {activeTab === "created" && (
            <>
              <h3>Active Ride</h3>
              {activeCreatedRides.length === 0 ? (
                <p className="empty">No active rides</p>
              ) : (
                activeCreatedRides.map((ride) => (
                  <RideCard
                    key={ride._id}
                    ride={ride}
                    showDelete={true}
                    onDelete={deleteRide}
                    getVehicleImage={getVehicleImage}
                    onClick={() => navigate(`/ride-details/${ride._id}`)}
                    isClickable={true}
                  />
                ))
              )}

              <h3>History</h3>
              {historyCreatedRides.length === 0 ? (
                <p className="empty">No history rides</p>
              ) : (
                historyCreatedRides.map((ride) => (
                  <RideCard
                    key={ride._id}
                    ride={ride}
                    showDelete={false}
                    onDelete={deleteRide}
                    getVehicleImage={getVehicleImage}
                    onClick={
                      ride.status !== "completed"
                        ? () => navigate(`/ride-details/${ride._id}`)
                        : undefined
                    }
                    isClickable={ride.status !== "completed"}
                  />
                ))
              )}
            </>
          )}

          {activeTab === "booked" &&
            (sortedBookedRides.length === 0 ? (
              <p className="empty">No rides yet</p>
            ) : (
              sortedBookedRides.map((ride) => (
                <RideCard
                  key={ride._id}
                  ride={ride}
                  showDelete={false}
                  onDelete={deleteRide}
                  getVehicleImage={getVehicleImage}
                  onClick={
                    ride.status !== "completed"
                      ? () => navigate(`/ride-details/${ride._id}`)
                      : undefined
                  }
                  isClickable={ride.status !== "completed"}
                />
              ))
            ))}

          {activeTab === "requests" && (
            <div className="requests-demo">
              <h3>Ride Requests</h3>

              {pendingRideRequests.length === 0 ? (
                <p className="empty">No ride requests yet</p>
              ) : (
                pendingRideRequests.map((ride) => (
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
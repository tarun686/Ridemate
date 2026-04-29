import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserCheck,
    faCommentDots,
    faPhone,
    faLocationCrosshairs,
    faReceipt,
    faCircleQuestion,
    faBan,
    faPlay,
    faCheck,
    faUsers,
    faIdCard,
    faKey,
} from "@fortawesome/free-solid-svg-icons";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    GeoJSON,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Talk from "talkjs";
import bikeImg from "../assets/images/bike.webp";
import socket from "../socket";
import "./RideDetails.css";

const API_BASE_URL = "http://localhost:8080/api";
const TALKJS_APP_ID = "tBo34UsG";

const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
        return {};
    }
};

const getId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value._id || value.id || "";
};

const toPosition = (location) => {
    if (!location) return null;

    const lat = Number(location.lat ?? location.latitude);
    const lng = Number(location.lng ?? location.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return [lat, lng];
};
const FitRoute = ({ routeGeoJSON }) => {
    const map = useMap();

    useEffect(() => {
        if (!routeGeoJSON) return;

        const bounds = routeGeoJSON.geometry.coordinates.map(([lng, lat]) => [
            lat,
            lng,
        ]);

        map.fitBounds(bounds, {
            padding: [40, 40],
        });
    }, [routeGeoJSON, map]);

    return null;
};

const RideDetails = () => {
    const { rideId } = useParams();
    const [routeGeoJSON, setRouteGeoJSON] = useState(null);

    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [chatUser, setChatUser] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [passengerLocations, setPassengerLocations] = useState({});
    const [otpInputs, setOtpInputs] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const watchIdRef = useRef(null);
    const talkSessionRef = useRef(null);

    const currentUser = getStoredUser();
    const currentUserId = getId(currentUser);

    const driverId = getId(ride?.driver);
    const isDriver = currentUserId === driverId;
    // 📍 Distance (Haversine)
    const getDistanceInKm = (pos1, pos2) => {
        if (!pos1 || !pos2) return null;

        const toRad = (v) => (v * Math.PI) / 180;

        const [lat1, lon1] = pos1;
        const [lat2, lon2] = pos2;

        const R = 6371;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    };
    const getETA = (distanceKm) => {
        if (!distanceKm) return null;

        const avgSpeed = 30;
        return Math.round((distanceKm / avgSpeed) * 60);
    };
    const acceptedPassengers =
        ride?.passengers?.filter((passenger) => passenger.status === "accepted") ||
        [];

    const currentPassenger = acceptedPassengers.find(
        (passenger) => getId(passenger.user) === currentUserId
    );

    const isPassenger = Boolean(currentPassenger);

    const rideStarted =
        ride?.status === "driver_started" || ride?.status === "in_progress";

    const rideCompleted = ride?.status === "completed";

    const pickupPosition = toPosition(ride?.from);
    const dropPosition = toPosition(ride?.to);
    const liveDriverPosition =
        toPosition(driverLocation) || toPosition(ride?.driverLocation);

    const mapCenter = liveDriverPosition ||
        pickupPosition ||
        dropPosition || [30.3165, 78.0322];
    // console.log(liveDriverPosition);
    const distance = getDistanceInKm(liveDriverPosition, pickupPosition);
    const eta = getETA(distance);
    const fetchRideDetails = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(`${API_BASE_URL}/ride/${rideId}/details`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setRide(res.data);
            setDriverLocation(res.data.driverLocation || null);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to load ride details");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const fetchActualRoute = async () => {
            if (!pickupPosition || !dropPosition) return;

            const [fromLat, fromLng] = pickupPosition;
            const [toLat, toLng] = dropPosition;

            try {
                const res = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
                );

                const data = await res.json();

                if (data.routes?.length > 0) {
                    setRouteGeoJSON({
                        type: "Feature",
                        geometry: data.routes[0].geometry,
                    });
                }
            } catch (err) {
                console.error("Route fetch failed:", err);
            }
        };

        fetchActualRoute();
    }, [pickupPosition, dropPosition]);

    useEffect(() => {
        fetchRideDetails();
    }, [rideId]);

    useEffect(() => {
        if (!rideId) return;

        const joinRoom = () => {
            console.log("Joining room AFTER CONNECT:", rideId);
            socket.emit("join-ride-room", { rideId });
        };

        // ✅ If already connected
        if (socket.connected) {
            joinRoom();
        }
        // ✅ If not connected yet
        else {
            socket.on("connect", joinRoom);
        }

        const handleRideStarted = (data) => {
            if (data.rideId !== rideId) return;

            setRide((prev) =>
                prev ? { ...prev, status: "driver_started" } : prev
            );
        };

        const handleDriverLocation = (data) => {
            console.log("PASSENGER RECEIVED:", data);
            setDriverLocation(data.location);
        };

        const handlePassengerLocation = (data) => {
            if (data.rideId !== rideId) return;

            setPassengerLocations((prev) => ({
                ...prev,
                [data.passengerId || data.userId]: data.location,
            }));
        };

        const handleOtpVerified = (data) => {
            if (data.rideId !== rideId) return;
            fetchRideDetails();
        };

        const handleRideCompleted = (data) => {
            if (data.rideId !== rideId) return;

            setRide((prev) =>
                prev ? { ...prev, status: "completed" } : prev
            );
        };

        socket.on("ride:started", handleRideStarted);
        socket.on("driver-location:update", handleDriverLocation);
        socket.on("passenger-location:update", handlePassengerLocation);
        socket.on("ride:passenger-otp-verified", handleOtpVerified);
        socket.on("ride:completed", handleRideCompleted);

        return () => {
            socket.off("connect", joinRoom); // ✅ important
            socket.off("ride:started", handleRideStarted);
            socket.off("driver-location:update", handleDriverLocation);
            socket.off("passenger-location:update", handlePassengerLocation);
            socket.off("ride:passenger-otp-verified", handleOtpVerified);
            socket.off("ride:completed", handleRideCompleted);

            socket.emit("leave-ride-room", { rideId });
        };
    }, [rideId]);

    useEffect(() => {
        if (!rideStarted || rideCompleted) return;
        if (!isDriver && !isPassenger) return;
        if (!navigator.geolocation) return;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    updatedAt: new Date().toISOString(),
                };

                if (isDriver) {
                    console.log("sending:",location);
                    setDriverLocation(location);

                    socket.emit("driver-location:send", {
                        rideId,
                        driverId: currentUserId,
                        location,
                    });
                }

                if (isPassenger) {
                    socket.emit("passenger-location:send", {
                        rideId,
                        passengerId: currentPassenger._id,
                        userId: currentUserId,
                        name: currentPassenger.user?.name,
                        location,
                    });
                }
            },
            (error) => {
                console.error("Location error:", error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 15000,
            }
        );

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, [rideStarted, rideCompleted, isDriver, isPassenger, rideId]);

    useEffect(() => {
        if (!showChat || !chatUser) return;

        let inbox;

        Talk.ready.then(() => {
            const me = new Talk.User({
                id: currentUserId,
                name: currentUser.name || "RideMate User",
                email: currentUser.email,
            });

            const other = new Talk.User({
                id: getId(chatUser),
                name: chatUser.name || "RideMate User",
                email: chatUser.email,
            });

            const session = new Talk.Session({
                appId: TALKJS_APP_ID,
                me,
            });

            const conversationId = Talk.oneOnOneId(me, other);
            const conversation = session.getOrCreateConversation(conversationId);

            conversation.setParticipant(me);
            conversation.setParticipant(other);
            conversation.setAttributes({
                subject: isDriver ? "Passenger" : "Driver"
            });
            inbox = session.createInbox();
            inbox.select(conversation);
            inbox.mount(document.getElementById("talkjs-container"));

            talkSessionRef.current = session;
        });

        return () => {
            if (inbox) inbox.destroy();
            if (talkSessionRef.current) {
                talkSessionRef.current.destroy();
                talkSessionRef.current = null;
            }
        };
    }, [showChat, chatUser]);

    const startRide = async () => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem("token");

            const res = await axios.patch(
                `${API_BASE_URL}/ride/${rideId}/start`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setRide(res.data.ride);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to start ride");
        } finally {
            setIsSubmitting(false);
        }
    };

    const verifyPassengerOtp = async (passengerId) => {
        const otp = otpInputs[passengerId];

        if (!otp) {
            alert("Enter passenger OTP");
            return;
        }

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem("token");

            const res = await axios.patch(
                `${API_BASE_URL}/ride/${rideId}/passenger/${passengerId}/verify-otp`,
                { otp },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setRide(res.data.ride);
            setOtpInputs((prev) => ({ ...prev, [passengerId]: "" }));
        } catch (err) {
            alert(err.response?.data?.message || "Invalid OTP");
        } finally {
            setIsSubmitting(false);
        }
    };

    const completeRide = async () => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem("token");

            const res = await axios.patch(
                `${API_BASE_URL}/ride/${rideId}/complete`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setRide(res.data.ride);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to complete ride");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openChat = (user) => {
        setChatUser(user);
        setShowChat(true);
    };

    if (loading) return <div>Loading...</div>;
    if (!ride) return <div>Ride not found</div>;

    return (
        <div className="rides-container">
            <div className="ride-container">
                <div className="eta-box">
                    {isPassenger && liveDriverPosition && pickupPosition ? (
                        <>
                            <p>
                                Driver is <strong>{distance?.toFixed(1)} km</strong> away
                            </p>
                            <p>
                                Arriving in <strong>~{eta} min</strong>
                            </p>
                        </>
                    ) : isPassenger ? (
                        <p>Fetching driver location...</p>
                    ) : (
                        <h3>Ride in progress</h3>
                    )}
                </div>

                {isPassenger && currentPassenger?.otp && (
                    <div className="otp-container">
                        <p>
                            Share pin <br />
                            with Driver
                        </p>

                        {String(currentPassenger.otp)
                            .split("")
                            .map((digit, index) => (
                                <div key={index} className="otp-box">
                                    {digit}
                                </div>
                            ))}
                    </div>
                )}

                <div className="driver-card">
                    <div className="driver-face">
                        <img src={bikeImg} alt="vehicle" className="veh-img" />
                        <div className="driver-icon">
                            <FontAwesomeIcon
                                icon={faUserCheck}
                                style={{ width: "30px", height: "30px" }}
                            />
                        </div>
                        <p>{ride.driver?.name || "Driver"}</p>
                    </div>

                    <div className="veh-info">
                        <h2>{ride.vehicleNo}</h2>
                        <h3>{ride.driver?.email}</h3>
                    </div>
                </div>

                <div className="action">
                    {!isDriver && (
                        <button className="chat-btn" onClick={() => openChat(ride.driver)}>
                            <FontAwesomeIcon
                                icon={faCommentDots}
                                style={{ width: "20px", height: "20px" }}
                            />
                            <p>Message driver</p>
                        </button>
                    )}

                    {isDriver && !rideStarted && !rideCompleted && (
                        <button
                            className="chat-btn"
                            onClick={startRide}
                            disabled={isSubmitting}
                        >
                            <FontAwesomeIcon icon={faPlay} />
                            <p>Start Ride</p>
                        </button>
                    )}

                    {isDriver && rideStarted && !rideCompleted && (
                        <button
                            className="chat-btn"
                            onClick={completeRide}
                            disabled={isSubmitting}
                        >
                            <FontAwesomeIcon icon={faBan} />
                            <p>Complete Ride</p>
                        </button>
                    )}

                    <button className="call">
                        <FontAwesomeIcon
                            icon={faPhone}
                            style={{ width: "20px", height: "20px" }}
                        />
                    </button>
                </div>

                <div className="location-status">
                    <div className="binding">
                        <div className="binding-1">
                            <FontAwesomeIcon icon={faLocationCrosshairs} />
                            <p>{ride.from?.name}</p>
                        </div>

                        {!rideStarted && !rideCompleted && (
                            <div className="change-button">Change</div>
                        )}
                    </div>

                    <div className="line"></div>

                    <div className="binding">
                        <div className="binding-1">
                            <FontAwesomeIcon icon={faLocationCrosshairs} />
                            <p>{ride.to?.name}</p>
                        </div>

                        {!rideStarted && !rideCompleted && (
                            <div className="change-button">Change</div>
                        )}
                    </div>
                </div>

                <div className="some-options">
                    <div className="cou-sup2">
                        <FontAwesomeIcon icon={faUsers} className="icon-size" />
                        <p>Accepted passengers: {acceptedPassengers.length}</p>
                    </div>

                    <div className="cou-sup2">
                        <FontAwesomeIcon icon={faReceipt} className="icon-size" />
                        <p>Fare: ₹{ride.pricePerSeat}</p>
                    </div>

                    <div className="cou-sup2">
                        <FontAwesomeIcon icon={faCircleQuestion} className="icon-size" />
                        <p>{rideStarted ? "Live tracking active" : "Waiting to start"}</p>
                    </div>

                    <div className="cou-sup">
                        <FontAwesomeIcon icon={faReceipt} className="icon-size" />
                        <p>Coupon</p>
                    </div>

                    <div className="cou-sup">
                        <FontAwesomeIcon icon={faCircleQuestion} className="icon-size" />
                        <p>Support</p>
                    </div>

                    {!rideCompleted && (
                        <div className="cancel-ride">
                            <FontAwesomeIcon icon={faBan} className="icon-size" />
                            <p>Cancel Ride</p>
                        </div>
                    )}
                </div>

                {isDriver && (
                    <div className="passenger-panel">
                        <div className="passenger-panel-title">
                            <FontAwesomeIcon icon={faUsers} />
                            <h3>Passengers</h3>
                        </div>

                        {acceptedPassengers.length === 0 ? (
                            <p className="empty-passenger">No accepted passengers yet</p>
                        ) : (
                            acceptedPassengers.map((passenger) => (
                                <div className="passenger-verify-card" key={passenger._id}>
                                    <div className="passenger-main-info">
                                        <div className="passenger-avatar">
                                            {(passenger.user?.name || "P").charAt(0).toUpperCase()}
                                        </div>

                                        <div className="passenger-text">
                                            <strong>{passenger.user?.name || "Passenger"}</strong>
                                            <span>{passenger.user?.email}</span>
                                            <small>{passenger.from?.name}</small>
                                        </div>

                                        <button
                                            className="mini-icon-btn"
                                            onClick={() => openChat(passenger.user)}
                                        >
                                            <FontAwesomeIcon icon={faCommentDots} />
                                        </button>
                                    </div>

                                    <div className="otp-verify-box">
                                        <div className="otp-label">
                                            <FontAwesomeIcon icon={faKey} />
                                            <span>Pickup OTP</span>
                                        </div>

                                        {passenger.otpVerified ? (
                                            <div className="verified-pill">
                                                <FontAwesomeIcon icon={faCheck} />
                                                Verified
                                            </div>
                                        ) : (
                                            <div className="otp-action-row">
                                                <input
                                                    className="otp-input"
                                                    placeholder="Enter OTP"
                                                    value={otpInputs[passenger._id] || ""}
                                                    onChange={(e) =>
                                                        setOtpInputs((prev) => ({
                                                            ...prev,
                                                            [passenger._id]: e.target.value,
                                                        }))
                                                    }
                                                />

                                                <button
                                                    className="verify-btn"
                                                    disabled={!rideStarted || isSubmitting}
                                                    onClick={() => verifyPassengerOtp(passenger._id)}
                                                >
                                                    Verify
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div className="rides-right">
                <MapContainer center={mapCenter} zoom={13} className="map">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {pickupPosition && (
                        <Marker position={pickupPosition}>
                            <Popup>Source: {ride.from?.name}</Popup>
                        </Marker>
                    )}

                    {dropPosition && (
                        <Marker position={dropPosition}>
                            <Popup>Destination: {ride.to?.name}</Popup>
                        </Marker>
                    )}

                    {liveDriverPosition && (
                        <Marker position={liveDriverPosition}>
                            <Popup>Driver: {ride.driver?.name}</Popup>
                        </Marker>
                    )}

                    {isDriver &&
                        acceptedPassengers.map((passenger) => {
                            const passengerLocation =
                                passengerLocations[passenger._id] ||
                                passengerLocations[getId(passenger.user)];

                            const position =
                                toPosition(passengerLocation) || toPosition(passenger.from);

                            if (!position) return null;

                            return (
                                <Marker key={passenger._id} position={position}>
                                    <Popup>
                                        Passenger: {passenger.user?.name || "Passenger"}
                                    </Popup>
                                </Marker>
                            );
                        })}
                    {routeGeoJSON && (
                        <>
                            <GeoJSON
                                data={routeGeoJSON}
                                style={{
                                    color: "black",
                                    weight: 5,
                                }}
                            />
                            <FitRoute routeGeoJSON={routeGeoJSON} />
                        </>
                    )}
                </MapContainer>

                {showChat && (
                    <div className="chat-overlay">
                        <div className="chat-box">
                            <div
                                id="talkjs-container"
                                style={{ height: "100%", width: "100%" }}
                            ></div>

                            <button className="close-chat" onClick={() => setShowChat(false)}>
                                X
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RideDetails;

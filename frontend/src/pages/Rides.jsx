import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationCrosshairs, faCircleInfo, faBars, faUserPen } from "@fortawesome/free-solid-svg-icons";
import bikeImg from "../assets/images/bike.webp";
import scootyImg from "../assets/images/scooty2.png";
import carImg from "../assets/images/car1.png";
import createdImg from "/ride.jpg";
import bookedImg from "../assets/images/booked.png";
import "./Rides.css";

const Rides = () => {
    const [createdRides, setCreatedRides] = useState([]);
    const [bookedRides, setBookedRides] = useState([]);
    const [activeTab, setActiveTab] = useState("created");

    const fetchMyRides = async () => {
        const token = localStorage.getItem("token");

        const res = await axios.get(
            "http://localhost:8080/api/ride/my-rides",
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setCreatedRides(res.data);
        setBookedRides([]);
    };

    useEffect(() => {
        fetchMyRides();
    }, []);

    const deleteRide = async (id) => {
        const token = localStorage.getItem("token");

        await axios.delete(
            `http://localhost:8080/api/ride/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        fetchMyRides();
    };

    const getVehicleImage = (type) => {
        if (type === "bike") return bikeImg;
        if (type === "scooty") return scootyImg;
        if (type === "car") return carImg;
        return null;
    };

    const ridesToShow = activeTab === "created" ? createdRides : bookedRides;
    const rightImage = activeTab === "created" ? createdImg : bookedImg;
    return (
        <div className="rides-main">
            <div className="rides-left">
                <div className="top-bar">
                    <p><FontAwesomeIcon icon={faBars} className="menu-icon" /></p>
                    <div className="logo">
                        <div className="logo-img"></div>
                        <p>RIDEMATE</p>
                    </div>
                    <div className="user-icon"><FontAwesomeIcon icon={faUserPen} className="man" /></div>
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
                    </div>
                    {ridesToShow.length === 0 ? (
                        <p className="empty">No rides yet</p>
                    ) : (
                        ridesToShow.map((ride) => (
                            <div className="ride-card" key={ride._id}>
                                <div className="first-line">
                                    <p>{new Date(ride.date).toDateString()} • {ride.time}</p>
                                    <p>₹{ride.pricePerSeat}</p>
                                </div>

                                <div className="location">
                                    <p>
                                        <FontAwesomeIcon icon={faLocationCrosshairs} style={{ color: "red" }} />
                                        {" "}{ride.from.name}
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationCrosshairs} style={{ color: "green" }} />
                                        {" "}{ride.to.name}
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
                                    </div>

                                    <div className="driver-img"></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="rides-right">
                <img src={rightImage} alt="ride visual" className="right-img" />
                <div className="overlay">
                    <p>
                        {activeTab === "created"
                            ? "Share rides. Save money. Travel smart."
                            : "Find rides. Travel together. Save more."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Rides;
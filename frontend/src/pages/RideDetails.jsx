import React, { useState, useEffect } from "react";
import { mockRideData } from "../data/mockData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck, faCommentDots, faPhone, faLocationCrosshairs, faReceipt, faCircleQuestion, faBan } from "@fortawesome/free-solid-svg-icons";
import bikeImg from "../assets/images/bike.webp";
import "./RideDetails.css";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getDistance } from "geolib";
import Talk from "talkjs";
const RideDetails = () => {
    const [ride, setRide] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [showChat, setShowChat] = useState(false);
    const passenger = {
        latitude: 30.3165,
        longitude: 78.0322
    };

    const driver = {
        latitude: 30.3215,
        longitude: 78.0422
    };
    const distance = getDistance(passenger, driver) / 1000;
    useEffect(() => {
        setTimeout(() => {
            setRide(mockRideData);
        }, 500);
    }, []);

    useEffect(() => {
        if (!showChat) return;

        Talk.ready.then(() => {

            const me = new Talk.User({
                id: "rider_1",
                name: "Rider",
            });

            const driverUser = new Talk.User({
                id: "driver_1",
                name: ride.driver.name,
            });

            const session = new Talk.Session({
                appId: "tBo34UsG",
                me: me,
            });

            const conversation = session.getOrCreateConversation("ride_" + ride.otp);

            conversation.setParticipant(me);
            conversation.setParticipant(driverUser);

            const inbox = session.createInbox();
            inbox.select(conversation);

            inbox.mount(document.getElementById("talkjs-container"));
        });

    }, [showChat]);

    if (!ride) return <div>Loading...</div>;

    return (
        <div className="rides-container">
            <div className="ride-container">
                <div className="eta-box">
                    <h2>Pickup arriving in {ride.eta}</h2>
                    <h3>Driver is {distance.toFixed(1)} km away</h3>
                </div>
                <div className="otp-container">
                    <p>Share pin <br />with Driver</p>
                    {ride.otp.split("").map((digit, index) => (
                        <div key={index} className="otp-box">
                            {digit}
                        </div>
                    ))}
                </div>
                <div className="driver-card">
                    <div className="driver-face">
                        <img
                            src={bikeImg}
                            alt="car"
                            className="veh-img" />
                        <div className="driver-icon"><FontAwesomeIcon icon={faUserCheck} style={{ width: "30px", height: "30px" }} /></div>
                        <p>{ride.driver.name}</p>
                    </div>
                    <div className="veh-info">
                        <h2>{ride.vehicle.number}</h2>
                        <h3>{ride.vehicle.name}</h3>
                    </div>
                </div>
                <div className="action">
                    <button className="chat-btn" onClick={() => setShowChat(true)}>
                        <FontAwesomeIcon icon={faCommentDots} style={{ width: "20px", height: "20px" }} />
                        <p>Send a message...</p>
                    </button>
                    <button className="call">
                        <FontAwesomeIcon icon={faPhone} style={{ width: "20px", height: "20px" }} />
                    </button>
                </div>
                <div className="location-status">
                    <div className="binding">
                        <div className="binding-1">
                            <FontAwesomeIcon icon={faLocationCrosshairs} />
                            <p>{ride.pickup}</p>
                        </div>
                        <div className="change-button">Change</div>
                    </div>
                    <div className="line"></div>
                    <div className="binding">
                        <div className="binding-1">
                            <FontAwesomeIcon icon={faLocationCrosshairs} />
                            <p>{ride.drop}</p>
                        </div>
                        <div className="change-button">Change</div>
                    </div>
                </div>
                <div className="some-options">
                    <div className="cou-sup">
                        <FontAwesomeIcon icon={faReceipt} className="icon-size" />
                        <p>Coupon</p>
                    </div>
                    <div className="cou-sup">
                        <FontAwesomeIcon icon={faCircleQuestion} className="icon-size" />
                        <p>Support</p>
                    </div>
                    <div className="cancel-ride">
                        <FontAwesomeIcon icon={faBan} className="icon-size" />
                        <p>Cancel Ride</p>
                    </div>
                </div>
            </div>
            <div className="rides-right">
                <MapContainer center={[30.3165, 78.0322]} zoom={13} className="map">

                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Passenger Marker */}
                    <Marker position={[30.3165, 78.0322]}>
                        <Popup>Passenger Location</Popup>
                    </Marker>

                    {/* Driver Marker */}
                    <Marker position={[30.3215, 78.0422]}>
                        <Popup>Driver Location</Popup>
                    </Marker>

                    {/* Route Line */}
                    <Polyline
                        positions={[
                            [30.3165, 78.0322],
                            [30.3215, 78.0422]
                        ]}
                        color="black"
                    />
                </MapContainer>
                {showChat && (
                    <div className="chat-overlay">
                        <div className="chat-box">
                            <div id="talkjs-container" style={{ height: "100%", width: "100%" }}></div>
                            <button className="close-chat" onClick={() => setShowChat(false)}>X</button>
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
};

export default RideDetails;
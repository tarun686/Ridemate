import { useState } from "react";
import { Link } from "react-router-dom";
import "./dashnavbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUser,faClock, faGear, faRightFromBracket,faStar,faCircleInfo,faWallet, faChartLine } from "@fortawesome/free-solid-svg-icons";

export default function DashNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="ride-navbar">
      <div className="left">
        <Link to="/" className="ride-logo">RideMate</Link>
      </div>
      <div className="ride-right">
        <button className="activity-btn"><FontAwesomeIcon icon={faBars} className="nav-icon" />Activity</button>

        <div className="profile-box" onClick={() => setOpen(!open)}>
          <div className="profile-circle"><FontAwesomeIcon icon={faUser} /></div>
          <svg
            className={`dropdown-icon ${open ? "rotate" : ""}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path d="M7 10l5 5 5-5z" fill="white" />
          </svg>
          {open && (
            <div className="ride-dropdown">
              <div className="ride-user">
                <div>
                  <h2>Muskan Ahuja</h2>
                  <div className="rating"><span><FontAwesomeIcon icon={faStar} />  5</span></div>
                </div>
                <div className="avatar-circle">
                  <FontAwesomeIcon icon={faUser} />
                </div>
              </div>
              <div className="ride-panels">
                <div className="one"><FontAwesomeIcon icon={faCircleInfo} className="icon-one"/>Help</div>
                <div className="one"><FontAwesomeIcon icon={faWallet} className="icon-one"/>Wallet</div>
                <div className="one"><FontAwesomeIcon icon={faChartLine} className="icon-one"/>Activity</div>
              </div>
              <div className="rideline"></div>
              <div className="ride-menu">
                <div className="ride-item">
                  <FontAwesomeIcon icon={faUser} />
                  <span>Profile</span>
                </div>

                <div className="ride-item">
                  <FontAwesomeIcon icon={faClock} />
                  <span>Your rides</span>
                </div>

                <div className="ride-item">
                  <FontAwesomeIcon icon={faGear} />
                  <span>Settings</span>
                </div>

                <div className="ride-item logout">
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  <span>Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

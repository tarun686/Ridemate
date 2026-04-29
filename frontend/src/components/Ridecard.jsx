import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationCrosshairs,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

const RideCard = ({
  ride,
  showDelete = false,
  onDelete,
  getVehicleImage,
  onClick,
}) => {
  return (
    <div
      className={`ride-card ${onClick ? "clickable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="first-line">
        <p>
          {new Date(ride.dateTime).toDateString()} •{" "}
          {new Date(ride.dateTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p>₹{ride.pricePerSeat}</p>
      </div>

      <div className="location">
        <p>
          <FontAwesomeIcon icon={faLocationCrosshairs} style={{ color: "red" }} />{" "}
          {ride.from.name}
        </p>
        <p>
          <FontAwesomeIcon icon={faLocationCrosshairs} style={{ color: "green" }} />{" "}
          {ride.to.name}
        </p>
      </div>

      <div className="actions">
        <div className="delete-info">
          {showDelete && (
            <button
              className="danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(ride._id);
              }}
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
  );
};

export default RideCard;

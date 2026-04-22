import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  from: {
    name: { type: String, required: true },
    lat: Number,
    lng: Number
  },

  to: {
    name: { type: String, required: true },
    lat: Number,
    lng: Number
  },

  // 🔥 IMPORTANT: combine date + time
  dateTime: {
    type: Date,
    required: true
  },

  availableSeats: {
    type: Number,
    required: true
  },

  pricePerSeat: {
    type: Number,
    required: true
  },

  vehicle: {
    type: String,
    required: true,
  },
  
  vehicleNo: {
    type: String,
    required: true,
  },
  

  // 🧠 route for matching algorithm
  route: [
    {
      lat: Number,
      lng: Number
    }
  ],

  // 👥 accepted passengers
  passengers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      from: {
        lat: Number,
        lng: Number,
        name: String,
      },
      to: {
        lat: Number,
        lng: Number,
        name: String,
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      requestedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  
  // 🚦 ride status
  status: {
    type: String,
    enum: ["active", "full", "expired"],
    default: "active"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Ride", rideSchema);

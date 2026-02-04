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

  date: {
    type: Date,
    required: true
  },

  time: {
    type: String,
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

  vehicle: String,
  notes: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Ride", rideSchema);

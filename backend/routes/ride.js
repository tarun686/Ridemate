import express from "express";
import Ride from "../models/Ride.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Route to create a new ride
router.post("/create", auth, async (req, res) => {
  try {
    const ride = new Ride({
      ...req.body,
      driver: req.user.id,
    });

    await ride.save();
    res.status(201).json({ message: "Ride created successfully" });
  } catch {
    res.status(500).json({ message: "Failed to create ride" });
  }
});

// Route to get rides created by the logged-in user
router.get("/my-rides", auth, async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user.id });
    res.json(rides);
  } catch {
    res.status(500).json({ message: "Failed to fetch rides" });
  }
});

// Route to delete a ride created by the logged-in user
router.delete("/:id", auth, async (req, res) => {
  await Ride.findOneAndDelete({
    _id: req.params.id,
    driver: req.user.id,
  });
  res.json({ message: "Ride deleted" });
});

// Route to update a ride created by the logged-in user
router.put("/:id", auth, async (req, res) => {
  const updatedRide = await Ride.findOneAndUpdate(
    { _id: req.params.id, driver: req.user.id },
    req.body,
    { new: true }
  );
  res.json(updatedRide);
});


//Route to get rides where user is a passenger with accepted status
router.get("/booked-rides", auth, async (req, res) => {
  try {
    const rides = await Ride.find({
      passengers: {
        $elemMatch: {
          user: req.user.id,
          status: "accepted",
        },
      },
    })
      .populate("driver", "name email")
      .sort({ dateTime: 1 });

    res.json(rides);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch booked rides" });
  }
});



// Haversine formula to calculate distance between two lat/lng points in kilometers
const getDistanceKm = (pointA, pointB) => {
  const earthRadiusKm = 6371;

  const dLat = ((pointB.lat - pointA.lat) * Math.PI) / 180;
  const dLng = ((pointB.lng - pointA.lng) * Math.PI) / 180;

  const lat1 = (pointA.lat * Math.PI) / 180;
  const lat2 = (pointB.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Search rides based on pickup/drop proximity and date/time
router.get("/search", auth, async (req, res) => {
  try {
    const { fromLat, fromLng, toLat, toLng, radiusKm = 3 } = req.query;

    if (!fromLat || !fromLng || !toLat || !toLng) {
      return res.status(400).json({ message: "Pickup and drop coordinates are required" });
    }

    const pickup = {
      lat: Number(fromLat),
      lng: Number(fromLng),
    };

    const drop = {
      lat: Number(toLat),
      lng: Number(toLng),
    };

    const radius = Number(radiusKm);
    const now = new Date();

    const rides = await Ride.find({
      dateTime: { $gte: now },
      status: "active",
      availableSeats: { $gt: 0 },

      // Optional: hide rides created by current user
      // driver: { $ne: req.user.id },
    })
      .sort({ dateTime: 1 })
      .lean();

    const matchedRides = rides
      .map((ride) => {
        const pickupDistanceKm = getDistanceKm(pickup, {
          lat: Number(ride.from.lat),
          lng: Number(ride.from.lng),
        });

        const dropDistanceKm = getDistanceKm(drop, {
          lat: Number(ride.to.lat),
          lng: Number(ride.to.lng),
        });

        return {
          ...ride,
          pickupDistanceKm,
          dropDistanceKm,
        };
      })
      .filter(
        (ride) =>
          ride.pickupDistanceKm <= radius &&
          ride.dropDistanceKm <= radius
      );

    res.json(matchedRides);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Search failed" });
  }
});

// Route to request a ride by adding user to passengers array with pending status
router.post("/:id/request", auth, async (req, res) => {
  try {
    const { from, to } = req.body;

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot request your own ride" });
    }

    if (ride.status !== "active") {
      return res.status(400).json({ message: "This ride is not active" });
    }

    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    const alreadyRequested = ride.passengers.some(
      (passenger) => passenger.user.toString() === req.user.id
    );

    if (alreadyRequested) {
      return res.status(400).json({ message: "You already requested this ride" });
    }

    ride.passengers.push({
      user: req.user.id,
      from,
      to,
      status: "pending",
    });

    await ride.save();

    res.json({ message: "Ride request sent to driver" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to request ride" });
  }
});

// Route for driver to view pending ride requests
router.get("/requests", auth, async (req, res) => {
  try {
    const rides = await Ride.find({
      driver: req.user.id,
      "passengers.status": "pending",
    })
      .populate("passengers.user", "name email")
      .sort({ dateTime: 1 });

    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ride requests" });
  }
});

// Route for driver to accept a ride request by updating passenger status to accepted and reducing available seats
router.patch("/:rideId/request/:passengerId/accept", auth, async (req, res) => {
  try {
    const { rideId, passengerId } = req.params;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to accept this request" });
    }

    const passengerRequest = ride.passengers.id(passengerId);

    if (!passengerRequest) {
      return res.status(404).json({ message: "Passenger request not found" });
    }

    if (passengerRequest.status !== "pending") {
      return res.status(400).json({ message: "This request is already handled" });
    }

    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    passengerRequest.status = "accepted";
    passengerRequest.otp = Math.floor(1000 + Math.random() * 9000).toString();
    passengerRequest.otpVerified = false;

    ride.availableSeats -= 1;

    if (ride.availableSeats === 0) {
      ride.status = "full";
    }

    await ride.save();
    req.io.to(passengerRequest.user.toString()).emit("ride-request-accepted", {
      rideId: ride._id,
      message: "Your ride request was accepted",
    });
    
    res.json({
      message: "Ride request accepted",
      ride,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to accept request" });
  }
});

// Route for driver to reject a ride request by updating passenger status to rejected
router.patch("/:rideId/request/:passengerId/reject", auth, async (req, res) => {
  try {
    const { rideId, passengerId } = req.params;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to reject this request" });
    }

    const passengerRequest = ride.passengers.id(passengerId);

    if (!passengerRequest) {
      return res.status(404).json({ message: "Passenger request not found" });
    }

    if (passengerRequest.status !== "pending") {
      return res.status(400).json({ message: "This request is already handled" });
    }

    passengerRequest.status = "rejected";

    await ride.save();

    req.io.to(passengerRequest.user.toString()).emit("ride-request-rejected", {
      rideId: ride._id,
      message: "Your ride request was rejected",
    });
    
    res.json({
      message: "Ride request rejected",
      ride,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to reject request" });
  }
});


router.get("/:rideId/details", auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate("driver", "name email phone")
      .populate("passengers.user", "name email phone");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    const isDriver = ride.driver._id.toString() === req.user.id;

    const isPassenger = ride.passengers.some(
      (p) =>
        p.user?._id?.toString() === req.user.id &&
        p.status === "accepted"
    );

    if (!isDriver && !isPassenger) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const rideObj = ride.toObject();

    rideObj.passengers = rideObj.passengers.map((p) => {
      const isCurrentPassenger = p.user?._id?.toString() === req.user.id;

      return {
        ...p,
        otp: isCurrentPassenger ? p.otp : undefined,
      };
    });

    res.json(rideObj);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ride details" });
  }
});

router.patch("/:rideId/start", auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only driver can start ride" });
    }

    ride.status = "driver_started";
    ride.startedAt = new Date();

    await ride.save();

    req.io.to(`ride_${ride._id}`).emit("ride:started", {
      rideId: ride._id.toString(),
    });

    res.json({ message: "Ride started", ride });
  } catch (err) {
    res.status(500).json({ message: "Failed to start ride" });
  }
});


router.patch("/:rideId/passenger/:passengerId/verify-otp", auth, async (req, res) => {
  try {
    const { rideId, passengerId } = req.params;
    const { otp } = req.body;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only driver can verify OTP" });
    }

    const passenger = ride.passengers.id(passengerId);

    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }

    if (passenger.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    passenger.otpVerified = true;
    passenger.pickupConfirmedAt = new Date();
    ride.status = "in_progress";

    await ride.save();

    req.io.to(`ride_${ride._id}`).emit("ride:passenger-otp-verified", {
      rideId: ride._id.toString(),
      passengerId,
      status: ride.status,
    });

    res.json({ message: "OTP verified", ride });
  } catch (err) {
    res.status(500).json({ message: "Failed to verify OTP" });
  }
});

router.patch("/:rideId/complete", auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only driver can complete ride" });
    }

    ride.status = "completed";
    ride.completedAt = new Date();

    await ride.save();

    req.io.to(`ride_${ride._id}`).emit("ride:completed", {
      rideId: ride._id.toString(),
    });

    res.json({ message: "Ride completed", ride });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete ride" });
  }
});

export default router;
import express from "express";
import Ride from "../models/Ride.js";
import auth from "../middleware/auth.js";

const router = express.Router();

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


router.get("/my-rides", auth, async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user.id });
    res.json(rides);
  } catch {
    res.status(500).json({ message: "Failed to fetch rides" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  await Ride.findOneAndDelete({
    _id: req.params.id,
    driver: req.user.id,
  });
  res.json({ message: "Ride deleted" });
});

router.put("/:id", auth, async (req, res) => {
  const updatedRide = await Ride.findOneAndUpdate(
    { _id: req.params.id, driver: req.user.id },
    req.body,
    { new: true }
  );
  res.json(updatedRide);
});

export default router;

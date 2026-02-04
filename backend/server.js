import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import rideRoutes from "./routes/ride.js";
dotenv.config();
connectDB();

//initialize express app for handling routes and requests
const app = express();

//middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cors());
app.use(express.json());

//path routes
app.use("/api/auth", authRoutes);
app.use("/api/ride", rideRoutes);

//testing the route 
app.get("/", (req, res) => {
  res.send("RideMate Backend Running");
});


//server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
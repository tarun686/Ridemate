import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import rideRoutes from "./routes/ride.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

io.on("connection", (socket) => {
  socket.on("join-ride-room", ({ rideId }) => {
    socket.join(`ride_${rideId}`);
  });

  socket.on("leave-ride-room", ({ rideId }) => {
    socket.leave(`ride_${rideId}`);
  });

  socket.on("driver-location:send", ({ rideId, driverId, location }) => {
    io.to(`ride_${rideId}`).emit("driver-location:update", {
      rideId,
      driverId,
      location,
    });
  });

  socket.on("passenger-location:send", ({ rideId, passengerId, userId, name, location }) => {
    io.to(`ride_${rideId}`).emit("passenger-location:update", {
      rideId,
      passengerId,
      userId,
      name,
      location,
    });
  });
});


// Makes io available inside routes as req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/ride", rideRoutes);

app.get("/", (req, res) => {
  res.send("RideMate Backend Running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);

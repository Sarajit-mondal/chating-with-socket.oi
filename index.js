// Load environment variables and dependencies
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./server/config/connectDB.js");
const { app, server } = require("./server/socket/index");
const User = require("./server/models/userSchema.js");

// Connect to the database
connectDB();

// Configure CORS with conditional environments
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://chat-vibe-ashy.vercel.app"]
    : ["http://localhost:3000", "http://localhost:3001"];

// Configure CORS for production and development
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware for parsing JSON requests
app.use(express.json());

// Basic route for testing server setup
app.get("/", (req, res) => {
  res.send("Socket.IO Server is running");
});

// Define an API endpoint to fetch a user by ID
app.get("/api/user", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "ID parameter is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unknown error" });
  }
});

// Start the server
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Socket.IO server is running on http://localhost:${port}`);
});

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./server/config/connectDB.js");
const { app, server } = require("./server/socket/index");
const User = require("./server/models/userSchema.js");

// Create an Express app
// const app = express();
app.use(
  cors({
    origin: [
      "https://chat-vibe-ashy.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://chatvibe-s8eu.onrender.com",
      "*",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Serve a basic endpoint for testing
app.get("/", (req, res) => {
  res.send("Socket.IO Server is running");
});

// connectDB
connectDB();

// Define a GET API endpoint to fetch a user by ID
app.get("/api/user", async (req, res) => {
  try {
    const { id } = req.query; // Retrieve the ID from the query parameters

    if (!id) {
      return res.status(400).json({ message: "ID parameter is required" });
    }

    // Find the user by ID
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
  console.log(`Socket.IO server is running on port http://localhost:${PORT}`);
});

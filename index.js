const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./server/config/connectDB.js");
const { app, server } = require("./server/socket/index");

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

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Socket.IO server is running on port http://localhost:${PORT}`);
});

// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/connectDB");
// Create an Express app
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "*"],
    credentials: true,
  })
);

const server = http.createServer(app);

// Create a Socket.IO instance and bind it to the server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "*"], // You can specify allowed origins here for CORS
    methods: ["GET", "POST"],
  },
});

// Serve a basic endpoint for testing
app.get("/", (req, res) => {
  res.send("Socket.IO Server is running");
});

// Handle connection and events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for a custom event
  socket.on("message", (data) => {
    console.log("Message received:", data);
    // Send a message to the client
    socket.emit("message", `${data}`);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// connectDB
connectDB();

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Socket.IO server is running on port http://localhost:${PORT}`);
});

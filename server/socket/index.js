const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();

// socket connection
const server = http.createServer(app);

// Create a Socket.IO instance and bind it to the server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "*"], // You can specify allowed origins here for CORS
    methods: ["GET", "POST"],
  },
});

// Handle connection and events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  const user = socket.handshake.auth.user;
  console.log(user);

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

module.exports = {
  server,
  app,
};

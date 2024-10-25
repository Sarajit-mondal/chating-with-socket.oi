const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const {
  ConversationModel,
  MessageModel,
} = require("../models/ConversationModel");
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

const onlineUser = new Set();

// Handle connection and events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  const user = socket.handshake.auth.user;

  // create a room and join room 
  socket.join(user);
  onlineUser.add(user?.toString());

  io.emit("onlineUser", Array.from(onlineUser));

  // Listen for a new message event
  socket.on("new message", async (data) => {
    // Find if conversation exists between sender and receiver
    let conversation = await ConversationModel.findOne({
      $or: [
        { sender: data?.sender, reciver: data?.reciver },
        { sender: data?.reciver, reciver: data?.sender },
      ],
    });

    // If conversation doesn't exist, create one
    if (!conversation) {
      const createConversation = new ConversationModel({
        sender: data?.sender,
        reciver: data?.reciver,
      });
      conversation = await createConversation.save();
    }

    // Save the message to the database
    const message = new MessageModel({
      text: data?.text,
      imageUrl: data?.imageUrl,
      videoUrl: data?.videoUrl,
      msgByUserId: data?.msgByUserId,
    });
    const savedMessage = await message.save();

    // Update conversation with the new message
    await ConversationModel.updateOne(
      { _id: conversation._id },
      {
        $push: { messages: savedMessage?._id },
      }
    );

    // Fetch updated conversation with populated messages
    const updatedConversationSender = await ConversationModel.findOne({
      $or: [
        { sender: data?.sender, reciver: data?.reciver },
        { sender: data?.reciver, reciver: data?.sender },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });

    // Emit updated conversation data to both sender and receiver
    io.to(data?.sender).emit("getMessage", updatedConversationSender);
    io.to(data.reciver).emit("getMessage", updatedConversationSender);
  });

  // convarsection

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

module.exports = {
  server,
  app,
};
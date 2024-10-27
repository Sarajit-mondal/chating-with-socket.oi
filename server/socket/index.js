const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const {
  ConversationModel,
  MessageModel,
} = require("../models/ConversationModel");
const app = express();
const User = require("../models/userSchema");

// socket connection
const server = http.createServer(app);

// Create a Socket.IO instance and bind it to the server
const io = new Server(server, {
  cors: {
    origin: ["https://chat-vibe-ashy.vercel.app","https://chatvibe-s8eu.onrender.com", "http://localhost:3001", "http://localhost:3001", "*"], // You can specify allowed origins here for CORS
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

  // send all user and reciver messagess
  socket.on("message Page", async (data) => {
    if (data?.sender && data?.reciver) {
      const messagesUsersAndReciver = await ConversationModel.findOne({
        $or: [
          { sender: data?.sender, reciver: data?.reciver },
          { sender: data?.reciver, reciver: data?.sender },
        ],
      })
        .populate("messages")
        .sort({ updatedAt: -1 });

      socket.emit("getMessage", messagesUsersAndReciver);
    }
  });
  // send all user and reciver messagess

  // Listen for a new message event
  socket.on("new message", async (data) => {
    // Find if conversation exists between sender and reciver
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

    // Emit updated conversation data to both sender and reciver
    io.to(data?.sender).emit("getMessage", updatedConversationSender);
    io.to(data.reciver).emit("getMessage", updatedConversationSender);
  });

  // send current Users conversation into sidebar
  socket.on("sidebar", async (conversationId) => {
    if (conversationId) {
      try {
        // Retrieve the conversations for the current user
        const currentUserConversation = await ConversationModel.find({
          $or: [{ sender: conversationId }, { reciver: conversationId }],
        })
          .sort({ updatedAt: -1 })
          .populate("sender")
          .populate("reciver") // Typo corrected from "reciver" to "reciver"
          .populate("messages");

        // Map conversations to the desired structure
        const conversation = currentUserConversation.map((conv) => {
          const unseenMsgCount =
            conv.messages?.reduce(
              (prev, curr) => prev + (curr.seen ? 0 : 1),
              0
            ) || 0;

          return {
            _id: conv._id,
            sender: conv?.sender,
            reciver: conv?.reciver,
            unseenMsg: unseenMsgCount,
            lastMsg: conv.messages?.[conv.messages.length - 1] || null,
          };
        });

        // Emit the mapped conversation data back to the client
        socket.emit("conversation", conversation);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        socket.emit("error", "An error occurred while fetching conversations.");
      }
    }
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

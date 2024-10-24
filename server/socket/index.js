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

// Handle connection and events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  // const user = socket.handshake.auth.user;

  // convarsection
  // socket.on("new message", async (data) => {
  //   // check conversation is available both user
  //   let conversation = await ConversationModel.findOne({
  //     $or: [
  //       { sender: data?.sender, reciver: data?.reciver },
  //       { sender: data?.reciver, reciver: data?.sender },
  //     ],
  //   });
  //   // conversation is not available
  //   if (!conversation) {
  //     const createConversation = await ConversationModel({
  //       sender: data?.sender,
  //       reciver: data.reciver,
  //     });
  //     conversation = await createConversation.save();
  //   }
  //   const message = new MessageModel({
  //     text: data?.text,
  //     imageUrl: data.imageUrl,
  //     videoUrl: data?.videoUrl,
  //     msgByUserId: data?.msgByUserId,
  //   });
  //   const saveMessage = await message.save();

  //   const updateConversation = await ConversationModel.updateOne(
  //     { _id: conversation._id },
  //     {
  //       $push: { messages: saveMessage?._id },
  //     }
  //   );

  //   const getConversationMessage = await ConversationModel.findOne({
  //     $or: [
  //       { sender: data?.sender, reciver: data?.reciver },
  //       { sender: data?.reciver, reciver: data?.sender },
  //     ],
  //   })
  //     .populate("messages")
  //     .sort({ updatedAt: -1 });

  //   io.to(data?.reciver).emit("sendMessage", getConversationMessage);
  //   // io.to(data?.reciver).emit("message", getConversationMessage);

  //   console.log(getConversationMessage);
  // });
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
    // // reciver message message
    // await ConversationModel.updateOne(
    //   { _id: conversation._id },
    //   {
    //     $push: { messages: savedMessage?._id },
    //   }
    // );

    // Fetch updated conversation with populated messages
    const updatedConversation = await ConversationModel.findOne({
      $or: [
        { sender: data?.sender, reciver: data?.reciver },
        { sender: data?.reciver, reciver: data?.sender },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });

    // Emit updated conversation data to both sender and receiver
    io.emit("getMessage", updatedConversation);
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

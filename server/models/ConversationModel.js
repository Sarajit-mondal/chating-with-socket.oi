const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    msgByUserId: {
      type: mongoose.Schema.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);
// conversationSehema
const conversationSehema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      return: true,
      ref: 'User',
    },
    reciver: {
      type: mongoose.Schema.ObjectId,
      return: true,
      ref: 'User',
    },
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);
const MessageModel = mongoose.model("Message", messageSchema);
const ConversationModel = mongoose.model("Conversation", conversationSehema);

module.exports = {
  MessageModel,
  ConversationModel,
};

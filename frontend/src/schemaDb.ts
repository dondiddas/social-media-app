
import mongoose from "mongoose";


const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  image: { type: String, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [

  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);


const notificationSchema = new mongoose.Schema({
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["like", "comment", "follow"],
    required: true,
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  message: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);





const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);


const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // List of posts in the feed
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feed", feedSchema);

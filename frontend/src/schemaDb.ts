import mongoose from "mongoose";

// --- Post Schema ---
const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  image: { type: String, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [],
  createdAt: { type: Date, default: Date.now },
});

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

// --- Notification Schema ---
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

export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

// --- Message Schema ---
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

// --- Feed Schema ---
const feedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  lastUpdated: { type: Date, default: Date.now },
});

export const Feed = mongoose.models.Feed || mongoose.model("Feed", feedSchema);

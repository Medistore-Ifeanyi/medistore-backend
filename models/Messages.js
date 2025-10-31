const mongoose = require("mongoose");



const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true }, // e.g. user._id or a generated id for group convos
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null if sent to "admins" group
  text: { type: String, default: "" },
  isRead: { type: Boolean, default: false },
  metadata: { type: Object }, // optional, e.g., { type: 'prescription', imageUrl: '...' }
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Message", messageSchema);
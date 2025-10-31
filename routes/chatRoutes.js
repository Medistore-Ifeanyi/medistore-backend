const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getConversationMessages, listConversations } = require("../controller/chatController");


const router = express.Router();
// GET messages for a conversation (user or admin)
router.get("/messages/:conversationId", protect, getConversationMessages);


// Admin only: list all conversations
router.get("/conversations", protect, adminOnly, listConversations);



module.exports = router;
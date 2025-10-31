const Message = require("../models/Messages");
const User = require("../models/User");


// fetch conversation messages by conversationId (e.g. user._id)
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();
    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// list all active conversations (for admin)
const listConversations = async (req, res) => {
  try {
    // Find distinct conversation ids and latest message
    const pipeline = [
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ];
    const convs = await Message.aggregate(pipeline);
    // Optionally attach user info
    const withUser = await Promise.all(
      convs.map(async (c) => {
        const user = await User.findById(c._id).select("name email");
        return {
          conversationId: c._id,
          lastMessage: c.lastMessage,
          unreadCount: c.unreadCount,
          user,
        };
      })
    );
    return res.json(withUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list conversations" });
  }
};


module.exports = {
  getConversationMessages,
  listConversations,
};
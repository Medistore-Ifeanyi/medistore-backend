
// require("dotenv").config()
// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/db");
// const authRoutes = require("./routes/authRoutes");
// const orderRoutes = require('./routes/orderRoutes')
// const productRoutes = require("./routes/productRoutes");
// const prescriptionRoutes = require("./routes/prescriptionRoute");


// //inapp chat
// const socketio = require("socket.io");
// const http = require('http')
// const Message = require('./models/Messages')
// const mongoose = require('mongoose')
// const User = require('./models/User')
// const jwt = require('jsonwebtoken')


// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB
// connectDB();

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/orders", orderRoutes)
// app.use("/api/products", productRoutes);
// app.use("/api/prescriptions", prescriptionRoutes);

// // Default Route
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });


// const server = http.createServer(app);
// const io = socketio(server, {
//   cors: {
//     origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
//   pingInterval: 25000,
//   pingTimeout: 60000,
// });

// // Middleware for socket auth using JWT
// io.use(async (socket, next) => {
//   try {
//     const token = socket.handshake.auth?.token;
//     if (!token) return next(new Error("Authentication error: no token"));
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) return next(new Error("Authentication error: user not found"));
//     socket.user = user; // attach user to socket
//     next();
//   } catch (err) {
//     console.error("Socket auth error:", err.message);
//     next(new Error("Authentication error"));
//   }
// });

// // Namespaces or single io - single io used here
// io.on("connection", (socket) => {
//   const user = socket.user;
//   console.log(`Socket connected: ${user.email} (${user._id})`);
//   // Join personal room so server can push messages to this user
//   const personalRoom = `user_${user._id}`;
//   socket.join(personalRoom);
//   // If user is admin, also join admin broadcast room
//   if (user.role === "admin") {
//     socket.join("admins");
//   }
//   // Optional: a user could also join a "conversation" room (for repeated sessions)
//   // We'll assume conversationId === user._id for 1:1 chats
//   const convRoom = `conv_${user._id}`;
//   socket.join(convRoom);
//   // Send unread count on connect (quick summary)
//   socket.on("get_unread_count", async () => {
//     try {
//       const count = await Message.countDocuments({ to: user._id, isRead: false });
//       socket.emit("unread_count", { count });
//     } catch (err) {
//       console.error(err);
//     }
//   });
//   // Typing indicator
//   socket.on("typing", ({ conversationId, isTyping }) => {
//     // Broadcast to other participants in room
//     socket.to(`conv_${conversationId}`).emit("typing", {
//       conversationId,
//       userId: user._id,
//       isTyping,
//     });
//   });
//   // Send private message
//   socket.on("private_message", async ({ conversationId, toUserId, text, metadata }) => {
//     try {
//       // sanitize/validate
//       const sanitizedText = (text || "").toString().slice(0, 2000); // basic safeguard
//       const message = new Message({
//         conversationId,
//         from: user._id,
//         to: toUserId || null,
//         text: sanitizedText,
//         metadata: metadata || null,
//       });
//       await message.save();
//       // Emit message to conversation room
//       const room = `conv_${conversationId}`;
//       io.to(room).emit("message", {
//         _id: message._id,
//         conversationId,
//         from: user._id,
//         to: toUserId || null,
//         text: sanitizedText,
//         metadata: message.metadata,
//         createdAt: message.createdAt,
//       });
//       // Notify admins if message from user and toUserId == null (or explicit)
//       if (user.role !== "admin") {
//         io.to("admins").emit("new_user_message", {
//           conversationId,
//           from: { _id: user._id, name: user.name, email: user.email },
//           text: sanitizedText,
//           createdAt: message.createdAt,
//         });
//       }
//     } catch (err) {
//       console.error("Error saving/sending message:", err);
//       socket.emit("error_message", { message: "Failed to send message" });
//     }
//   });
//   // Mark messages read
//   socket.on("mark_read", async ({ conversationId }) => {
//     try {
//       await Message.updateMany({ conversationId, to: user._id, isRead: false }, { isRead: true });
//       // Optionally notify sender
//     } catch (err) {
//       console.error(err);
//     }
//   });
//   socket.on("disconnect", (reason) => {
//     console.log(`Socket disconnected: ${user.email} (${user._id})`, reason);
//   });
// });

// // Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const socketio = require("socket.io");
const connectDB = require("./config/db");
// Models
const Message = require("./models/Messages");
const User = require("./models/User");
// Routes
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoute");
const chatRoutes = require("./routes/chatRoutes")
const app = express();
const server = http.createServer(app);



// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());



// --- CONNECT DATABASE ---
connectDB();


// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/chat", chatRoutes )



// --- ROOT ---

app.get("/", (req, res) => {
  res.send("Pharma API is running...");
});


// --- SOCKET.IO CONFIGURATION ---
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports : ['websocket', 'polling'],

  pingInterval: 25000,
  pingTimeout: 60000,
});
// --- AUTH MIDDLEWARE FOR SOCKET CONNECTION ---
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: No token provided"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("Authentication error: User not found"));
    socket.user = user;
    next();
  } catch (err) {
    console.error("Socket Auth Error:", err.message);
    next(new Error("Authentication error"));
  }
});
// --- SOCKET EVENTS ---
io.on("connection", (socket) => {
  const user = socket.user;
  console.log(`✅ Socket connected: ${user.email} (${user._id})`);
  // Join personal room
  socket.join(`user_${user._id}`);
  // Admin room
  if (user.role === "admin") {
    socket.join("admins");
  }
  // Conversation room
  socket.join(`conv_${user._id}`);
  // Send unread count on connect
  socket.on("get_unread_count", async () => {
    try {
      const count = await Message.countDocuments({ to: user._id, isRead: false });
      socket.emit("unread_count", { count });
    } catch (err) {
      console.error("Unread count error:", err);
    }
  });
  // Typing indicator
  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(`conv_${conversationId}`).emit("typing", {
      conversationId,
      userId: user._id,
      isTyping,
    });
  });
  // Private message handler
  socket.on("private_message", async ({ conversationId, toUserId, text, metadata }) => {
    try {
      const sanitizedText = (text || "").toString().slice(0, 2000);
      const message = new Message({
        conversationId,
        from: user._id,
        to: toUserId || null,
        text: sanitizedText,
        metadata: metadata || null,
      });
      await message.save();
      const room = `conv_${conversationId}`;
      io.to(room).emit("message", {
        _id: message._id,
        conversationId,
        from: user._id,
        to: toUserId || null,
        text: sanitizedText,
        metadata: message.metadata,
        createdAt: message.createdAt,
      });
      // Notify admins if it's a user message
      if (user.role !== "admin") {
        io.to("admins").emit("new_user_message", {
          conversationId,
          from: { _id: user._id, name: user.name, email: user.email },
          text: sanitizedText,
          createdAt: message.createdAt,
        });
      }
    } catch (err) {
      console.error("Error saving/sending message:", err);
      socket.emit("error_message", { message: "Failed to send message" });
    }
  });
  // Mark messages as read
  socket.on("mark_read", async ({ conversationId }) => {
    try {
      await Message.updateMany(
        { conversationId, to: user._id, isRead: false },
        { isRead: true }
      );
    } catch (err) {
      console.error("Error marking read:", err);
    }
  });
  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${user.email}`, reason);
  });
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server + Socket running on port ${PORT}`));




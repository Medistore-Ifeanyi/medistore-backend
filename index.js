
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
const userRoutes = require('./routes/userRoutes')
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
app.use("/api/users", userRoutes)



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
// io.use(async (socket, next) => {
//   try {
//     const token = socket.handshake.auth?.token;
//     if (!token) {
//       socket.emit("auth_error", { message: "No token provided" });
//       return next(new Error("Authentication error"));
//     }
//     // Verify token safely
//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (verifyErr) {
//       console.warn("JWT verification failed:", verifyErr.message);
//       socket.emit("auth_error", { message: "Token expired or invalid" });
//       // Allow a brief delay before disconnect so client can refresh
//       setTimeout(() => socket.disconnect(true), 2000);
//       return;
//     }
//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) {
//       socket.emit("auth_error", { message: "User not found" });
//       setTimeout(() => socket.disconnect(true), 2000);
//       return;
//     }
//     // :white_check_mark: Auth successful
//     socket.user = user;
//     next();
//   } catch (err) {
//     console.error("Socket Auth Middleware Error:", err.message);
//     socket.emit("auth_error", { message: "Server authentication error" });
//     setTimeout(() => socket.disconnect(true), 2000);
//   }
// });

//uncomment this next

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      // Inform client and reject the handshake immediately
      socket.emit("auth_error", { message: "No token provided" });
      return next(new Error("Authentication error: No token provided"));
    }
    // Verify token safely
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyErr) {
      console.warn("JWT verification failed:", verifyErr.message);
      // Inform client and reject the handshake immediately (do NOT schedule a later disconnect)
      socket.emit("auth_error", { message: "Token expired or invalid" });
      return next(new Error("Authentication error: Token invalid"));
    }
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      socket.emit("auth_error", { message: "User not found" });
      return next(new Error("Authentication error: User not found"));
    }
    // Auth successful: attach user and continue
    socket.user = user;

    console.log(`[socket-auth] authenticated - socketId=${socket.id} user=${user.email} userId=${user._id}`);
    

    return next();
  } catch (err) {
    console.error("Socket Auth Middleware Error:", err.message);
    // Emit an error to client, then reject handshake
    socket.emit("auth_error", { message: "Server authentication error" });
    return next(new Error("Authentication error"));
  }
});

// Helper to log currently connected sockets & users
const debugLogConnectedSockets = async (label = "") => {
  try {
    const sockets = await io.fetchSockets(); // v4+ method returns socket instances
    console.log(`--- socket-debug ${label} - totalSockets=${sockets.length} ---`);
    sockets.forEach((s) => {
      const userInfo = s.user ? `${s.user.email}(${s.user._id})` : "unauthenticated";
      console.log(` socketId=${s.id} user=${userInfo} rooms=${JSON.stringify(Array.from(s.rooms))}`);
    });
    console.log(`--- end socket-debug ${label} ---`);
  } catch (err) {
    console.error("socket-debug error:", err);
  }
};

// --- SOCKET EVENTS ---
io.on("connection", async (socket) => {
  const user = socket.user;
  console.log(`✅ Socket connected: ${user.email} (${user._id})`);

  // Immediately log all connected sockets (diagnostic)
  await debugLogConnectedSockets("after-connect");
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
    const messagePayload = {
      _id: message._id,
      conversationId,
      from: user._id,
      to: toUserId || null,
      text: sanitizedText,
      metadata: message.metadata,
      createdAt: message.createdAt,
    };
    //  Send to the room
    socket.to(room).emit("message", messagePayload);
    //  Also emit directly back to the sender (admin sees it instantly)
    socket.emit("message", messagePayload);
    // Notify admins if user sent it
    if (user.role !== "Admin") {
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




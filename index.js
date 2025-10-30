

require("dotenv").config()
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require('./routes/orderRoutes')
const productRoutes = require("./routes/productRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoute");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes)
app.use("/api/products", productRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

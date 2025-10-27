const Order = require("../models/Orders");
const crypto = require("crypto");



const checkout = async (req, res) => {
  try {
    const { email, phone, name, deliveryAddress, items, totalAmount, userId } = req.body;
    // Basic validation
    if (!email || !deliveryAddress || !items || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    // Generate a unique order reference
    const orderRef = `ORD-${crypto.randomBytes(3).toString("hex").toUpperCase()}-${Date.now()}`;
    // Create new order document
    const newOrder = new Order({
      userId: userId || null,
      email,
      phone,
      name,
      deliveryAddress,
      items,
      totalAmount,
      orderRef,
    });
    await newOrder.save();
    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = {checkout}



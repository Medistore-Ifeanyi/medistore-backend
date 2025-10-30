const Order = require("../models/Orders");
const crypto = require("crypto");
const sendOrderEmail = require("../utils/sendOrderEmail")



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
    console.log(items);
    
    await newOrder.save();

    const itemsNames = items.map(item => item.name).join(", ");
    await sendOrderEmail(name, email, itemsNames)

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

const getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email parameter is required" });
    }
    const orders = await Order.find({ email }).sort({ createdAt: -1 }); // latest first
    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this email" });
    }
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

// ✅ Fetch all orders (for Admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;
    if (!deliveryStatus) {
      return res.status(400).json({ message: "Delivery status is required" });
    }
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { deliveryStatus },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error while updating status" });
  }
};


const getPendingDeliveries = async (req, res) => {
  try {
    const {email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email parameter is required" });
    }

    const pending = await Order.find({ status: { $ne: "delivered" } }).sort({
      createdAt: -1,
    });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending deliveries" });
  }
};


module.exports = {checkout, getOrdersByEmail, getAllOrders, updateOrderStatus, getPendingDeliveries };



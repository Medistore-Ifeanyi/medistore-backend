const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null, // For guest users
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  name: {
    type: String,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  deliveryStatus: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered"],
    default: "Pending",
  },
  orderRef: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports= mongoose.model("Order", orderSchema);
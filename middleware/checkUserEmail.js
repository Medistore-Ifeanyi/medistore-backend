const User = require("../models/User");




const checkUserByEmail = async (req, res, next) => {
  try {
    // Ensure req.body and req.params exist before accessing .email
    const email =
      (req.body && req.body.email) ||
      (req.params && req.params.email) ||
      (req.query && req.query.email); // fallback if sent via query
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }
    // Attach user to request for downstream access
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in checkUserByEmail middleware:", error);
    res.status(500).json({ message: "Server error while verifying user" });
  }
};

module.exports = { checkUserByEmail };
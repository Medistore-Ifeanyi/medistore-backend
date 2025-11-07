import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// @desc Register User
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role, user.email),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const loginUser = async (req, res) => {
  
  try {

    let { email, password } = req.body;

    email = email.trim().toLowerCase()


    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid Login Credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Login Credentials" });
    // include role in response
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role, user.email), // Pass role to token generator if desired
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

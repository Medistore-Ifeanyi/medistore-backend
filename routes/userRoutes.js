const express = require("express");
const User = require("../models/User");
const {protect, adminOnly} = require("../middleware/authMiddleware");


const router = express.Router();

router.get("/" ,protect, adminOnly, async (req, res)=>{
    try {
        const users = await User.find({role : {$ne: "admin"}}, "name email _id createdAt");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
})



module.exports = router;
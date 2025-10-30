
const express = require("express");
const multer = require("multer");
const { uploadPrescription, getAllPrescriptions } = require("../controller/prescriptionController");
const { checkUserByEmail } = require("../middleware/checkUserEmail");
const { protect, adminOnly } = require("../middleware/authMiddleware");



const router = express.Router();
// Multer setup (same as product route)
const upload = multer({ dest: "uploads/" });
// Upload prescription route
router.post("/upload",checkUserByEmail, upload.single("image"), uploadPrescription);
router.get("/all", protect, adminOnly, getAllPrescriptions);


module.exports = router;
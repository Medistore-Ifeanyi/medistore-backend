const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect, adminOnly } = require("../middleware/authMiddleware");



const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controller/productController");

// Multer setup for file upload
const upload = multer({ dest: "uploads/" });
// Routes
router.post("/", protect, adminOnly, upload.single("image"), createProduct); // Add product
router.get("/", getProducts); // Fetch all products
router.get("/:id", protect, adminOnly,  getProductById); // Single product
router.put("/:id",protect, adminOnly, upload.single("image"), updateProduct); // Update product
router.delete("/:id", protect, adminOnly, deleteProduct); // Delete product




module.exports = router;
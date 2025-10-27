const Product = require("../models/Products");
const cloudinary = require("../config/cloudinary");



// ✅ Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "medistore/products",
    });
    const product = await Product.create({
      name,
      category,
      price,
      image: result.secure_url,
      createdBy: req.user ? req.user.id : null, 
    });
    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

// ✅ Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// ✅  Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};
// ✅  Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const updateData = { name, category, price };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "medistore/products",
      });
      updateData.image = result.secure_url;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

//✅   Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};
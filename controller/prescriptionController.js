const Prescription = require("../models/Prescription");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");


const uploadPrescription = async (req, res) => {
  try {
    // Get email directly from middleware
    const email = req.user?.email;
    if (!email) {
      return res.status(400).json({ message: "User email not found in request" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image file" });
    }
    // Upload directly to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "prescriptions",
    });
    // Save prescription record
    const newPrescription = new Prescription({
      userEmail: email,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
    await newPrescription.save();
    res.status(201).json({
      success: true,
      message: "Prescription uploaded successfully",
      data: newPrescription,
    });
  } catch (error) {
    console.error("Prescription upload error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};



const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    // Find prescription by ID
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    
    
    const parts = prescription.imageUrl.split("/");
    const publicIdWithExt = parts[parts.length - 1];
    const publicId = publicIdWithExt.split(".")[0]; // remove .jpg/.png extension
    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(publicId);
    // Delete from MongoDB
    await Prescription.findByIdAndDelete(id);
    res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (error) {
    console.error("Error deleting prescription:", error);
    res.status(500).json({ message: "Failed to delete prescription" });
  }
};


const getAllPrescriptions = async (req, res) => {
  try {
    // Fetch all prescriptions, latest first
    const prescriptions = await Prescription.find().sort({ createdAt: -1 });
    // Attach user details (name, email) for each prescription
    const detailedPrescriptions = await Promise.all(
      prescriptions.map(async (p) => {
        const user = await User.findOne({ email: p.userEmail }).select("name email");
        return {
          ...p._doc,
          user,
        };
      })
    );
    res.status(200).json(detailedPrescriptions);
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({ message: "Failed to fetch prescriptions" });
  }
};

module.exports = { uploadPrescription, getAllPrescriptions, deletePrescription };
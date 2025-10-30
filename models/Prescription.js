const mongoose = require("mongoose");


const prescriptionSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


module.exports= mongoose.model("Prescription", prescriptionSchema);
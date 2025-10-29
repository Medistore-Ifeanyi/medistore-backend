import mongoose from "mongoose";
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
export default mongoose.model("Prescription", prescriptionSchema);
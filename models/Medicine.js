import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    form: { type: String, trim: true }, // e.g., tablet, syrup, injection
    strength: { type: String, trim: true }, // e.g., 500 mg
    batchNumber: { type: String, trim: true },
    manufacturer: { type: String, trim: true },
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    threshold: { type: Number, default: 0 },
    expiryDate: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Ensure schema updates are applied during Next.js dev HMR
if (mongoose.models.Medicine) {
  try {
    mongoose.deleteModel("Medicine");
  } catch (e) {}
}

export default mongoose.model("Medicine", MedicineSchema);
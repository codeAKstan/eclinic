import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user", "doctor"], default: "user" },
    name: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    primarySpeciality: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female"] },
  },
  { timestamps: true }
);

// Ensure schema updates are applied during Next.js dev HMR
if (mongoose.models.User) {
  try {
    // Mongoose v6+ provides deleteModel to allow re-compiling models
    mongoose.deleteModel("User");
  } catch (e) {
    // Fallback: ignore if not available
  }
}

export default mongoose.model("User", UserSchema);
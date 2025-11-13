import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledFor: { type: Date, required: true },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

if (mongoose.models.Appointment) {
  try {
    mongoose.deleteModel("Appointment");
  } catch (e) {}
}

export default mongoose.model("Appointment", AppointmentSchema);
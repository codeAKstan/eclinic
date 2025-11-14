import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledFor: { type: Date, required: true },
    status: { type: String, enum: ["scheduled", "approved", "rescheduled", "completed", "cancelled"], default: "scheduled" },
    mode: { type: String, enum: ["physical", "online"], trim: true },
    notes: { type: String, trim: true },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comments: { type: String, trim: true },
      reported: { type: Boolean, default: false },
      createdAt: { type: Date },
    },
    consultation: {
      presentingSymptoms: { type: String, trim: true },
      diagnosis: { type: String, trim: true },
      prescription: { type: String, trim: true },
      advice: { type: String, trim: true },
      followUpDate: { type: Date },
      attachments: [{ type: String, trim: true }],
      completed: { type: Boolean, default: false },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

if (mongoose.models.Appointment) {
  try {
    mongoose.deleteModel("Appointment");
  } catch (e) {}
}

export default mongoose.model("Appointment", AppointmentSchema);
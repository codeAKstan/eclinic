import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["appointment", "message", "system"], default: "appointment" },
    title: { type: String, trim: true },
    body: { type: String, trim: true },
    data: {
      appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (mongoose.models.Notification) {
  try {
    mongoose.deleteModel("Notification");
  } catch (e) {}
}

export default mongoose.model("Notification", NotificationSchema);
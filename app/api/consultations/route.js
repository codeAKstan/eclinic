import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { verifyToken } from "@/lib/auth";
import { put } from "@vercel/blob";

async function requireDoctor(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return { ok: false, res: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  const payload = await verifyToken(token);
  if (payload.role !== "doctor") {
    return { ok: false, res: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true, uid: payload.uid };
}

export async function POST(request) {
  try {
    const auth = await requireDoctor(request);
    if (!auth.ok) return auth.res;

    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");

    let payload = {};
    let files = [];
    if (isMultipart) {
      const form = await request.formData();
      payload = {
        appointmentId: (form.get("appointmentId") || "").toString(),
        presentingSymptoms: (form.get("presentingSymptoms") || "").toString(),
        diagnosis: (form.get("diagnosis") || "").toString(),
        prescription: (form.get("prescription") || "").toString(),
        advice: (form.get("advice") || "").toString(),
        followUpDate: (form.get("followUpDate") || "").toString(),
        completed: (form.get("completed") || "").toString(),
      };
      files = form.getAll("files");
    } else {
      payload = await request.json();
      files = [];
    }

    const { appointmentId, presentingSymptoms, diagnosis, prescription, advice } = payload || {};
    let { followUpDate, completed } = payload || {};
    if (!appointmentId) return NextResponse.json({ ok: false, error: "appointmentId is required" }, { status: 400 });

    await dbConnect();
    const ap = await Appointment.findOne({ _id: appointmentId, doctorId: auth.uid }).lean();
    if (!ap) return NextResponse.json({ ok: false, error: "Appointment not found" }, { status: 404 });

    // Upload files if provided
    let attachmentUrls = [];
    if (Array.isArray(files) && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file || !file.name) continue;
        const key = `consultations/${appointmentId}-${Date.now()}-${i}-${file.name}`;
        const { url } = await put(key, file, { access: "public" });
        attachmentUrls.push(url);
      }
    }

    const consult = {
      presentingSymptoms: (presentingSymptoms || "").trim(),
      diagnosis: (diagnosis || "").trim(),
      prescription: (prescription || "").trim(),
      advice: (advice || "").trim(),
      attachments: attachmentUrls,
      updatedAt: new Date(),
    };
    if (followUpDate) {
      const d = new Date(followUpDate);
      if (!isNaN(d.getTime())) consult.followUpDate = d;
    }
    const isCompleted = typeof completed === "string" ? completed.toLowerCase() === "true" : !!completed;
    consult.completed = isCompleted;

    const update = { $set: { consultation: consult } };
    if (isCompleted) update.$set.status = "completed";

    const updated = await Appointment.findOneAndUpdate({ _id: ap._id }, update, { new: true }).lean();

    // Notify patient when marked completed
    if (isCompleted) {
      try {
        await Notification.create({
          recipientId: updated.userId,
          type: "consultation",
          title: "Consultation Completed",
          body: `Your consultation on ${new Date(updated.scheduledFor).toLocaleString()} has been marked completed by the doctor.`,
          data: { appointmentId: updated._id },
        });
      } catch (notifyErr) {
        console.error("Consultation completion notification error", notifyErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/consultations POST error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
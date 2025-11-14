import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { verifyToken } from "@/lib/auth";
import Notification from "@/models/Notification";

async function getAuth(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return { error: "Unauthorized", status: 401 };
  const payload = await verifyToken(token);
  return { uid: payload.uid };
}

export async function POST(request) {
  try {
    const auth = await getAuth(request);
    if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    await dbConnect();

    const body = await request.json();
    const { appointmentId, rating, comments, report } = body || {};
    if (!appointmentId || !rating) {
      return NextResponse.json({ ok: false, error: "appointmentId and rating are required" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ ok: false, error: "rating must be between 1 and 5" }, { status: 400 });
    }

    const ap = await Appointment.findOne({ _id: appointmentId, userId: auth.uid }).lean();
    if (!ap) return NextResponse.json({ ok: false, error: "Appointment not found" }, { status: 404 });

    const update = {
      $set: {
        feedback: {
          rating,
          comments: (comments || "").trim(),
          reported: !!report,
          createdAt: new Date(),
        },
      },
    };
    await Appointment.updateOne({ _id: ap._id }, update);

    // Notify the doctor about feedback (optional, non-blocking)
    try {
      await Notification.create({
        recipientId: ap.doctorId,
        type: "feedback",
        title: "New Consultation Feedback",
        body: `A patient submitted ${rating}-star feedback for your consultation.`,
        data: { appointmentId: ap._id },
      });
    } catch (e) {
      console.error("Create feedback notification error", e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/feedback POST error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
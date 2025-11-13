import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

async function getAuth(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return { error: "Unauthorized", status: 401 };
  const payload = await verifyToken(token);
  return { uid: payload.uid };
}

export async function GET(request) {
  try {
    const auth = await getAuth(request);
    if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    await dbConnect();
    const list = await Appointment.find({ userId: auth.uid })
      .sort({ scheduledFor: 1 })
      .populate({ path: "doctorId", select: "name primarySpeciality" })
      .lean();

    return NextResponse.json({
      ok: true,
      appointments: list.map(ap => ({
        id: String(ap._id),
        doctor: ap.doctorId ? {
          name: ap.doctorId.name || "Unknown",
          speciality: ap.doctorId.primarySpeciality || "General",
        } : null,
        scheduledFor: ap.scheduledFor,
        status: ap.status,
        notes: ap.notes || "",
      })),
    });
  } catch (err) {
    console.error("/api/appointments GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await getAuth(request);
    if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    await dbConnect();

    const body = await request.json();
    const { doctorId, date, time, notes } = body || {};
    if (!doctorId || !date || !time) {
      return NextResponse.json({ ok: false, error: "doctorId, date and time are required" }, { status: 400 });
    }

    // Combine date and time into a single Date
    const scheduledFor = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledFor.getTime())) {
      return NextResponse.json({ ok: false, error: "Invalid date/time" }, { status: 400 });
    }

    // Ensure doctor exists and is role doctor
    const doc = await User.findOne({ _id: doctorId, role: "doctor" }, { _id: 1 }).lean();
    if (!doc) return NextResponse.json({ ok: false, error: "Doctor not found" }, { status: 404 });

    const created = await Appointment.create({
      userId: auth.uid,
      doctorId: doctorId,
      scheduledFor,
      status: "scheduled",
      notes: notes || "",
    });

    return NextResponse.json({ ok: true, id: String(created._id) }, { status: 201 });
  } catch (err) {
    console.error("/api/appointments POST error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
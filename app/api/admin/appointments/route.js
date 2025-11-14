import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

async function requireAdmin(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return { ok: false, res: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  const payload = await verifyToken(token);
  if (payload.role !== "admin") return { ok: false, res: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  return { ok: true };
}

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.res;

    await dbConnect();

    const appts = await Appointment.find({})
      .sort({ scheduledFor: -1 })
      .lean();

    // Fetch doctor and user names in batch to avoid multiple queries
    const ids = new Set();
    appts.forEach((a) => { if (a.userId) ids.add(String(a.userId)); if (a.doctorId) ids.add(String(a.doctorId)); });
    const users = await User.find({ _id: { $in: Array.from(ids) } }, { passwordHash: 0 }).lean();
    const byId = new Map(users.map((u) => [String(u._id), u]));

    const result = appts.map((a) => {
      const user = byId.get(String(a.userId)) || {};
      const doctor = byId.get(String(a.doctorId)) || {};
      return {
        id: String(a._id),
        status: a.status,
        scheduledFor: a.scheduledFor,
        mode: a.mode || "",
        notes: a.notes || "",
        user: { id: String(a.userId), name: user.name || "", email: user.email || "" },
        doctor: { id: String(a.doctorId), name: doctor.name || "", speciality: doctor.primarySpeciality || "" },
        createdAt: a.createdAt,
      };
    });

    return NextResponse.json({ ok: true, appointments: result });
  } catch (err) {
    console.error("/api/admin/appointments GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
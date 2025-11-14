import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

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

export async function GET(request, ctx) {
  try {
    const auth = await requireDoctor(request);
    if (!auth.ok) return auth.res;
    await dbConnect();
    const { id } = (await (ctx?.params)) || {};
    if (!id) return NextResponse.json({ ok: false, error: "Patient id required" }, { status: 400 });
    const doc = await User.findById(id, "-passwordHash").lean();
    if (!doc) return NextResponse.json({ ok: false, error: "Patient not found" }, { status: 404 });
    return NextResponse.json({ ok: true, patient: {
      id: String(doc._id),
      name: doc.name || "",
      email: doc.email || "",
      contactNumber: doc.contactNumber || "",
      primarySpeciality: doc.primarySpeciality || "",
      dateOfBirth: doc.dateOfBirth || null,
      gender: doc.gender || "",
      bloodGroup: doc.bloodGroup || "",
      genotype: doc.genotype || "",
      medicalRecords: (doc.medicalRecords || []).map(r => ({
        recordType: r.recordType,
        notes: r.notes || "",
        recordedAt: r.recordedAt,
      })),
      hospitalCard: doc.hospitalCard || null,
    } });
  } catch (err) {
    console.error("/api/doctor/patients/[id] GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
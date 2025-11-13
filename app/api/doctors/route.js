import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;
    if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    await verifyToken(token);
    await dbConnect();
    const doctors = await User.find({ role: "doctor" }, {
      _id: 1,
      name: 1,
      primarySpeciality: 1,
      contactNumber: 1,
    }).lean();

    return NextResponse.json({ ok: true, doctors: doctors.map(d => ({
      id: String(d._id),
      name: d.name || "Unnamed Doctor",
      speciality: d.primarySpeciality || "General Medicine",
      contactNumber: d.contactNumber || "",
    })) });
  } catch (err) {
    console.error("/api/doctors GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
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
    const payload = await verifyToken(token);
    if (payload.role !== "admin") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    await dbConnect();
    const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, users: users.map(u => ({
      id: String(u._id),
      email: u.email,
      role: u.role,
      name: u.name || "",
      contactNumber: u.contactNumber || "",
      primarySpeciality: u.primarySpeciality || "",
      createdAt: u.createdAt,
    })) });
  } catch (err) {
    console.error("/api/admin/users GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
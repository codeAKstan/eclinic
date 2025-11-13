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
    await dbConnect();
    const user = await User.findById(payload.uid, { passwordHash: 0 }).lean();
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    return NextResponse.json({
      ok: true,
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
        name: user.name || "",
        contactNumber: user.contactNumber || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || null,
        hospitalCard: user.hospitalCard || null,
      },
    });
  } catch (err) {
    console.error("/api/me GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
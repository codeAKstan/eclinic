import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
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

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.res;
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { role, name, contactNumber, primarySpeciality } = body || {};

    const update = {};
    if (role) update.role = role;
    if (name !== undefined) update.name = name;
    if (contactNumber !== undefined) update.contactNumber = contactNumber;
    if (primarySpeciality !== undefined) update.primarySpeciality = primarySpeciality;
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: false, error: "No fields to update" }, { status: 400 });
    }

    const doc = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true, select: "-passwordHash" });
    if (!doc) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    return NextResponse.json({ ok: true, user: {
      id: String(doc._id),
      email: doc.email,
      role: doc.role,
      name: doc.name || "",
      contactNumber: doc.contactNumber || "",
      primarySpeciality: doc.primarySpeciality || "",
      createdAt: doc.createdAt,
    } });
  } catch (err) {
    console.error("/api/admin/users/[id] PATCH error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.res;
    await dbConnect();
    const { id } = await params;
    const doc = await User.findByIdAndDelete(id);
    if (!doc) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/admin/users/[id] DELETE error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
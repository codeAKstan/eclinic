import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Medicine from "@/models/Medicine";
import { verifyToken } from "@/lib/auth";

async function requireUser(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return { ok: false, res: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  try {
    await verifyToken(token);
    return { ok: true };
  } catch (e) {
    return { ok: false, res: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
}

export async function GET(request) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return auth.res;
    await dbConnect();
    const items = await Medicine.find({}).sort({ name: 1 }).lean();
    return NextResponse.json({
      ok: true,
      medicines: items.map((m) => ({
        id: String(m._id),
        name: m.name,
        genericName: m.genericName || "",
        form: m.form || "",
        strength: m.strength || "",
        manufacturer: m.manufacturer || "",
        price: m.price || 0,
        stock: m.stock || 0,
        expiryDate: m.expiryDate || null,
      })),
    });
  } catch (err) {
    console.error("/api/inventory GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
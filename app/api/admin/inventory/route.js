import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Medicine from "@/models/Medicine";
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
    const items = await Medicine.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      ok: true,
      medicines: items.map((m) => ({
        id: String(m._id),
        name: m.name,
        genericName: m.genericName || "",
        form: m.form || "",
        strength: m.strength || "",
        batchNumber: m.batchNumber || "",
        manufacturer: m.manufacturer || "",
        price: m.price || 0,
        stock: m.stock || 0,
        threshold: m.threshold || 0,
        expiryDate: m.expiryDate || null,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    console.error("/api/admin/inventory GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.res;
    await dbConnect();
    const body = await request.json();
    const {
      name,
      genericName,
      form,
      strength,
      batchNumber,
      manufacturer,
      price,
      stock,
      threshold,
      expiryDate,
      notes,
    } = body || {};

    if (!name) return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });

    const doc = await Medicine.create({
      name: String(name).trim(),
      genericName: genericName?.trim(),
      form: form?.trim(),
      strength: strength?.trim(),
      batchNumber: batchNumber?.trim(),
      manufacturer: manufacturer?.trim(),
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      threshold: Number(threshold) || 0,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      notes: notes?.trim(),
    });

    return NextResponse.json({ ok: true, id: String(doc._id) });
  } catch (err) {
    console.error("/api/admin/inventory POST error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
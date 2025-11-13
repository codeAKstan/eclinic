import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { put } from "@vercel/blob";

async function requireAuth(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return { ok: false, res: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  const payload = await verifyToken(token);
  return { ok: true, uid: payload.uid };
}

export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.res;
    await dbConnect();
    const user = await User.findById(auth.uid, { passwordHash: 0 }).lean();
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    return NextResponse.json({ ok: true, card: user.hospitalCard || null });
  } catch (err) {
    console.error("/api/card GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.res;

    const form = await request.formData();
    const address = (form.get("address") || "").toString().trim();
    const image = form.get("image");
    if (!address) return NextResponse.json({ ok: false, error: "Address is required" }, { status: 400 });
    if (!image) return NextResponse.json({ ok: false, error: "Image file is required" }, { status: 400 });

    await dbConnect();
    const user = await User.findById(auth.uid);
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    // Upload to Vercel Blob (public)
    const fileName = `cards/${auth.uid}-${Date.now()}`;
    const { url } = await put(fileName, image, { access: "public" });

    user.hospitalCard = {
      address,
      imageUrl: url,
      issuedAt: new Date(),
    };
    await user.save();

    return NextResponse.json({ ok: true, card: user.hospitalCard });
  } catch (err) {
    console.error("/api/card POST error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
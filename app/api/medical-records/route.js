import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

async function getAuthUser(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return { error: "Unauthorized", status: 401 };
  const payload = await verifyToken(token);
  await dbConnect();
  const user = await User.findById(payload.uid, { passwordHash: 0 }).lean();
  if (!user) return { error: "User not found", status: 404 };
  return { user };
}

export async function GET(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    const { user } = auth;
    return NextResponse.json({
      ok: true,
      bloodGroup: user.bloodGroup || "",
      genotype: user.genotype || "",
      medicalRecords: user.medicalRecords || [],
    });
  } catch (err) {
    console.error("/api/medical-records GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { recordType, notes, recordedAt } = body || {};
    if (!recordType) return NextResponse.json({ ok: false, error: "recordType is required" }, { status: 400 });

    const update = {
      $push: {
        medicalRecords: {
          recordType,
          notes: notes || "",
          recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
        },
      },
    };

    const saved = await User.findByIdAndUpdate(auth.user._id, update, { new: true, lean: true });
    return NextResponse.json({ ok: true, medicalRecords: saved.medicalRecords || [] });
  } catch (err) {
    console.error("/api/medical-records POST error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { bloodGroup, genotype } = body || {};
    const update = {};
    if (bloodGroup) update.bloodGroup = bloodGroup;
    if (genotype) update.genotype = genotype;
    if (Object.keys(update).length === 0) return NextResponse.json({ ok: false, error: "No fields to update" }, { status: 400 });

    const saved = await User.findByIdAndUpdate(auth.user._id, update, { new: true, lean: true });
    return NextResponse.json({ ok: true, bloodGroup: saved.bloodGroup || "", genotype: saved.genotype || "" });
  } catch (err) {
    console.error("/api/medical-records PATCH error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
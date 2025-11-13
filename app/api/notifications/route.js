import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { verifyToken } from "@/lib/auth";

async function getAuth(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return { error: "Unauthorized", status: 401 };
  const payload = await verifyToken(token);
  return { uid: payload.uid, role: payload.role };
}

export async function GET(request) {
  try {
    const auth = await getAuth(request);
    if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    await dbConnect();
    const list = await Notification.find({ recipientId: auth.uid })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({
      ok: true,
      notifications: list.map((n) => ({
        id: String(n._id),
        title: n.title || "",
        body: n.body || "",
        type: n.type || "appointment",
        read: !!n.read,
        createdAt: n.createdAt,
        appointmentId: n.data?.appointmentId ? String(n.data.appointmentId) : undefined,
      })),
      unreadCount: list.filter((n) => !n.read).length,
    });
  } catch (err) {
    console.error("/api/notifications GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await getAuth(request);
    if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    await dbConnect();
    const body = await request.json();
    const { ids, markAll } = body || {};
    if (markAll) {
      await Notification.updateMany({ recipientId: auth.uid, read: false }, { $set: { read: true } });
      return NextResponse.json({ ok: true });
    }
    if (Array.isArray(ids) && ids.length > 0) {
      await Notification.updateMany({ recipientId: auth.uid, _id: { $in: ids } }, { $set: { read: true } });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: "No notifications specified" }, { status: 400 });
  } catch (err) {
    console.error("/api/notifications PATCH error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
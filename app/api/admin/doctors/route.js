import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { verifyToken } from "@/lib/auth";

function randomPassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let pwd = "";
  for (let i = 0; i < length; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

async function sendTempPasswordEmail({ to, password }) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) throw new Error("Email credentials not configured");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const mailOptions = {
    from: `E-Clinic Admin <${user}>`,
    to,
    subject: "Your E-Clinic doctor account",
    html: `
      <p>Hello,</p>
      <p>Your doctor account has been created on E-Clinic.</p>
      <p><strong>Temporary Password:</strong> ${password}</p>
      <p>Please login at <a href="${appUrl}/login">${appUrl}/login</a> and change your password immediately.</p>
      <p>If you didn’t expect this email, please contact the clinic admin.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request) {
  try {
    // Auth: require admin cookie
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;
    if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (payload.role !== "admin") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { email, name, contactNumber, primarySpeciality } = body || {};
    if (!email) return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });

    await dbConnect();
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return NextResponse.json({ ok: false, error: "User already exists" }, { status: 409 });

    const tempPassword = randomPassword(12);
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const doc = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "doctor",
      name: name?.trim(),
      contactNumber: contactNumber?.trim(),
      primarySpeciality: primarySpeciality?.trim(),
    });

    try {
      await sendTempPasswordEmail({ to: doc.email, password: tempPassword });
    } catch (mailErr) {
      console.error("sendTempPasswordEmail error", mailErr);
      // If email failed, keep account but inform client to manually share password
      return NextResponse.json({ ok: true, userId: String(doc._id), emailSent: false });
    }

    return NextResponse.json({ ok: true, userId: String(doc._id), emailSent: true });
  } catch (err) {
    console.error("/api/admin/doctors POST error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
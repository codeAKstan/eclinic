import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

async function sendWelcomeEmail({ to, name }) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) throw new Error("Email credentials not configured");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const mailOptions = {
    from: `E-Clinic <${user}>`,
    to,
    subject: "Welcome to E-Clinic",
    html: `
      <p>Hello${name ? ` ${name}` : ""},</p>
      <p>Your patient account has been created successfully.</p>
      <p>You can now log in at <a href="${appUrl}/login">${appUrl}/login</a> using your email and password.</p>
      <p>If you did not create this account, please ignore this email or contact support.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      firstName = "",
      lastName = "",
      email,
      contactNumber,
      password,
      confirmPassword,
      terms,
      dobMonth,
      dobDay,
      dobYear,
      gender,
    } = body || {};

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password required" }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ ok: false, error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json({ ok: false, error: "Passwords do not match" }, { status: 400 });
    }
    if (terms === false) {
      return NextResponse.json({ ok: false, error: "You must accept the terms" }, { status: 400 });
    }

    await dbConnect();
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ ok: false, error: "User already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const name = [firstName, lastName].filter(Boolean).join(" ");

    // Parse date of birth if provided
    let dateOfBirth;
    if (dobYear && dobMonth && dobDay) {
      const y = parseInt(String(dobYear), 10);
      const m = parseInt(String(dobMonth), 10);
      const d = parseInt(String(dobDay), 10);
      if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
        const dt = new Date(Date.UTC(y, m - 1, d));
        if (!Number.isNaN(dt.getTime())) {
          dateOfBirth = dt;
        }
      }
    }

    // Normalize gender
    const normalizedGender = ["male", "female"].includes(String(gender)) ? String(gender) : undefined;

    const doc = await User.create({
      email: normalizedEmail,
      passwordHash,
      role: "user", // patient/student
      name: name || undefined,
      dateOfBirth,
      gender: normalizedGender,
      contactNumber: contactNumber?.trim(),
    });

    let emailSent = false;
    try {
      await sendWelcomeEmail({ to: doc.email, name });
      emailSent = true;
    } catch (mailErr) {
      console.error("sendWelcomeEmail error", mailErr);
      emailSent = false;
    }

    return NextResponse.json({ ok: true, userId: String(doc._id), emailSent });
  } catch (err) {
    console.error("/api/signup POST error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
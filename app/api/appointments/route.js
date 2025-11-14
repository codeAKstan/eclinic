import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { verifyToken } from "@/lib/auth";
import nodemailer from "nodemailer";

async function getAuth(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return { error: "Unauthorized", status: 401 };
  const payload = await verifyToken(token);
  return { uid: payload.uid };
}

export async function GET(request) {
  try {
    const auth = await getAuth(request);
    if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    await dbConnect();
    const list = await Appointment.find({ userId: auth.uid })
      .sort({ scheduledFor: 1 })
      .populate({ path: "doctorId", select: "name primarySpeciality" })
      .lean();

    return NextResponse.json({
      ok: true,
      appointments: list.map(ap => ({
        id: String(ap._id),
        doctor: ap.doctorId ? {
          name: ap.doctorId.name || "Unknown",
          speciality: ap.doctorId.primarySpeciality || "General",
        } : null,
        scheduledFor: ap.scheduledFor,
        status: ap.status,
        mode: ap.mode || null,
        notes: ap.notes || "",
      })),
    });
  } catch (err) {
    console.error("/api/appointments GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await getAuth(request);
    if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    await dbConnect();

    const body = await request.json();
    const { doctorId, date, time, notes } = body || {};
    if (!doctorId || !date || !time) {
      return NextResponse.json({ ok: false, error: "doctorId, date and time are required" }, { status: 400 });
    }

    // Combine date and time into a single Date
    const scheduledFor = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledFor.getTime())) {
      return NextResponse.json({ ok: false, error: "Invalid date/time" }, { status: 400 });
    }

    // Ensure doctor exists and is role doctor; fetch email and name
    const doc = await User.findOne({ _id: doctorId, role: "doctor" }, { _id: 1, email: 1, name: 1 }).lean();
    if (!doc) return NextResponse.json({ ok: false, error: "Doctor not found" }, { status: 404 });

    // Fetch patient/user info for email and notification context
    const patient = await User.findById(auth.uid, { _id: 1, name: 1, email: 1 }).lean();

    const created = await Appointment.create({
      userId: auth.uid,
      doctorId: doctorId,
      scheduledFor,
      status: "scheduled",
      notes: notes || "",
    });

    // Create in-app notification for the doctor
    try {
      await Notification.create({
        recipientId: doc._id,
        type: "appointment",
        title: "New Appointment",
        body: `Patient ${patient?.name || "Unknown"} booked for ${scheduledFor.toLocaleString()}`,
        data: { appointmentId: created._id, userId: patient?._id },
      });
    } catch (notifyErr) {
      console.error("Notification create error", notifyErr);
    }

    // Send email to doctor (non-blocking for success)
    try {
      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;
      if (user && pass && doc.email) {
        const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const mailOptions = {
          from: `E-Clinic <${user}>`,
          to: doc.email,
          subject: "New appointment booked",
          html: `
            <p>Hello${doc.name ? ` ${doc.name}` : ""},</p>
            <p>A new appointment has been booked.</p>
            <p><strong>Patient:</strong> ${patient?.name || "Unknown"}</p>
            <p><strong>Scheduled for:</strong> ${scheduledFor.toLocaleString()}</p>
            <p>You can view this appointment in your dashboard: <a href="${appUrl}/doctor">${appUrl}/doctor</a>.</p>
          `,
        };
        await transporter.sendMail(mailOptions);
      } else {
        console.warn("Email credentials or doctor email missing; skipping mail.");
      }
    } catch (mailErr) {
      console.error("Appointment email send error", mailErr);
      // Do not fail the booking due to email issues
    }

    return NextResponse.json({ ok: true, id: String(created._id) }, { status: 201 });
  } catch (err) {
    console.error("/api/appointments POST error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
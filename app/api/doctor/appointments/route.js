import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import Notification from "@/models/Notification";
import nodemailer from "nodemailer";

async function requireDoctor(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return { ok: false, res: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  const payload = await verifyToken(token);
  if (payload.role !== "doctor") {
    return { ok: false, res: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true, uid: payload.uid };
}

export async function GET(request) {
  try {
    const auth = await requireDoctor(request);
    if (!auth.ok) return auth.res;
    await dbConnect();
    const list = await Appointment.find({ doctorId: auth.uid })
      .sort({ scheduledFor: 1 })
      .populate({ path: "userId", select: "name email contactNumber" })
      .lean();
    return NextResponse.json({
      ok: true,
      appointments: list.map((ap) => ({
        id: String(ap._id),
        patientId: ap.userId ? String(ap.userId._id) : undefined,
        patient: ap.userId ? {
          name: ap.userId.name || "Unknown",
          email: ap.userId.email || "",
          contactNumber: ap.userId.contactNumber || "",
        } : null,
        scheduledFor: ap.scheduledFor,
        status: ap.status,
        mode: ap.mode || null,
        notes: ap.notes || "",
      })),
    });
  } catch (err) {
    console.error("/api/doctor/appointments GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await requireDoctor(request);
    if (!auth.ok) return auth.res;
    await dbConnect();
    const body = await request.json();
    const { id, action, date, time } = body || {};
    if (!id || !action || !["approve", "reschedule", "cancel"].includes(action)) {
      return NextResponse.json({ ok: false, error: "id and valid action are required" }, { status: 400 });
    }

    const apDoc = await Appointment.findOne({ _id: id, doctorId: auth.uid }).lean();
    if (!apDoc) return NextResponse.json({ ok: false, error: "Appointment not found" }, { status: 404 });

    let update = {};
    let title = "";
    let bodyText = "";
    if (action === "approve") {
      const { mode } = body || {};
      if (!mode || !["physical", "online"].includes(mode)) {
        return NextResponse.json({ ok: false, error: "mode is required: physical or online" }, { status: 400 });
      }
      update = { status: "approved", mode };
      title = "Appointment Approved";
      bodyText = `Your appointment on ${new Date(apDoc.scheduledFor).toLocaleString()} has been approved (${mode}).`;
    } else if (action === "cancel") {
      update = { status: "cancelled" };
      title = "Appointment Cancelled";
      bodyText = `Your appointment on ${new Date(apDoc.scheduledFor).toLocaleString()} was cancelled by the doctor.`;
    } else if (action === "reschedule") {
      if (!date || !time) {
        return NextResponse.json({ ok: false, error: "date and time are required for reschedule" }, { status: 400 });
      }
      const newDate = new Date(`${date}T${time}:00`);
      if (isNaN(newDate.getTime())) {
        return NextResponse.json({ ok: false, error: "Invalid reschedule date/time" }, { status: 400 });
      }
      update = { status: "rescheduled", scheduledFor: newDate };
      title = "Appointment Rescheduled";
      bodyText = `Your appointment has been rescheduled to ${newDate.toLocaleString()}.`;
    }

    const updated = await Appointment.findOneAndUpdate(
      { _id: id, doctorId: auth.uid },
      { $set: update },
      { new: true }
    ).lean();

    // Create notification for the patient
    try {
      await Notification.create({
        recipientId: updated.userId,
        type: "appointment",
        title,
        body: bodyText,
        data: { appointmentId: updated._id },
      });
    } catch (notifyErr) {
      console.error("User notification create error", notifyErr);
    }

    // Send email to the patient (non-blocking)
    try {
      const patient = await User.findById(updated.userId, { email: 1, name: 1 }).lean();
      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;
      if (patient?.email && user && pass) {
        const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const mailOptions = {
          from: `E-Clinic <${user}>`,
          to: patient.email,
          subject: title,
          html: `
            <p>Hello${patient.name ? ` ${patient.name}` : ""},</p>
            <p>${bodyText}</p>
            <p>You can view your appointments at <a href="${appUrl}/dashboard/appointments">${appUrl}/dashboard/appointments</a>.</p>
          `,
        };
        await transporter.sendMail(mailOptions);
      } else {
        console.warn("Email credentials or patient email missing; skipping mail.");
      }
    } catch (mailErr) {
      console.error("Patient appointment action email error", mailErr);
      // Do not fail the action due to email issues
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/doctor/appointments PATCH error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
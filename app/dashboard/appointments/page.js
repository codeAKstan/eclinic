"use client";

import { useEffect, useState } from "react";
import UserTopbar from "../../components/UserTopbar";
import UserSidebar from "../../components/UserSidebar";
import { Home, Calendar, FileText, MessageSquare, CreditCard, UserRound, Package } from "lucide-react";

export default function AppointmentsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctors, setDoctors] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadAppointments() {
      try {
        const res = await fetch("/api/appointments", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data.ok) setAppointments(data.appointments || []);
      } finally {
        if (!cancelled) setLoadingAppointments(false);
      }
    }
    async function loadDoctors() {
      try {
        const res = await fetch("/api/doctors", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data.ok) setDoctors(data.doctors || []);
      } finally {
        if (!cancelled) setLoadingDoctors(false);
      }
    }
    loadAppointments();
    loadDoctors();
    return () => { cancelled = true; };
  }, []);

  const sidebarItems = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Appointments", icon: Calendar, href: "/dashboard/appointments" },
    { label: "Medical Records", icon: FileText, href: "/dashboard/medical-records" },
    { label: "Consultations", icon: MessageSquare, href: "/dashboard/consultations" },
    { label: "Get Card", icon: CreditCard, href: "/dashboard/card" },
    { label: "Inventory", icon: Package, href: "/dashboard/inventory" },
  ];

  function openBookingModal(doctorId) {
    setSelectedDoctorId(doctorId || "");
    setModalOpen(true);
  }

  async function bookAppointment(e) {
    e && e.preventDefault();
    if (!selectedDoctorId || !date || !time) {
      alert("Doctor, date and time are required");
      return;
    }
    setBooking(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: selectedDoctorId, date, time, notes }),
      });
      const data = await res.json();
      if (data.ok) {
        setModalOpen(false);
        setSelectedDoctorId("");
        setDate("");
        setTime("");
        setNotes("");
        // Reload appointments list
        setLoadingAppointments(true);
        const res2 = await fetch("/api/appointments", { cache: "no-store" });
        const data2 = await res2.json();
        if (data2.ok) setAppointments(data2.appointments || []);
        setLoadingAppointments(false);
      } else {
        alert(data.error || "Failed to book appointment");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to book appointment");
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <UserTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      {/* Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <UserSidebar items={sidebarItems} activeIndex={1} />
      </aside>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Appointments</h1>
            <p className="mt-1 text-sm text-zinc-600">Manage your therapy sessions</p>
          </div>
          <button
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            onClick={() => openBookingModal("")}
          >
            Book New Appointment
          </button>
        </div>

        {/* Your Appointments */}
        <div className="mt-6">
          <div className="text-lg font-semibold text-zinc-900">Your Appointments</div>
          <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-6">
            {loadingAppointments ? (
              <div className="text-zinc-600">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="text-zinc-600">No appointments scheduled yet</div>
            ) : (
              <div className="space-y-3">
                {appointments.map((ap) => (
                  <div key={ap.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
                    <div>
                      <div className="font-medium text-zinc-900">{ap.doctor?.name || "Doctor"}</div>
                      <div className="text-sm text-zinc-600">{ap.doctor?.speciality || "General"}</div>
                    </div>
                    <div className="text-sm text-zinc-700">
                      {new Date(ap.scheduledFor).toLocaleString()}
                    </div>
                    <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                      {ap.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Doctors */}
        <div className="mt-8">
          <div className="text-lg font-semibold text-zinc-900">Available Doctors</div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loadingDoctors ? (
              <div className="text-zinc-600">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="text-zinc-600">No doctors available</div>
            ) : (
              doctors.map((d) => (
                <div key={d.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <UserRound className="h-6 w-6 text-zinc-700" />
                    <div>
                      <div className="font-medium text-zinc-900">{d.name}</div>
                      <div className="text-sm text-zinc-600">{d.speciality}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                      onClick={() => openBookingModal(d.id)}
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Booking Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-zinc-900">Book Appointment</div>
                <button className="text-zinc-500" onClick={() => setModalOpen(false)}>✕</button>
              </div>
              <form className="mt-4 space-y-3" onSubmit={bookAppointment}>
                <div>
                  <label className="text-sm text-zinc-700">Doctor</label>
                  <select
                    className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} — {d.speciality}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-zinc-700">Date</label>
                    <input
                      type="date"
                      className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-700">Time</label>
                    <input
                      type="time"
                      className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-zinc-700">Notes</label>
                  <textarea
                    className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="button" className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" disabled={booking} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                    {booking ? "Booking..." : "Book"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
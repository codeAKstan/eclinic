"use client";

import { useEffect, useState } from "react";
import DoctorTopbar from "../components/DoctorTopbar";
import DoctorSidebar from "../components/DoctorSidebar";
import { Home, Calendar, Users, FileText, MessageSquare, Star } from "lucide-react";

export default function DoctorDashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.ok) setProfile(data.user);
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadAppointments() {
      try {
        const res = await fetch("/api/doctor/appointments", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.ok && Array.isArray(data.appointments)) {
          setAppointments(data.appointments);
        }
      } catch (e) {
        console.error("Load doctor appointments error", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAppointments();
    return () => { cancelled = true; };
  }, []);

  const sidebarItems = [
    { label: "Dashboard", icon: Home, href: "/doctor" },
    { label: "Appointments", icon: Calendar, href: "/doctor/appointments" },
    { label: "Patient Records", icon: Users, href: "/doctor/patients" },
    { label: "Consultations", icon: MessageSquare, href: "/doctor/consultations" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <DoctorTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <span className="text-sm font-semibold text-zinc-900">Menu</span>
              <button
                className="inline-flex items-center justify-center rounded-md p-2 text-zinc-700 hover:bg-zinc-100"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                ×
              </button>
            </div>
            <DoctorSidebar items={sidebarItems} activeIndex={0} onItemClick={() => setMobileOpen(false)} className="space-y-1 p-3" />
          </div>
        </>
      )}

      {/* Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <DoctorSidebar items={sidebarItems} activeIndex={0} />
      </aside>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <h1 className="text-3xl font-bold text-zinc-900">
          {profile?.name ? `Dr. ${profile.name}'s Dashboard` : "Doctor Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">Manage appointments, records, and consultations</p>

        {/* Stats cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(() => {
            const today = new Date();
            const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
            const todays = appointments.filter(ap => ap.scheduledFor && isSameDay(new Date(ap.scheduledFor), today));
            const todayCount = todays.length;
            const upcomingCount = appointments.filter(ap => ["scheduled", "approved", "rescheduled"].includes(ap.status)).length;
            const completedCount = appointments.filter(ap => ap.status === "completed").length;
            return (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div className="text-sm font-medium text-zinc-900">Today's Appointments</div>
                </div>
                <div className="mt-3 text-4xl font-semibold">{loading ? "—" : todayCount}</div>
                <div className="mt-1 text-xs text-zinc-500">{loading ? "Loading" : `${upcomingCount} upcoming, ${completedCount} completed`}</div>
              </div>
            );
          })()}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="text-sm font-medium text-zinc-900">Active Patients</div>
            </div>
            {(() => {
              const uniquePatients = new Set(appointments.map(ap => ap.patientId).filter(Boolean));
              return (
                <>
                  <div className="mt-3 text-4xl font-semibold">{loading ? "—" : uniquePatients.size}</div>
                  <div className="mt-1 text-xs text-zinc-500">All time</div>
                </>
              );
            })()}
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="text-sm font-medium text-zinc-900">Records Updated</div>
            </div>
            {(() => {
              const now = new Date();
              const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
              const updated = appointments.filter(ap => ap.consultation && ap.consultation.updatedAt && new Date(ap.consultation.updatedAt) >= weekAgo);
              return (
                <>
                  <div className="mt-3 text-4xl font-semibold">{loading ? "—" : updated.length}</div>
                  <div className="mt-1 text-xs text-zinc-500">This week</div>
                </>
              );
            })()}
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div className="text-sm font-medium text-zinc-900">Average Rating</div>
            </div>
            {(() => {
              const ratings = appointments.map(ap => ap.feedback?.rating).filter((r) => typeof r === "number" && r > 0);
              const count = ratings.length;
              const avg = count ? (ratings.reduce((sum, r) => sum + r, 0) / count).toFixed(1) : "—";
              return (
                <>
                  <div className="mt-3 flex items-baseline gap-2">
                    <div className="text-4xl font-semibold">{avg}</div>
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">{loading ? "Loading" : `Based on ${count} reviews`}</div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Today's schedule */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900">Today's Schedule</h2>
          <div className="mt-4 space-y-4">
            {(() => {
              const today = new Date();
              const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
              const todays = appointments
                .filter(ap => ap.scheduledFor && isSameDay(new Date(ap.scheduledFor), today))
                .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
              if (loading) return (
                <div className="text-sm text-zinc-500">Loading schedule…</div>
              );
              if (!todays.length) return (
                <div className="text-sm text-zinc-500">No scheduled appointments today.</div>
              );
              return todays.map((ap) => {
                const d = new Date(ap.scheduledFor);
                const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                const statusLabel = ap.status === "completed" ? "Completed" : "Upcoming";
                return (
                  <div key={ap.id} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5">
                    <div>
                      <div className="text-lg font-semibold text-zinc-900">{ap.patient?.name || "Unknown"}</div>
                      <div className="text-sm text-zinc-600">{ap.notes || "Consultation"}</div>
                      <div className="text-sm text-zinc-700">{time}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">{statusLabel}</span>
                      <a href="/doctor/consultations" className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">Start</a>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Patient Feedback */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900">Patient Feedback</h2>
          <div className="mt-4 space-y-4">
            {(() => {
              const feedbackItems = appointments
                .filter(ap => ap.feedback && ap.feedback.rating)
                .map(ap => ({
                  name: ap.patient?.name || "Unknown",
                  text: ap.feedback?.comments || "",
                  date: ap.feedback?.createdAt ? new Date(ap.feedback.createdAt).toLocaleDateString() : "",
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date));
              if (loading) return <div className="text-sm text-zinc-500">Loading feedback…</div>;
              if (!feedbackItems.length) return <div className="text-sm text-zinc-500">No feedback yet.</div>;
              return feedbackItems.map((f, idx) => (
                <div key={idx} className="flex items-start justify-between rounded-2xl border border-zinc-200 bg-white p-5">
                  <div>
                    <div className="text-lg font-semibold text-zinc-900">{f.name}</div>
                    <div className="mt-2 text-zinc-600">{f.text}</div>
                  </div>
                  <div className="text-sm text-zinc-500">{f.date}</div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
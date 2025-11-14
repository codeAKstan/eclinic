"use client";

import { useEffect, useMemo, useState } from "react";
import UserTopbar from "../components/UserTopbar";
import UserSidebar from "../components/UserSidebar";
import { Home, Calendar, FileText, MessageSquare, Star, CreditCard } from "lucide-react";

export default function UserDashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/appointments", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && res.ok && data.ok) {
          setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
        }
      } catch (e) {
        if (!cancelled) setError("Failed to load appointments");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const sidebarItems = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Appointments", icon: Calendar, href: "/dashboard/appointments" },
    { label: "Medical Records", icon: FileText, href: "/dashboard/medical-records" },
    { label: "Consultations", icon: MessageSquare, href: "/dashboard/consultations" },
    { label: "Get Card", icon: CreditCard, href: "/dashboard/card" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <UserTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      {/* Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <UserSidebar items={sidebarItems} activeIndex={0} />
      </aside>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <h1 className="text-2xl font-semibold text-zinc-900">Welcome back!</h1>
        <p className="mt-1 text-sm text-zinc-600">Manage your appointments and health records</p>

        {/* Stats cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-900">Upcoming Appointments</div>
              <Calendar className="h-5 w-5 text-zinc-500" />
            </div>
            {(() => {
              const upcoming = appointments.filter(ap => ["scheduled", "approved", "rescheduled"].includes(ap.status));
              const next = upcoming
                .filter(ap => ap.scheduledFor)
                .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))[0];
              const nextText = next ? new Date(next.scheduledFor).toLocaleString() : "No upcoming";
              return (
                <>
                  <div className="mt-3 text-3xl font-semibold">{loading ? "—" : upcoming.length}</div>
                  <div className="mt-1 text-xs text-zinc-500">{loading ? "Loading" : `Next: ${nextText}`}</div>
                </>
              );
            })()}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-900">Past Consultations</div>
              <MessageSquare className="h-5 w-5 text-zinc-500" />
            </div>
            {(() => {
              const past = appointments.filter(ap => ap.status === "completed");
              return (
                <>
                  <div className="mt-3 text-3xl font-semibold">{loading ? "—" : past.length}</div>
                  <div className="mt-1 text-xs text-zinc-500">{loading ? "Loading" : "Completed successfully"}</div>
                </>
              );
            })()}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-900">Health Score</div>
              <Star className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="mt-3 text-3xl font-semibold">—</div>
            <div className="mt-1 text-xs text-zinc-500">Coming soon</div>
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">Upcoming Appointments</h2>
            <a href="/dashboard/appointments" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">+ Book Appointment</a>
          </div>
          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
            {loading ? (
              <div className="text-sm text-zinc-600">Loading appointments…</div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : (
              <div className="space-y-4">
                {appointments.filter(ap => ["scheduled", "approved", "rescheduled"].includes(ap.status)).length === 0 ? (
                  <div className="text-sm text-zinc-600">No upcoming appointments</div>
                ) : (
                  appointments
                    .filter(ap => ["scheduled", "approved", "rescheduled"].includes(ap.status))
                    .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))
                    .slice(0, 3)
                    .map((ap) => {
                      const dt = new Date(ap.scheduledFor);
                      const time = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                      const date = dt.toLocaleDateString();
                      return (
                        <div key={ap.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-zinc-900">{ap.doctor?.name || "Doctor"}</div>
                            <div className="text-sm text-zinc-600">{ap.doctor?.speciality || "Consultation"}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-zinc-500">{date} • {time}</div>
                            <a href="/dashboard/consultations" className="mt-2 inline-block rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">View</a>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Consultations */}
        <div className="mt-8" id="consultations">
          <h2 className="text-lg font-semibold text-zinc-900">Consultation History</h2>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-sm text-zinc-600">Loading consultations…</div>
            ) : (
              appointments
                .filter(ap => ap.status === "completed")
                .sort((a, b) => new Date(b.scheduledFor) - new Date(a.scheduledFor))
                .slice(0, 5)
                .map((ap) => {
                  const dt = new Date(ap.scheduledFor);
                  return (
                    <div key={ap.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-zinc-900">{ap.doctor?.name || "Doctor"}</div>
                          <div className="text-sm text-zinc-600">{ap.notes || ap.doctor?.speciality || "Consultation"}</div>
                        </div>
                        <a href="/dashboard/consultations" className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">Leave Feedback</a>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                        <span>{dt.toLocaleDateString()}</span>
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">completed</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
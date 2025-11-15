"use client";

import { useEffect, useMemo, useState } from "react";
import AdminTopbar from "../../components/AdminTopbar";
import AdminSidebar from "../../components/AdminSidebar";
import { Home, Calendar, Users, Package, BarChart3, UserPlus, RefreshCw, Search } from "lucide-react";

export default function AdminAppointmentsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const sidebarItems = [
    { label: "Dashboard", icon: Home, href: "/admin" },
    { label: "Appointments", icon: Calendar, href: "/admin/appointments" },
    { label: "Manage Users", icon: Users, href: "/admin/manage-users" },
    { label: "Add Doctors", icon: UserPlus, href: "/admin/add-doctor" },
    { label: "Inventory", icon: Package, href: "/admin/inventory" },
    { label: "Reports", icon: BarChart3, href: "/admin#reports" },
  ];

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/appointments", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load appointments");
        setAppointments([]);
      } else {
        setAppointments(data.appointments || []);
      }
    } catch (e) {
      setError("Network error");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter((a) =>
      (a.user?.name || "").toLowerCase().includes(q) ||
      (a.user?.email || "").toLowerCase().includes(q) ||
      (a.doctor?.name || "").toLowerCase().includes(q) ||
      (a.doctor?.speciality || "").toLowerCase().includes(q) ||
      (a.status || "").toLowerCase().includes(q) ||
      (a.mode || "").toLowerCase().includes(q)
    );
  }, [appointments, query]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <AdminTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

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
            <AdminSidebar items={sidebarItems} activeIndex={1} onItemClick={() => setMobileOpen(false)} className="space-y-1 p-3" />
          </div>
        </>
      )}

      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <AdminSidebar items={sidebarItems} activeIndex={1} />
      </aside>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">All Appointments</h1>
            <p className="mt-1 text-sm text-zinc-600">Search and review every appointment across the system</p>
          </div>
          <button
            onClick={loadAppointments}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="relative w-full max-w-xl">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by doctor, patient, status, or mode..."
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                {["Doctor","Patient","Date & Time","Mode","Status","Notes"].map((h) => (
                  <th key={h} className="px-5 py-2 text-left font-medium text-zinc-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {loading ? (
                <tr><td className="px-5 py-4 text-zinc-600" colSpan={6}>Loading...</td></tr>
              ) : error ? (
                <tr><td className="px-5 py-4 text-red-600" colSpan={6}>{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-5 py-4 text-zinc-600" colSpan={6}>No appointments found.</td></tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-3 text-zinc-900">
                      <div className="font-medium">{a.doctor?.name || "—"}</div>
                      <div className="text-xs text-zinc-500">{a.doctor?.speciality || ""}</div>
                    </td>
                    <td className="px-5 py-3 text-zinc-900">
                      <div className="font-medium">{a.user?.name || "—"}</div>
                      <div className="text-xs text-zinc-500">{a.user?.email || ""}</div>
                    </td>
                    <td className="px-5 py-3 text-zinc-900">{a.scheduledFor ? new Date(a.scheduledFor).toLocaleString() : "—"}</td>
                    <td className="px-5 py-3 text-zinc-900">{a.mode || "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${
                          a.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : a.status === "cancelled"
                            ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                            : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-900">{a.notes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-zinc-600">Showing {filtered.length} of {appointments.length} appointments</p>
      </div>
    </div>
  );
}
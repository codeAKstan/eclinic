"use client";

import { useEffect, useMemo, useState } from "react";
import DoctorTopbar from "../../components/DoctorTopbar";
import DoctorSidebar from "../../components/DoctorSidebar";
import { Home, Calendar, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DoctorPatientsIndexPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const router = useRouter();

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/doctor/appointments", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load patients");
      } else {
        setAppointments(data.appointments || []);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const sidebarItems = useMemo(() => ([
    { label: "Dashboard", icon: Home, href: "/doctor" },
    { label: "Appointments", icon: Calendar, href: "/doctor/appointments" },
    { label: "Patient Records", icon: Users, href: "/doctor/patients" },
  ]), []);

  const patients = useMemo(() => {
    const map = new Map();
    for (const ap of appointments) {
      const p = ap.patient;
      if (!p || !p.id) continue;
      if (!map.has(p.id)) {
        map.set(p.id, { id: p.id, name: p.name || "—", email: p.email || "", contactNumber: p.contactNumber || "", upcoming: null });
      }
      // track earliest upcoming approved appointment
      try {
        const dt = new Date(ap.scheduledFor);
        const curr = map.get(p.id).upcoming;
        if (ap.status === "approved" && (!curr || dt < curr)) {
          map.get(p.id).upcoming = dt;
        }
      } catch {}
    }
    let arr = Array.from(map.values());
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(x => (x.name.toLowerCase().includes(q) || x.email.toLowerCase().includes(q)));
    }
    return arr.sort((a,b) => (a.name || "").localeCompare(b.name || ""));
  }, [appointments, query]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <DoctorTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <DoctorSidebar items={sidebarItems} activeIndex={2} />
      </aside>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-zinc-700" />
          <h1 className="text-2xl font-semibold text-zinc-900">Patient Records</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600">Browse patients and open their medical records</p>

        <div className="mt-6 flex items-center gap-3">
          <input
            className="w-full max-w-md rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black"
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {loading ? (
            <div className="px-5 py-6 text-sm text-zinc-500">Loading patients…</div>
          ) : error ? (
            <div className="px-5 py-6 text-sm text-red-600">{error}</div>
          ) : patients.length === 0 ? (
            <div className="px-5 py-6 text-sm text-zinc-500">No patients found</div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-zinc-200 text-xs text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Upcoming</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-zinc-900">
                {patients.map(p => (
                  <tr key={p.id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="px-5 py-3">{p.name}</td>
                    <td className="px-5 py-3">{p.email || "—"}</td>
                    <td className="px-5 py-3">{p.contactNumber || "—"}</td>
                    <td className="px-5 py-3">{p.upcoming ? p.upcoming.toLocaleString() : "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                          onClick={() => router.push(`/doctor/patients/${p.id}`)}
                        >
                          View Records
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
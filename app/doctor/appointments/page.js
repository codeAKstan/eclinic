"use client";

import { useEffect, useMemo, useState } from "react";
import DoctorTopbar from "../../components/DoctorTopbar";
import DoctorSidebar from "../../components/DoctorSidebar";
import { Calendar, Home, Users, MessageSquare, Search, CheckCircle, XCircle, Eye } from "lucide-react";

export default function DoctorAppointmentsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleAp, setRescheduleAp] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const [approveOpen, setApproveOpen] = useState(false);
  const [approveAp, setApproveAp] = useState(null);
  const [approveMode, setApproveMode] = useState("physical");

  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");
  const [viewPatient, setViewPatient] = useState(null);

  async function loadAppointments() {
    try {
      setLoading(true);
      const res = await fetch("/api/doctor/appointments", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load appointments");
      } else {
        setAppointments(data.appointments || []);
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAppointments(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter((ap) =>
      (ap.patient?.name || "").toLowerCase().includes(q) ||
      (ap.notes || "").toLowerCase().includes(q)
    );
  }, [appointments, query]);

  async function performAction(id, action, extra = {}) {
    try {
      setActionBusy(true);
      const res = await fetch("/api/doctor/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "Failed to update appointment");
      } else {
        await loadAppointments();
      }
    } catch {
      alert("Network error");
    } finally {
      setActionBusy(false);
    }
  }

  function openReschedule(ap) {
    setRescheduleAp(ap);
    const d = new Date(ap.scheduledFor);
    const yyyyMmDd = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    setRescheduleDate(yyyyMmDd);
    setRescheduleTime(`${hh}:${mm}`);
    setRescheduleOpen(true);
  }

  async function submitReschedule() {
    if (!rescheduleAp) return;
    if (!rescheduleDate || !rescheduleTime) {
      alert("Please select date and time");
      return;
    }
    await performAction(rescheduleAp.id, "reschedule", { date: rescheduleDate, time: rescheduleTime });
    setRescheduleOpen(false);
    setRescheduleAp(null);
  }

  function openApprove(ap) {
    setApproveAp(ap);
    setApproveMode("physical");
    setApproveOpen(true);
  }

  async function submitApprove() {
    if (!approveAp) return;
    await performAction(approveAp.id, "approve", { mode: approveMode });
    setApproveOpen(false);
    setApproveAp(null);
  }

  async function openView(ap) {
    if (!ap.patientId) return;
    setViewOpen(true);
    setViewLoading(true);
    setViewError("");
    setViewPatient(null);
    try {
      const res = await fetch(`/api/doctor/patients/${ap.patientId}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setViewError(data.error || "Failed to load patient");
      } else {
        setViewPatient(data.patient);
      }
    } catch {
      setViewError("Network error");
    } finally {
      setViewLoading(false);
    }
  }

  const sidebarItems = [
    { label: "Dashboard", icon: Home, href: "/doctor" },
    { label: "Appointments", icon: Calendar, href: "/doctor/appointments" },
    { label: "Consultations", icon: MessageSquare, href: "/doctor/consultations" },
    { label: "Patient Records", icon: Users, href: "/doctor#records" },
  ];

  function StatusBadge({ status }) {
    const map = {
      scheduled: { text: "Scheduled", cls: "bg-blue-50 text-blue-700" },
      approved: { text: "Approved", cls: "bg-green-50 text-green-700" },
      rescheduled: { text: "Rescheduled", cls: "bg-amber-50 text-amber-700" },
      completed: { text: "Completed", cls: "bg-green-50 text-green-700" },
      cancelled: { text: "Cancelled", cls: "bg-red-50 text-red-700" },
    };
    const info = map[status] || map.scheduled;
    return <span className={`rounded-full px-3 py-1 text-sm font-medium ${info.cls}`}>{info.text}</span>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <DoctorTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      {/* Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <DoctorSidebar items={sidebarItems} activeIndex={1} />
      </aside>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Appointments</h1>
            <p className="mt-1 text-sm text-zinc-600">Manage your upcoming and past appointments</p>
          </div>
          <button
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            onClick={loadAppointments}
          >
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="mt-6">
          <label className="text-sm font-medium text-zinc-900" htmlFor="search">Search</label>
          <div className="mt-1 flex items-center gap-2">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by patient or notes"
                className="w-full rounded-lg border border-zinc-300 bg-white pl-8 pr-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {loading ? (
            <div className="px-5 py-6 text-sm text-zinc-500">Loading appointments…</div>
          ) : error ? (
            <div className="px-5 py-6 text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-6 text-sm text-zinc-500">No appointments found</div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-zinc-200 text-xs text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Scheduled For</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Notes</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-zinc-900">
                {filtered.map((ap) => (
                  <tr key={ap.id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="px-5 py-3">
                      <div className="font-medium">{ap.patient?.name || "—"}</div>
                      <div className="text-xs text-zinc-500">{ap.patient?.contactNumber || ap.patient?.email || ""}</div>
                    </td>
                    <td className="px-5 py-3">{new Date(ap.scheduledFor).toLocaleString()}</td>
                    <td className="px-5 py-3"><StatusBadge status={ap.status} /></td>
                    <td className="px-5 py-3">{ap.notes || ""}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {ap.status === "approved" && (
                          <button
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                            onClick={() => openView(ap)}
                          >
                            <Eye className="h-4 w-4 text-zinc-700" /> View
                          </button>
                        )}
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                          onClick={() => openApprove(ap)}
                          disabled={actionBusy || ap.status === "approved" || ap.status === "cancelled"}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" /> Approve
                        </button>
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                          onClick={() => openReschedule(ap)}
                          disabled={actionBusy || ap.status === "cancelled" || ap.status === "approved"}
                        >
                          <Calendar className="h-4 w-4 text-amber-600" /> Reschedule
                        </button>
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                          onClick={() => performAction(ap.id, "cancel")}
                          disabled={actionBusy || ap.status === "cancelled" || ap.status === "approved"}
                        >
                          <XCircle className="h-4 w-4 text-red-600" /> Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {rescheduleOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">Reschedule Appointment</h2>
                <button className="text-zinc-600" onClick={() => setRescheduleOpen(false)}>×</button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-900" htmlFor="rs-date">New Date</label>
                  <input
                    id="rs-date"
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-900" htmlFor="rs-time">New Time</label>
                  <input
                    id="rs-time"
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  onClick={() => setRescheduleOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
                  onClick={submitReschedule}
                  disabled={actionBusy}
                >
                  <Calendar className="h-4 w-4" /> Save
                </button>
              </div>
            </div>
          </div>
        )}

        {approveOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">Approve Appointment</h2>
                <button className="text-zinc-600" onClick={() => setApproveOpen(false)}>×</button>
              </div>
              <div className="mt-4 space-y-4">
                <p className="text-sm text-zinc-700">Select appointment mode:</p>
                <div className="flex gap-3">
                  <button
                    className={`px-3 py-2 rounded border ${approveMode === "physical" ? "bg-green-600 text-white border-green-600" : "bg-white border-zinc-300 text-zinc-900"}`}
                    onClick={() => setApproveMode("physical")}
                  >
                    Physical
                  </button>
                  <button
                    className={`px-3 py-2 rounded border ${approveMode === "online" ? "bg-green-600 text-white border-green-600" : "bg-white border-zinc-300 text-zinc-900"}`}
                    onClick={() => setApproveMode("online")}
                  >
                    Online
                  </button>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  onClick={() => setApproveOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                  onClick={submitApprove}
                  disabled={actionBusy}
                >
                  <CheckCircle className="h-4 w-4" /> Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {viewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">Patient Details</h2>
                <button className="text-zinc-600" onClick={() => setViewOpen(false)}>×</button>
              </div>
              <div className="mt-4">
                {viewLoading ? (
                  <div className="text-sm text-zinc-600">Loading…</div>
                ) : viewError ? (
                  <div className="text-sm text-red-600">{viewError}</div>
                ) : viewPatient ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-zinc-500">Name</div>
                        <div className="text-sm font-medium text-zinc-900">{viewPatient.name || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Email</div>
                        <div className="text-sm text-zinc-900">{viewPatient.email || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Contact Number</div>
                        <div className="text-sm text-zinc-900">{viewPatient.contactNumber || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Gender</div>
                        <div className="text-sm text-zinc-900">{viewPatient.gender || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Date of Birth</div>
                        <div className="text-sm text-zinc-900">{viewPatient.dateOfBirth ? new Date(viewPatient.dateOfBirth).toLocaleDateString() : "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Blood Group</div>
                        <div className="text-sm text-zinc-900">{viewPatient.bloodGroup || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Genotype</div>
                        <div className="text-sm text-zinc-900">{viewPatient.genotype || "—"}</div>
                      </div>
                    </div>
                    {Array.isArray(viewPatient.medicalRecords) && viewPatient.medicalRecords.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-zinc-900">Medical Records</div>
                        <div className="mt-2 divide-y divide-zinc-200 rounded-lg border border-zinc-200">
                          {viewPatient.medicalRecords.map((r, idx) => (
                            <div key={idx} className="px-3 py-2">
                              <div className="text-sm font-medium text-zinc-900">{r.recordType}</div>
                              <div className="text-sm text-zinc-600">{r.notes || ""}</div>
                              <div className="text-xs text-zinc-400">{r.recordedAt ? new Date(r.recordedAt).toLocaleString() : ""}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-600">No details available.</div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  onClick={() => setViewOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
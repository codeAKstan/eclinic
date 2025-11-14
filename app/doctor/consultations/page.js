"use client";

import { useEffect, useMemo, useState } from "react";
import DoctorTopbar from "../../components/DoctorTopbar";
import DoctorSidebar from "../../components/DoctorSidebar";
import { Home, Calendar, Users, MessageSquare, Video, ClipboardList, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DoctorConsultationsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formAp, setFormAp] = useState(null);
  const [presentingSymptoms, setPresentingSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [files, setFiles] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  function isSameDay(dateA, dateB) {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/doctor/appointments", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load consultations");
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
    { label: "Consultations", icon: MessageSquare, href: "/doctor/consultations" },
    { label: "Patient Records", icon: Users, href: "/doctor#records" },
  ]), []);

  function openForm(ap) {
    setFormAp(ap);
    setPresentingSymptoms("");
    setDiagnosis("");
    setPrescription("");
    setAdvice("");
    setFollowUpDate("");
    setFiles([]);
    setCompleted(false);
    setFormOpen(true);
  }

  async function submitConsultation() {
    if (!formAp) return;
    try {
      setSaving(true);
      const form = new FormData();
      form.append("appointmentId", formAp.id);
      form.append("presentingSymptoms", presentingSymptoms);
      form.append("diagnosis", diagnosis);
      form.append("prescription", prescription);
      form.append("advice", advice);
      if (followUpDate) form.append("followUpDate", followUpDate);
      form.append("completed", completed ? "true" : "false");
      for (const f of files) form.append("files", f);
      const res = await fetch("/api/consultations", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "Failed to save consultation");
      } else {
        setFormOpen(false);
        await load();
      }
    } catch {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <DoctorTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <DoctorSidebar items={sidebarItems} activeIndex={2} />
      </aside>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-zinc-700" />
          <h1 className="text-2xl font-semibold text-zinc-900">Consultations</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600">Manage online consultations and fill consultation forms</p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {loading ? (
            <div className="px-5 py-6 text-sm text-zinc-500">Loading consultations…</div>
          ) : error ? (
            <div className="px-5 py-6 text-sm text-red-600">{error}</div>
          ) : appointments.length === 0 ? (
            <div className="px-5 py-6 text-sm text-zinc-500">No consultations found</div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-zinc-200 text-xs text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-zinc-900">
                {appointments.map((ap) => {
                  const dt = new Date(ap.scheduledFor);
                  const isToday = isSameDay(dt, new Date());
                  const typeText = ap.mode === "online" ? "Video" : "Physical";
                  const canStart = ap.mode === "online" && ap.status === "approved" && isToday;
                  const canOpenForm = ap.status === "approved" && isToday;
                  return (
                    <tr key={ap.id} className="border-b border-zinc-100 last:border-b-0">
                      <td className="px-5 py-3">{ap.patient?.name || "—"}</td>
                      <td className="px-5 py-3">{dt.toLocaleString()}</td>
                      <td className="px-5 py-3">{typeText}</td>
                      <td className="px-5 py-3">{ap.status}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {ap.mode === "online" && (
                            <button
                              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                              disabled={!canStart}
                              title={canStart ? "Start consultation" : "Available on meeting day when approved"}
                              onClick={() => router.push("/doctor/appointments")}
                            >
                              <Video className="h-4 w-4 text-blue-600" /> Start Consultation
                            </button>
                          )}
                          <button
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                            disabled={!canOpenForm}
                            title={canOpenForm ? "Open consultation form" : "Available on meeting day when approved"}
                            onClick={() => openForm(ap)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" /> Consultation Form
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-zinc-900">Consultation Form</div>
                <button className="text-zinc-600" onClick={() => setFormOpen(false)}>×</button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm text-zinc-700">Presenting Symptoms</label>
                  <textarea className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" rows={3} value={presentingSymptoms} onChange={(e) => setPresentingSymptoms(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-zinc-700">Diagnosis</label>
                  <textarea className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" rows={3} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-zinc-700">Prescription / Medication</label>
                  <textarea className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" rows={3} value={prescription} onChange={(e) => setPrescription(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-zinc-700">Advice</label>
                  <textarea className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" rows={3} value={advice} onChange={(e) => setAdvice(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-zinc-700">Follow-up Date</label>
                    <input type="date" className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-700">Upload Files</label>
                    <input type="file" multiple className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input id="completed" type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
                  <label htmlFor="completed" className="text-sm text-zinc-700">Consultation Completed</label>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50" onClick={() => setFormOpen(false)}>Cancel</button>
                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50" onClick={submitConsultation} disabled={saving}>
                  {saving ? "Saving…" : (completed ? "Mark Consultation as Complete" : "Save Consultation")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import UserTopbar from "../../components/UserTopbar";
import UserSidebar from "../../components/UserSidebar";
import { Home, Calendar, FileText, MessageSquare, CreditCard, UserRound, Video, CheckCircle, Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConsultationsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackAp, setFeedbackAp] = useState(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [report, setReport] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  async function loadAppointments() {
    try {
      setLoading(true);
      const res = await fetch("/api/appointments", { cache: "no-store" });
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

  useEffect(() => { loadAppointments(); }, []);

  const sidebarItems = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Appointments", icon: Calendar, href: "/dashboard/appointments" },
    { label: "Consultations", icon: MessageSquare, href: "/dashboard/consultations" },
    { label: "Medical Records", icon: FileText, href: "/dashboard/medical-records" },
    { label: "Card", icon: CreditCard, href: "/dashboard/card" },
    { label: "Inventory", icon: Package, href: "/dashboard/inventory" },
    // { label: "Profile", icon: UserRound, href: "/dashboard#profile" },
  ];

  function Badge({ status }) {
    const map = {
      scheduled: { text: "Pending", cls: "bg-amber-50 text-amber-700" },
      approved: { text: "Approved", cls: "bg-blue-50 text-blue-700" },
      rescheduled: { text: "Rescheduled", cls: "bg-amber-50 text-amber-700" },
      completed: { text: "Completed", cls: "bg-green-50 text-green-700" },
      cancelled: { text: "Cancelled", cls: "bg-red-50 text-red-700" },
    };
    const info = map[status] || map.scheduled;
    return <span className={`rounded-full px-3 py-1 text-sm font-medium ${info.cls}`}>{info.text}</span>;
  }

  function isSameDay(dateA, dateB) {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function openFeedback(ap) {
    setFeedbackAp(ap);
    setRating(0);
    setComments("");
    setReport(false);
    setFeedbackOpen(true);
  }

  async function submitFeedback() {
    if (!feedbackAp || rating < 1) {
      alert("Please rate the session");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: feedbackAp.id, rating, comments, report }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "Failed to submit feedback");
      } else {
        setFeedbackOpen(false);
      }
    } catch {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <UserTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <UserSidebar items={sidebarItems} activeIndex={2} />
      </aside>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">My Consultations</h1>
          <p className="mt-1 text-sm text-zinc-600">Manage and track all your medical appointments</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {loading ? (
            <div className="px-5 py-6 text-sm text-zinc-500">Loading consultations…</div>
          ) : error ? (
            <div className="px-5 py-6 text-sm text-red-600">{error}</div>
          ) : appointments.length === 0 ? (
            <div className="px-5 py-6 text-sm text-zinc-500">No consultations yet</div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-zinc-200 text-xs text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Doctor</th>
                  <th className="px-5 py-3">Specialty</th>
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
                  const canJoin = ap.mode === "online" && ap.status === "approved" && isToday;
                  const canFeedback = isToday; // Enable feedback only on the meeting day
                  return (
                    <tr key={ap.id} className="border-b border-zinc-100 last:border-b-0">
                      <td className="px-5 py-3">{ap.doctor?.name || "—"}</td>
                      <td className="px-5 py-3">{ap.doctor?.speciality || "—"}</td>
                      <td className="px-5 py-3">{dt.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <div className="inline-flex items-center gap-2">
                          {ap.mode === "online" ? <Video className="h-4 w-4 text-zinc-700" /> : <Calendar className="h-4 w-4 text-zinc-700" />}
                          <span>{typeText}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3"><Badge status={ap.status} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {ap.mode === "online" && (
                            <button
                              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                              onClick={() => router.push("/student/consultation")}
                              disabled={!canJoin}
                              title={canJoin ? "Join meeting" : "Available on meeting day when approved"}
                            >
                              <Video className="h-4 w-4 text-blue-600" /> Join Meeting
                            </button>
                          )}
                          <button
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                            onClick={() => openFeedback(ap)}
                            disabled={!canFeedback}
                            title={canFeedback ? "Leave feedback" : "Available on meeting day"}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" /> Feedback
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

        {feedbackOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">Session Feedback</h2>
                <button className="text-zinc-600" onClick={() => setFeedbackOpen(false)}>×</button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-sm font-medium text-zinc-900">Rate this session</div>
                  <div className="mt-2 flex gap-2">
                    {[1,2,3,4,5].map((i) => (
                      <button key={i} className={`h-8 w-8 rounded-full border ${rating >= i ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-zinc-300 text-zinc-900"}`} onClick={() => setRating(i)}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-900">Comments (Optional)</div>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Share your experience…"
                    className="mt-2 w-full min-h-[120px] rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                  />
                </div>
                <div>
                  <button
                    className="text-sm text-red-600"
                    onClick={() => setReport((r) => !r)}
                  >
                    {report ? "✓ Reported Inappropriate Behavior" : "Report Inappropriate Behavior"}
                  </button>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                  onClick={submitFeedback}
                  disabled={submitting}
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
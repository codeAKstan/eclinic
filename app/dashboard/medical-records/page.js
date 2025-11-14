"use client";

import { useEffect, useState } from "react";
import UserTopbar from "../../components/UserTopbar";
import UserSidebar from "../../components/UserSidebar";
import { Home, Calendar, FileText, MessageSquare, Star, CreditCard, ClipboardList } from "lucide-react";

export default function MedicalRecordsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  const [bloodGroup, setBloodGroup] = useState("");
  const [genotype, setGenotype] = useState("");
  const [records, setRecords] = useState([]);

  const [recordType, setRecordType] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const res = await fetch("/api/medical-records", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data.ok) {
          setBloodGroup(data.bloodGroup || "");
          setGenotype(data.genotype || "");
          setRecords(Array.isArray(data.medicalRecords) ? data.medicalRecords : []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const sidebarItems = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Appointments", icon: Calendar, href: "/dashboard#appointments" },
    { label: "Medical Records", icon: FileText, href: "/dashboard/medical-records" },
    { label: "Consultations", icon: MessageSquare, href: "/dashboard/consultations" },
    { label: "Get Card", icon: CreditCard, href: "/dashboard/card" },
  ];

  async function saveVitals() {
    setSaving(true);
    try {
      const res = await fetch("/api/medical-records", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bloodGroup, genotype }),
      });
      const data = await res.json();
      if (!data.ok) {
        alert(data.error || "Failed to save");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function addRecord(e) {
    e && e.preventDefault();
    if (!recordType.trim()) {
      alert("Please enter a record type");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordType: recordType.trim(), notes }),
      });
      const data = await res.json();
      if (data.ok) {
        setRecords(Array.isArray(data.medicalRecords) ? data.medicalRecords : []);
        setRecordType("");
        setNotes("");
      } else {
        alert(data.error || "Failed to add record");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to add record");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <UserTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      {/* Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <UserSidebar items={sidebarItems} activeIndex={2} />
      </aside>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-zinc-700" />
          <h1 className="text-2xl font-semibold text-zinc-900">Medical Records</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600">Add and view your medical history</p>

        {/* Blood group & genotype */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-medium text-zinc-900">Blood Group</div>
            <select
              className="mt-2 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              <option value="">Select</option>
              {[
                "A+","A-","B+","B-","AB+","AB-","O+","O-",
              ].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-medium text-zinc-900">Genotype</div>
            <select
              className="mt-2 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              value={genotype}
              onChange={(e) => setGenotype(e.target.value)}
            >
              <option value="">Select</option>
              {["AA","AS","SS","AC","SC","CC"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            onClick={saveVitals}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Add record */}
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-lg font-semibold text-zinc-900">Add Medical Record</div>
          <form className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={addRecord}>
            <div>
              <label className="text-sm text-zinc-700">Record Type</label>
              <input
                type="text"
                className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                placeholder="e.g., Lab test, Prescription"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-zinc-700">Notes</label>
              <textarea
                className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                rows={4}
                placeholder="Enter details"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                disabled={adding}
              >
                {adding ? "Adding..." : "+ Add Record"}
              </button>
            </div>
          </form>
        </div>

        {/* Records list */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">Your Records</h2>
            {!loading && records.length === 0 && (
              <span className="text-sm text-zinc-500">No records yet</span>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-sm text-zinc-600">Loading records...</div>
            ) : (
              records.map((rec, idx) => (
                <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-zinc-900">{rec.recordType}</div>
                      {rec.notes && <div className="text-sm text-zinc-600">{rec.notes}</div>}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {rec.recordedAt ? new Date(rec.recordedAt).toLocaleString() : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
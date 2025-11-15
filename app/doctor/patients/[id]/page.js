"use client";

import { useEffect, useMemo, useState } from "react";
import DoctorTopbar from "../../../components/DoctorTopbar";
import DoctorSidebar from "../../../components/DoctorSidebar";
import { Home, Calendar, Users, FileText } from "lucide-react";
import { useParams } from "next/navigation";

export default function DoctorPatientDetailPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useParams();
  const id = params?.id;

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/doctor/patients/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load patient");
      } else {
        setPatient(data.patient);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  const sidebarItems = useMemo(() => ([
    { label: "Dashboard", icon: Home, href: "/doctor" },
    { label: "Appointments", icon: Calendar, href: "/doctor/appointments" },
    { label: "Patient Records", icon: Users, href: "/doctor/patients" },
  ]), []);

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
            <DoctorSidebar items={sidebarItems} activeIndex={2} onItemClick={() => setMobileOpen(false)} className="space-y-1 p-3" />
          </div>
        </>
      )}

      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <DoctorSidebar items={sidebarItems} activeIndex={2} />
      </aside>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-zinc-700" />
          <h1 className="text-2xl font-semibold text-zinc-900">Patient Record</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600">View patient details and medical records</p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {loading ? (
            <div className="px-5 py-6 text-sm text-zinc-500">Loading…</div>
          ) : error ? (
            <div className="px-5 py-6 text-sm text-red-600">{error}</div>
          ) : !patient ? (
            <div className="px-5 py-6 text-sm text-zinc-500">No data</div>
          ) : (
            <div className="px-5 py-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-zinc-500">Name</div>
                  <div className="text-sm text-zinc-900">{patient.name || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Email</div>
                  <div className="text-sm text-zinc-900">{patient.email || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Contact</div>
                  <div className="text-sm text-zinc-900">{patient.contactNumber || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">DOB</div>
                  <div className="text-sm text-zinc-900">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Gender</div>
                  <div className="text-sm text-zinc-900">{patient.gender || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Blood Group</div>
                  <div className="text-sm text-zinc-900">{patient.bloodGroup || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Genotype</div>
                  <div className="text-sm text-zinc-900">{patient.genotype || "—"}</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-zinc-700" />
                  <div className="text-lg font-medium text-zinc-900">Medical Records</div>
                </div>

                <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200">
                  {(patient.medicalRecords || []).length === 0 ? (
                    <div className="px-4 py-4 text-sm text-zinc-500">No medical records</div>
                  ) : (
                    <table className="min-w-[700px] text-left">
                      <thead className="border-b border-zinc-200 text-xs text-zinc-500">
                        <tr>
                          <th className="px-4 py-2">Type</th>
                          <th className="px-4 py-2">Notes</th>
                          <th className="px-4 py-2">Recorded At</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-zinc-900">
                        {patient.medicalRecords.map((rec, idx) => (
                          <tr key={idx} className="border-b border-zinc-100 last:border-b-0">
                            <td className="px-4 py-2">{rec.recordType || "—"}</td>
                            <td className="px-4 py-2">{rec.notes || "—"}</td>
                            <td className="px-4 py-2">{rec.recordedAt ? new Date(rec.recordedAt).toLocaleString() : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { Mail, User, Phone, ChevronDown, Home, Calendar, Users, Package, BarChart3, UserPlus, X } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminTopbar from "../../components/AdminTopbar";

export default function AddDoctorPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [primarySpeciality, setPrimarySpeciality] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarItems = [
    { label: "Dashboard", icon: Home, href: "/admin" },
    { label: "Appointments", icon: Calendar, href: "/admin#appointments" },
    { label: "Manage Users", icon: Users, href: "/admin#users" },
    { label: "Add Doctors", icon: UserPlus, href: "/admin/add-doctor" },
    { label: "Inventory", icon: Package, href: "/admin#inventory" },
    { label: "Reports", icon: BarChart3, href: "/admin#reports" },
  ];

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!email) {
      setStatus({ type: "error", message: "Please enter an email" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, contactNumber, primarySpeciality }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({ type: "error", message: data.error || "Failed to create doctor" });
      } else {
        setStatus({
          type: "success",
          message: data.emailSent
            ? "Doctor account created. Email with temporary password sent."
            : "Doctor account created. Email delivery failed — please share the temporary password manually.",
        });
        setName("");
        setEmail("");
        setContactNumber("");
        setPrimarySpeciality("");
      }
    } catch (err) {
      setStatus({ type: "error", message: "Server error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Topbar */}
      <AdminTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <span className="text-sm font-semibold text-zinc-900">Menu</span>
              <button
                className="inline-flex items-center justify-center rounded-md p-2 text-zinc-700 hover:bg-zinc-100"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <AdminSidebar items={sidebarItems} activeIndex={3} onItemClick={() => setMobileOpen(false)} className="space-y-1 p-3" />
          </div>
        </>
      )}

      {/* Fixed desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <AdminSidebar items={sidebarItems} activeIndex={3} />
      </aside>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-4 py-6 lg:pl-64">
        <h1 className="text-2xl font-semibold text-zinc-900">Add Doctor</h1>
        <p className="mt-1 text-sm text-zinc-600">Create a doctor account and send a temporary password by email.</p>

        <form onSubmit={submit} className="mt-6 space-y-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          {/* Personal info */}
          <div>
            <h2 className="text-base font-semibold text-zinc-800">Personal info</h2>
            <div className="mt-3 space-y-4">
              {/* Name */}
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              {/* Email */}
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>
              {/* Contact Number */}
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Contact Number"
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Primary Speciality */}
          <div>
            <label className="block text-sm font-medium text-emerald-700">Primary Speciality</label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
                <ChevronDown className="h-4 w-4" />
              </span>
              <select
                value={primarySpeciality}
                onChange={(e) => setPrimarySpeciality(e.target.value)}
                className="w-full appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-9 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none"
              >
                <option value="" disabled hidden>
                  Primary Speciality
                </option>
                <option>General Medicine</option>
                <option>Pediatrics</option>
                <option>Cardiology</option>
                <option>Dermatology</option>
                <option>Orthopedics</option>
                <option>Psychiatry</option>
                <option>Gynecology</option>
                <option>ENT</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Doctor"}
            </button>
          </div>

          {status && (
            <div
              className={
                status.type === "success"
                  ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200"
                  : "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200"
              }
            >
              {status.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
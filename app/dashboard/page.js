"use client";

import { useState } from "react";
import UserTopbar from "../components/UserTopbar";
import UserSidebar from "../components/UserSidebar";
import { Home, Calendar, FileText, MessageSquare, Star, CreditCard } from "lucide-react";

export default function UserDashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarItems = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Appointments", icon: Calendar, href: "/dashboard#appointments" },
    { label: "Medical Records", icon: FileText, href: "/dashboard/medical-records" },
    { label: "Consultations", icon: MessageSquare, href: "/dashboard#consultations" },
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
            <div className="mt-3 text-3xl font-semibold">2</div>
            <div className="mt-1 text-xs text-zinc-500">Next: Dec 15, 2:00 PM</div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-900">Past Consultations</div>
              <MessageSquare className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="mt-3 text-3xl font-semibold">8</div>
            <div className="mt-1 text-xs text-zinc-500">Completed successfully</div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-900">Health Score</div>
              <Star className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="mt-3 text-3xl font-semibold">85%</div>
            <div className="mt-1 text-xs text-zinc-500">Good condition</div>
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">Upcoming Appointments</h2>
            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">+ Book Appointment</button>
          </div>
          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-zinc-900">Dr. Sarah Smith</div>
                <div className="text-sm text-zinc-600">General Checkup</div>
              </div>
              <button className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">Join Now</button>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
              <span>Dec 15, 2024</span>
              <span>2:00 PM</span>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">confirmed</span>
            </div>
          </div>
        </div>

        {/* Consultations */}
        <div className="mt-8" id="consultations">
          <h2 className="text-lg font-semibold text-zinc-900">Consultation History</h2>
          <div className="mt-4 space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-zinc-900">Dr. Sarah Smith</div>
                    <div className="text-sm text-zinc-600">Regular checkup - vitals normal</div>
                  </div>
                  <button className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">Leave Feedback</button>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                  <span>Nov 30, 2024</span>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
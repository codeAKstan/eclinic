"use client";

import { useEffect, useState } from "react";
import DoctorTopbar from "../components/DoctorTopbar";
import DoctorSidebar from "../components/DoctorSidebar";
import { Home, Calendar, Users, FileText, MessageSquare, Star } from "lucide-react";

export default function DoctorDashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.ok) setProfile(data.user);
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const sidebarItems = [
    { label: "Dashboard", icon: Home, href: "/doctor" },
    { label: "Appointments", icon: Calendar, href: "/doctor#appointments" },
    { label: "Patient Records", icon: Users, href: "/doctor#records" },
    { label: "Consultations", icon: MessageSquare, href: "/doctor#consultations" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <DoctorTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      {/* Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <DoctorSidebar items={sidebarItems} activeIndex={0} />
      </aside>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <h1 className="text-3xl font-bold text-zinc-900">
          {profile?.name ? `Dr. ${profile.name}'s Dashboard` : "Doctor Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">Manage appointments, records, and consultations</p>

        {/* Stats cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div className="text-sm font-medium text-zinc-900">Today's Appointments</div>
            </div>
            <div className="mt-3 text-4xl font-semibold">3</div>
            <div className="mt-1 text-xs text-zinc-500">2 upcoming, 1 completed</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="text-sm font-medium text-zinc-900">Active Patients</div>
            </div>
            <div className="mt-3 text-4xl font-semibold">24</div>
            <div className="mt-1 text-xs text-zinc-500">This month</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="text-sm font-medium text-zinc-900">Records Updated</div>
            </div>
            <div className="mt-3 text-4xl font-semibold">12</div>
            <div className="mt-1 text-xs text-zinc-500">This week</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div className="text-sm font-medium text-zinc-900">Average Rating</div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="text-4xl font-semibold">4.8</div>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="mt-1 text-xs text-zinc-500">Based on 15 reviews</div>
          </div>
        </div>

        {/* Today's schedule */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900">Today's Schedule</h2>
          <div className="mt-4 space-y-4">
            {[{ name: 'Alex Johnson', type: 'General Checkup', time: '2:00 PM' }, { name: 'Emily Brown', type: 'Follow-up', time: '3:30 PM' }].map((s, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5">
                <div>
                  <div className="text-lg font-semibold text-zinc-900">{s.name}</div>
                  <div className="text-sm text-zinc-600">{s.type}</div>
                  <div className="text-sm text-zinc-700">{s.time}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">Upcoming</span>
                  <button className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">Start</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Feedback */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900">Patient Feedback</h2>
          <div className="mt-4 space-y-4">
            {[{ name: 'Alex Johnson', text: 'Excellent consultation, very professional and thorough examination.', date: 'Nov 10, 2024' }, { name: 'Michael Chen', text: 'Great care and helpful recommendations for managing allergies.', date: 'Nov 5, 2024' }].map((f, idx) => (
              <div key={idx} className="flex items-start justify-between rounded-2xl border border-zinc-200 bg-white p-5">
                <div>
                  <div className="text-lg font-semibold text-zinc-900">{f.name}</div>
                  <div className="mt-2 text-zinc-600">{f.text}</div>
                </div>
                <div className="text-sm text-zinc-500">{f.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
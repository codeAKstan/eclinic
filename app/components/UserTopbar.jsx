"use client";

import { useEffect, useState } from "react";
import { Menu, Bell } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function UserTopbar({ onOpenMenu, mobileOpen = false }) {
  const [profile, setProfile] = useState({ name: "", role: "" });
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchMe() {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (res.ok && data.ok && !cancelled) {
          setProfile({ name: data.user?.name || "", role: data.user?.role || "" });
        }
      } catch (_) {}
    }
    fetchMe();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadNotifs() {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.ok && !cancelled) {
          setNotifs(data.notifications || []);
          setUnread(data.unreadCount || 0);
        }
      } catch (_) {}
    }
    loadNotifs();
    const id = setInterval(loadNotifs, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  async function markAllRead() {
    try {
      await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true }) });
      setUnread(0);
      setNotifs((list) => list.map((n) => ({ ...n, read: true })));
    } catch (_) {}
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Mobile menu toggle */}
          <button
            className="-ml-1 inline-flex items-center justify-center rounded-md p-2 text-zinc-700 hover:bg-zinc-100 lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => onOpenMenu && onOpenMenu()}
          >
            <Menu className="h-6 w-6" strokeWidth={1.5} />
          </button>
          <img src="/logo.svg" alt="E-Clinic" className="h-8 w-8" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900">E-Clinic</span>
            <span className="text-xs text-zinc-500">Healthcare Platform</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              className="relative rounded-md p-2 text-zinc-700 hover:bg-zinc-100"
              aria-label="Notifications"
              onClick={() => setOpenDropdown((v) => !v)}
            >
              <Bell className="h-6 w-6" strokeWidth={1.5} />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                  {unread}
                </span>
              )}
            </button>

            {openDropdown && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2">
                  <div className="text-sm font-semibold text-zinc-900">Notifications</div>
                  <button className="text-xs text-blue-600 hover:underline" onClick={markAllRead}>Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-zinc-500">No notifications</div>
                  ) : (
                    notifs.map((n) => (
                      <div key={n.id} className={`px-3 py-3 ${n.read ? "bg-white" : "bg-blue-50"}`}>
                        <div className="text-sm font-medium text-zinc-900">{n.title || "Notification"}</div>
                        <div className="mt-0.5 text-sm text-zinc-600">{n.body || ""}</div>
                        <div className="mt-0.5 text-xs text-zinc-400">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-zinc-200" aria-hidden>
              <img src="/next.svg" alt="avatar" className="h-full w-full object-cover" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-zinc-900">{profile.name || "User"}</div>
              <div className="text-xs text-zinc-500">{profile.role || "Student"}</div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
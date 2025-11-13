"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function UserTopbar({ onOpenMenu, mobileOpen = false }) {
  const [profile, setProfile] = useState({ name: "", role: "" });

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
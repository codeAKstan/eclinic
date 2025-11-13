"use client";

import { Menu } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function AdminTopbar({ onOpenMenu, mobileOpen = false }) {
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
          <span className="text-sm font-semibold text-zinc-900">E-Clinic</span>
        </div>
        <div className="flex items-center gap-4">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
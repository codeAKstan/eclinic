"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (!menuRef.current) return;
      if (open && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="E-Clinic" width={64} height={64} />
          <span className="text-base font-semibold text-emerald-700">E-Clinic</span>
        </Link>

        {/* Center: Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-300">
          <Link href="#features" className="hover:text-emerald-700">Features</Link>
          <Link href="#services" className="hover:text-emerald-700">Services</Link>
          <Link href="#urgent" className="hover:text-emerald-700">Urgent Care</Link>
          <Link href="#faq" className="hover:text-emerald-700">FAQ</Link>
        </nav>

        {/* Right: Signup/Login button */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 rounded-full bg-emerald-600 px-5 py-2 text-white shadow-md hover:bg-emerald-700 focus:outline-none"
          >
            <span className="text-sm font-medium">Signup / Login</span>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15">
              {/* Chevron icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`transition-transform ${open ? "rotate-90" : ""}`}
              >
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-3 w-64 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Patients</span>
                <div className="flex items-center gap-4">
                  <Link href="#" className="text-sm text-emerald-600 hover:text-emerald-700">Sign up</Link>
                  <Link href="#" className="text-sm text-emerald-600 hover:text-emerald-700">Log In</Link>
                </div>
              </div>
              <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Doctor</span>
                <div className="flex items-center gap-4">
                  <Link href="#" className="text-sm text-emerald-600 hover:text-emerald-700">Log In</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
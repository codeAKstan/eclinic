import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-8 md:py-10 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="E-Clinic" width={28} height={28} />
          <span className="text-base font-semibold text-emerald-700">E-Clinic</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-600">
          <Link href="#features" className="hover:text-emerald-700">Features</Link>
          <Link href="#services" className="hover:text-emerald-700">Services</Link>
          <Link href="#urgent" className="hover:text-emerald-700">Urgent Care</Link>
          <Link href="#faq" className="hover:text-emerald-700">FAQ</Link>
          <Link href="#privacy" className="hover:text-emerald-700">Privacy</Link>
          <Link href="#terms" className="hover:text-emerald-700">Terms</Link>
        </nav>
        <div className="text-xs text-zinc-500">© {new Date().getFullYear()} E-Clinic. All rights reserved.</div>
      </div>
    </footer>
  );
}
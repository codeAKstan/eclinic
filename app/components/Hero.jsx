import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        {/* Left side */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-emerald-700">Best Healthcare</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight text-zinc-900 md:text-5xl">
            Book Appointment
            <br />
            <span className="text-emerald-700">A few Clicks away!</span>
          </h1>

          <p className="mt-5 max-w-xl text-zinc-600">
            Connect with doctors, manage appointments, and access your medical records all in one secure platform.
          </p>

          {/* Search */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-md">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Conditions, Procedures, Doctors"
                className="w-full rounded-full border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm text-zinc-700 shadow-sm outline-none placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 dark:border-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-4">
              <button className="flex h-12 items-center gap-3 rounded-full bg-emerald-600 px-6 text-white shadow-md hover:bg-emerald-700">
                Search
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="relative">

          {/* Doctor image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image src="/doc.svg" alt="Doctor" width={420} height={320} className="object-contain" />
          </div>
        </div>
      </div>
    </section>
  );
}
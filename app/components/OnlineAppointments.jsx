import Link from "next/link";

export default function OnlineAppointments() {
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-16">
      <div className="grid items-center gap-10 md:grid-cols-2">
        {/* Left: icon tiles */}
        <div className="relative flex w-full max-w-sm flex-wrap gap-6">
          {/* top-left */}
          <div className="grid h-24 w-24 place-items-center rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-700">
              <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          {/* top-right */}
          <div className="grid h-24 w-24 place-items-center rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-700">
              <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          {/* bottom-left (stethoscope accent) */}
          <div className="absolute left-1 top-28 text-orange-500">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 3v6a4 4 0 008 0V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="18" cy="17" r="3" stroke="currentColor" strokeWidth="2" />
              <path d="M14 17h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          {/* bottom-right */}
          <div className="grid h-24 w-24 place-items-center rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-700">
              <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Right: text and CTA */}
        <div>
          <h3 className="text-3xl font-bold text-zinc-900">Online appointments</h3>
          <p className="mt-3 max-w-lg text-zinc-600">
            Consultation with Doctors and other healthcare professionals <span className="font-semibold">Whenever!</span> <span className="font-semibold">Wherever!</span> Anywhere!
          </p>
          <div className="mt-6">
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 rounded-full bg-emerald-700 px-6 py-3 text-white shadow-md hover:bg-emerald-800"
            >
              Book Now
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
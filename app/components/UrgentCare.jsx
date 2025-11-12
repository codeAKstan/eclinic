export default function UrgentCare() {
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-16">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-300 p-8 md:p-10 text-white relative">
        <div className="max-w-3xl">
          <h3 className="text-3xl font-bold">Urgent Care</h3>
          <p className="mt-3 text-sm md:text-base opacity-90">
            Same-day doctor&apos;s appointment for diagnosis and treatment of medical illnesses that are acute but do not pose an immediate threat to life and health
          </p>
        </div>

        {/* Ghost 24/7 and medical bag icon on right */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-8">
          <div className="flex items-center gap-6 opacity-30">
            <span className="text-4xl md:text-5xl font-extrabold">24/7</span>
            <span className="grid h-16 w-20 place-items-center rounded-2xl border border-white/20">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <rect x="4" y="8" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
                <path d="M8 8V7a3 3 0 013-3h2a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 12v4M10 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
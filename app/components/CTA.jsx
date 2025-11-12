import Link from "next/link";

export default function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl md:text-5xl">Ready to get started?</h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-zinc-600">
          Join thousands of students and professionals using E-Clinic for quality healthcare access
        </p>
        <div className="mt-8">
          <Link
            href="/signup"
            className="inline-flex items-center gap-3 rounded-full bg-emerald-600 px-8 py-3 text-white shadow-md hover:bg-emerald-700"
          >
            Get Started
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
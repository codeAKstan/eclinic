export default function WhyChoose() {
  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-600">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Available Anytime",
      desc: "Consult with doctors 24/7 from anywhere in the world",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-600">
          <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
          <path d="M22 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      title: "Expert Doctors",
      desc: "Connect with verified healthcare professionals instantly",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-600">
          <path d="M12.76 3.64l1.77 3.58 3.95.57-2.86 2.79.68 3.93-3.54-1.86-3.54 1.86.68-3.93-2.86-2.79 3.95-.57 1.77-3.58z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 21s-7-4.35-7-9.5A4.5 4.5 0 019.5 7c1.59 0 2.5.83 2.5.83s.91-.83 2.5-.83A4.5 4.5 0 0120 11.5C20 16.65 12 21 12 21z" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      title: "Affordable Care",
      desc: "Access quality healthcare at a fraction of traditional costs",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-16">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-zinc-900">Why Choose E-Clinic?</h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-zinc-600">
          Experience healthcare reimagined with convenience, accessibility, and professional care
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100">
                {f.icon}
              </div>
              <div>
                <div className="text-xl font-semibold text-zinc-900">{f.title}</div>
                <p className="mt-2 text-zinc-600">{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
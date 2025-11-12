import Hero from "./components/Hero";
import WhyChoose from "./components/WhyChoose";
import OnlineAppointments from "./components/OnlineAppointments";
import UrgentCare from "./components/UrgentCare";
import CTA from "./components/CTA";

export default function Home() {
  return (
    <main className="font-sans">
      <Hero />
      <WhyChoose />
      <OnlineAppointments />
      <UrgentCare />
      <CTA />
    </main>
  );
}

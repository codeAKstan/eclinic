import Hero from "./components/Hero";
import WhyChoose from "./components/WhyChoose";
import OnlineAppointments from "./components/OnlineAppointments";
import UrgentCare from "./components/UrgentCare";

export default function Home() {
  return (
    <main className="font-sans">
      <Hero />
      <WhyChoose />
      <OnlineAppointments />
      <UrgentCare />
    </main>
  );
}

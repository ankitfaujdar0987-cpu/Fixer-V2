import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import QuickPicks from "@/components/QuickPicks";
import HowItWorks from "@/components/HowItWorks";
import PartnerBanner from "@/components/PartnerBanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <QuickPicks />
        <HowItWorks />
        <PartnerBanner />
      </main>
      <Footer />
    </>
  );
}
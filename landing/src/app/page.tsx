import Hero from "@/components/Hero";
import LiveDemo from "@/components/LiveDemo";
import Features from "@/components/Features";
import StackingCards from "@/components/StackingCards";
import MoreFeatures from "@/components/MoreFeatures";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <div className="bg-white">
      <Hero />
      <LiveDemo />
      <Features />
      <StackingCards />
      <MoreFeatures />
      <CTASection />
    </div>
  );
}

import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FounderSection from "@/components/home/FounderSection";
import ToolsSection from "@/components/home/ToolsSection";

export default function Home() {
  return (
    <div className="relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-400/10 dark:bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none" />

      <HeroSection />

      <ToolsSection />

      <HowItWorksSection />

      <FounderSection />
    </div>
  );
}
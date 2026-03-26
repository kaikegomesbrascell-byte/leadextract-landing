import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import SmartIntervalsSection from "@/components/landing/SmartIntervalsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import LeadsExampleSection from "@/components/landing/LeadsExampleSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import PricingSection from "@/components/landing/PricingSection";
import TrustSection from "@/components/landing/TrustSection";
import BonusSection from "@/components/landing/BonusSection";
import GuaranteeSection from "@/components/landing/GuaranteeSection";
import FAQSection from "@/components/landing/FAQSection";
import FooterCTA from "@/components/landing/FooterCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <SmartIntervalsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <LeadsExampleSection />
      <TestimonialsSection />
      <ComparisonSection />
      <PricingSection />
      <TrustSection />
      <BonusSection />
      <GuaranteeSection />
      <FAQSection />
      <FooterCTA />
    </div>
  );
};

export default Index;

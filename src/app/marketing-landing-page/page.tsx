import React from 'react';
import LandingNav from './components/LandingNav';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import SocialProofSection from './components/SocialProofSection';
import WhyCreoSection from './components/WhyCreoSection';
import PricingSection from './components/PricingSection';
import FinalCtaSection from './components/FinalCtaSection';
import FooterSection from './components/FooterSection';

export default function MarketingLandingPage() {
  return (
    <main className="min-h-screen bg-creo-bg overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhyCreoSection />
      <PricingSection />
      <FinalCtaSection />
      <FooterSection />
    </main>
  );
}

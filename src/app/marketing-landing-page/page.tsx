import React from 'react';
import LandingNav from './components/LandingNav';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import SocialProofSection from './components/SocialProofSection';
import PricingSection from './components/PricingSection';
import FooterSection from './components/FooterSection';

export default function MarketingLandingPage() {
  return (
    <main className="min-h-screen bg-[#080812] overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <SocialProofSection />
      <PricingSection />
      <FooterSection />
    </main>
  );
}
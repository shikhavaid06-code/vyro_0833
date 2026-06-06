'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

export default function TermsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#080812] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-2 mb-8">
          <AppLogo size={24} />
          <span className="font-display text-lg font-semibold text-white">VYRO</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: June 2026</p>
        <div className="space-y-8 text-white/60 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using VYRO, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service. VYRO is an AI-powered content creation platform designed to help creators generate viral titles, hooks, and scripts.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Use of the Service</h2>
            <p>You may use VYRO only for lawful purposes. You agree not to generate content that is harmful, hateful, misleading, or violates any applicable laws. You are solely responsible for the content you create using VYRO.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Account Responsibility</h2>
            <p>You are responsible for maintaining the security of your account and password. VYRO is not liable for any loss from unauthorized use of your account. Notify us immediately if you suspect unauthorized access.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Free & Paid Plans</h2>
            <p>Free users are limited to 3 AI generations. Pro and Ultra plans offer expanded or unlimited generations. Paid plans are billed monthly and can be cancelled anytime. No refunds are provided for partial months.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Intellectual Property</h2>
            <p>Content generated using your prompts belongs to you. VYRO retains ownership of its platform, design, and AI systems. You may not copy, reverse engineer, or reproduce any part of VYRO without written permission.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Disclaimers</h2>
            <p>VYRO is provided "as is" without warranties. We do not guarantee that AI-generated content will be accurate or original. Always review content before publishing.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Limitation of Liability</h2>
            <p>VYRO shall not be liable for any indirect or consequential damages from your use of the platform. Our total liability shall not exceed the amount you paid in the last 30 days.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">8. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use after changes means acceptance of the new terms. We will notify users of significant changes via email or in-app notification.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">9. Contact</h2>
            <p>Questions? Email us at <a href="mailto:hello@vyro.ai" className="text-purple-400 hover:text-purple-300">hello@vyro.ai</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}

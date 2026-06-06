'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: June 2026</p>
        <div className="space-y-8 text-white/60 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly: your name, email address, and password when you create an account. We also collect your onboarding answers (how you found us, skill level) and your content generation activity (topics, platform preferences).</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve VYRO, personalise your experience, send important account updates, and understand how creators use our platform. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Data Storage</h2>
            <p>Currently, account data is stored locally on your device. As VYRO grows, we will migrate to secure cloud storage. We will notify you before any such migration and give you options to export or delete your data.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. AI & Your Content</h2>
            <p>Your prompts are sent to our AI provider (Google Gemini) to generate content. We do not store your prompts or generated content on our servers beyond what is necessary for the service to function. Please do not include sensitive personal information in your prompts.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Cookies</h2>
            <p>VYRO uses minimal cookies and local storage to keep you logged in and remember your preferences. We do not use advertising cookies or tracking cookies from third parties.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. You can delete your account from the Settings page. For data requests, contact us at hello@vyro.ai and we will respond within 7 days.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Children's Privacy</h2>
            <p>VYRO is not intended for users under the age of 13. We do not knowingly collect data from children. If you believe a child has provided us with personal data, please contact us immediately.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy as VYRO grows. We will notify you of significant changes via email or in-app notification. Continued use of VYRO after changes means acceptance of the updated policy.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">9. Contact</h2>
            <p>Privacy questions? Email us at <a href="mailto:hello@vyro.ai" className="text-purple-400 hover:text-purple-300">hello@vyro.ai</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}

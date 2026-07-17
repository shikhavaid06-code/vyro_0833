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
          <span className="font-display text-lg font-semibold text-white">CRÉO</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: June 2026 · Applies to all users of CRÉO worldwide</p>

        <div className="space-y-8 text-white/60 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Agreement to Terms</h2>
            <p>These Terms of Service ("Terms") govern your access to and use of CRÉO's website and AI content creation platform (the "Service"), operated by CRÉO ("we", "us", "our"). By creating an account or otherwise using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Eligibility</h2>
            <p>You must be at least 13 years old to use CRÉO. If you are under the age of majority in your jurisdiction, you may only use the Service with the involvement and consent of a parent or legal guardian. By using the Service, you represent that you meet these requirements.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Your Account</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us promptly at <a href="mailto:creo.app.ai@gmail.com" className="text-purple-400 hover:text-purple-300">creo.app.ai@gmail.com</a> if you suspect unauthorised use of your account. We are not liable for any loss arising from unauthorised access resulting from your failure to safeguard your credentials.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. The Service</h2>
            <p>CRÉO uses third-party AI models (including Google Gemini) to generate titles, hooks, scripts, and related content based on prompts you provide. Generated output is produced algorithmically and may be inaccurate, repetitive, or unsuitable for your intended use in some cases. You are responsible for reviewing, editing, and fact-checking any AI-generated content before publishing or relying on it.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Subscription Plans, Billing & Refunds</h2>
            <p>CRÉO offers a Free plan and paid plans (Pro and Ultra) with different generation limits and features. Paid plans are purchased as a one-time payment (via our payment processor, currently Razorpay) covering a fixed period — one month or one year depending on the billing option you choose.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Prices are displayed in your local currency where supported and may vary by region.</li>
              <li>Paid plans do <b className="text-white/80">not</b> auto-renew and we never charge your payment method automatically. When your paid period ends, your account simply returns to the Free plan unless you choose to renew from the Upgrade page.</li>
              <li>24-hour refund window: you may cancel from Settings within <b className="text-white/80">24 hours</b> of purchasing a paid plan for a full, automatic refund of that payment to your original payment method (typically within 5–7 business days). Cancellation within this window takes effect immediately.</li>
              <li>After the 24-hour window, payments are non-refundable. Because plans never auto-renew, no cancellation is needed: your plan simply remains active until the end of its paid period and your account then returns to the Free plan automatically.</li>
              <li>Upgrading from Pro to Ultra mid-period automatically credits the unused days of your Pro payment back to you when the Ultra payment completes.</li>
              <li>We reserve the right to change pricing with reasonable advance notice; changes will not apply retroactively to an already-paid period.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Acceptable Use</h2>
            <p>You agree not to use CRÉO to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Generate content that is unlawful, defamatory, hateful, harassing, or that infringes on the rights of others</li>
              <li>Generate spam, mass disinformation campaigns, or content designed to deceive audiences at scale</li>
              <li>Attempt to reverse-engineer, scrape, or extract the Service's underlying prompts, models, or source code</li>
              <li>Circumvent generation limits, rate limits, or subscription tiers through automated or fraudulent means</li>
              <li>Resell or redistribute access to the Service without our prior written consent</li>
            </ul>
            <p className="mt-2">We reserve the right to suspend or terminate accounts that violate this section, with or without notice, depending on severity.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Ownership of Generated Content</h2>
            <p>As between you and CRÉO, you own the titles, hooks, and scripts generated for you through the Service, subject to the underlying terms of our AI providers and applicable law. We do not claim ownership over your prompts or the content generated in response to them. You are solely responsible for ensuring your use of generated content complies with copyright, trademark, and platform-specific rules (e.g. YouTube, TikTok, Instagram policies).</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">8. Our Intellectual Property</h2>
            <p>The Service itself — including its design, branding, "CRÉO" name and logo, underlying software, and interface — is owned by us and protected by intellectual property laws. These Terms do not grant you any rights to our trademarks, branding, or source code beyond what is necessary to use the Service as intended.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">9. Service Availability</h2>
            <p>CRÉO is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted or error-free operation of the Service. Features described as "Coming Soon" are in active development and are not guaranteed to ship on any specific timeline. We may modify, suspend, or discontinue any part of the Service at our discretion, with reasonable notice where practicable.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, CRÉO and its team shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of revenue, data, or goodwill, arising from your use of or inability to use the Service — including reliance on AI-generated content. Our total liability for any claim arising from these Terms or the Service shall not exceed the amount you paid us in the 3 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">11. Termination</h2>
            <p>You may stop using the Service and delete your account at any time from Settings. We may suspend or terminate your access if you violate these Terms, engage in fraudulent activity, or if required by law. Upon termination, your right to use the Service ceases immediately; provisions of these Terms that by their nature should survive (e.g. ownership, liability, disputes) will continue to apply.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">12. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. If we make material changes, we will notify you via email or a prominent notice within the Service at least 7 days before the changes take effect. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms. The "Last updated" date above reflects the most recent revision.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">13. Governing Law</h2>
            <p>These Terms are governed by the laws of India, without regard to conflict-of-law principles, without prejudice to any mandatory consumer-protection rights you may have under the laws of your country of residence.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">14. Contact Us</h2>
            <p>If you have questions about these Terms, please contact us at <a href="mailto:creo.app.ai@gmail.com" className="text-purple-400 hover:text-purple-300">creo.app.ai@gmail.com</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}

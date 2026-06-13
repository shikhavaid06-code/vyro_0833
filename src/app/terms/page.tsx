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
        <p className="text-white/40 text-sm mb-10">Last updated: June 2026 · Effective immediately for all users</p>

        <div className="space-y-8 text-white/60 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Agreement to Terms</h2>
            <p>These Terms of Service ("Terms") form a binding legal agreement between you ("User", "you", "your") and CRÉO ("we", "us", "our", "the Company"), governing your access to and use of the CRÉO website, application, and AI-powered content generation services (collectively, the "Service").</p>
            <p className="mt-2">By creating an account, accessing, or using the Service in any way, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not access or use the Service.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Eligibility</h2>
            <p>You must be at least 13 years of age to use CRÉO. If you are between 13 and 18 (or the age of legal majority in your jurisdiction), you may only use the Service with the involvement and consent of a parent or legal guardian. By using CRÉO, you represent and warrant that you meet these eligibility requirements and that all registration information you submit is accurate, current, and complete.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Account Registration & Security</h2>
            <p>To access certain features, you must create an account by providing a valid email address, name, and password. You agree to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the confidentiality of your login credentials</li>
              <li>Be solely responsible for all activity that occurs under your account</li>
              <li>Notify us immediately at hello@creo.ai of any unauthorized use of your account</li>
              <li>Not share, sell, transfer, or sublicense your account to any other person</li>
            </ul>
            <p className="mt-2">We reserve the right to suspend or terminate accounts that contain inaccurate information, are inactive for extended periods, or are used in violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Description of Service</h2>
            <p>CRÉO provides an AI-powered platform that generates content suggestions, including but not limited to video titles, hooks, scripts, and related creative assets, based on user-provided prompts ("Generated Content"). The Service uses third-party AI models to process your inputs and produce outputs.</p>
            <p className="mt-2">We do not guarantee that Generated Content will be original, accurate, suitable for any particular purpose, free of errors, or non-infringing on the rights of third parties. You are solely responsible for reviewing, editing, fact-checking, and verifying any Generated Content before publishing, distributing, or relying upon it in any way.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Subscription Plans, Billing & Payments</h2>
            <p><strong className="text-white/80">5.1 Plan Tiers.</strong> CRÉO offers a Free plan with limited daily generations, and paid Pro and Ultra subscription plans offering expanded or unlimited access to features, as described on our Pricing page. Pricing is displayed in your local currency where supported, and is subject to change with notice.</p>
            <p className="mt-2"><strong className="text-white/80">5.2 Billing Cycle.</strong> Paid subscriptions are billed in advance on a recurring monthly or annual basis, depending on your selected plan, via our third-party payment processor. By subscribing, you authorize us (and our payment processor) to charge your chosen payment method automatically at the start of each billing cycle until you cancel.</p>
            <p className="mt-2"><strong className="text-white/80">5.3 Price Changes.</strong> We may change subscription prices from time to time. We will provide at least 14 days' notice of any price increase via email or in-app notification before it takes effect for existing subscribers.</p>
            <p className="mt-2"><strong className="text-white/80">5.4 Cancellation.</strong> You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period, and you will retain access to paid features until that date. No partial refunds are provided for unused time within a billing period, except as required by applicable law.</p>
            <p className="mt-2"><strong className="text-white/80">5.5 Refunds.</strong> All paid plans include a 7-day money-back guarantee from the date of initial purchase. To request a refund within this window, contact hello@creo.ai. Refund requests made after 7 days are evaluated on a case-by-case basis and are not guaranteed.</p>
            <p className="mt-2"><strong className="text-white/80">5.6 Taxes.</strong> Prices may be subject to applicable taxes (such as GST, VAT, or sales tax) depending on your location, which will be calculated and added at checkout where required by law.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Acceptable Use Policy</h2>
            <p>You agree not to use the Service to create, upload, store, or distribute content that:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Is unlawful, defamatory, harassing, abusive, hateful, or discriminatory</li>
              <li>Infringes any patent, trademark, trade secret, copyright, or other intellectual property right</li>
              <li>Contains sexually explicit material involving minors, or any content that exploits or endangers children</li>
              <li>Promotes violence, self-harm, terrorism, or illegal activity</li>
              <li>Constitutes spam, phishing, or fraudulent schemes</li>
              <li>Contains malware, viruses, or any code designed to disrupt or damage systems</li>
            </ul>
            <p className="mt-2">You further agree not to: reverse engineer, decompile, or attempt to extract the source code of the Service; use automated scripts, bots, or scrapers to access the Service without written permission; circumvent or attempt to circumvent any usage limits, paywalls, or access controls; or resell, sublicense, or commercially exploit access to the Service without our prior written consent.</p>
            <p className="mt-2">Violation of this Acceptable Use Policy may result in immediate suspension or termination of your account without refund, and we reserve the right to report unlawful activity to relevant authorities.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Intellectual Property Rights</h2>
            <p><strong className="text-white/80">7.1 Your Content.</strong> As between you and CRÉO, you retain ownership of the prompts you submit and the Generated Content produced from them, subject to the rights of any underlying third-party AI model providers and any third-party intellectual property that may be inadvertently reflected in AI outputs. You are responsible for ensuring your use of Generated Content does not infringe the rights of others.</p>
            <p className="mt-2"><strong className="text-white/80">7.2 Our Platform.</strong> CRÉO and its licensors retain all right, title, and interest in and to the Service, including but not limited to the CRÉO name, logo, brand assets, website design, source code, user interface, algorithms, and all related intellectual property. Nothing in these Terms grants you any right to use our trademarks, logos, or branding without prior written consent.</p>
            <p className="mt-2"><strong className="text-white/80">7.3 Feedback.</strong> If you provide suggestions, ideas, or feedback about the Service, you grant us a perpetual, irrevocable, royalty-free license to use that feedback for any purpose without compensation or attribution to you.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">8. Third-Party Services</h2>
            <p>The Service relies on third-party AI providers and infrastructure services to function. We are not responsible for the availability, accuracy, or content of any third-party services. Your use of any third-party services integrated with CRÉO may be subject to that third party's own terms and privacy policy.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">9. Disclaimers of Warranties</h2>
            <p className="uppercase tracking-wide text-xs text-white/40 mb-2">The following section contains important legal disclaimers.</p>
            <p>THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.</p>
            <p className="mt-2">We do not warrant that the Service will be uninterrupted, secure, error-free, or that any defects will be corrected, or that Generated Content will be accurate, complete, original, or suitable for any purpose. You use the Service and rely on Generated Content entirely at your own risk.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">10. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CRÉO, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING FROM YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SERVICE.</p>
            <p className="mt-2">OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO CRÉO IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) USD $50.</p>
            <p className="mt-2">Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">11. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless CRÉO and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with: (a) your access to or use of the Service; (b) your violation of these Terms; (c) your violation of any third-party right, including intellectual property or privacy rights; or (d) any Generated Content you publish, distribute, or otherwise use.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">12. Termination</h2>
            <p>We may suspend or terminate your access to the Service at any time, with or without notice, for conduct that we believe violates these Terms, is harmful to other users, us, or third parties, or for any other reason at our sole discretion. Upon termination, your right to use the Service will immediately cease. Sections of these Terms that by their nature should survive termination (including but not limited to Intellectual Property, Disclaimers, Limitation of Liability, and Indemnification) shall survive.</p>
            <p className="mt-2">You may terminate your account at any time by using the account deletion option in Settings or by contacting hello@creo.ai.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">13. Governing Law & Dispute Resolution</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any dispute arising out of or relating to these Terms or the Service shall first be attempted to be resolved through good-faith informal negotiation. If unresolved within 30 days, disputes shall be subject to the exclusive jurisdiction of the courts located in India, except where applicable law requires otherwise for consumer protection purposes.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">14. Changes to These Terms</h2>
            <p>We may revise these Terms from time to time. If we make material changes, we will notify you via email or a prominent in-app notice at least 7 days before the changes take effect. Your continued use of the Service after the effective date of any revised Terms constitutes your acceptance of those changes. If you do not agree to the revised Terms, you must stop using the Service and may close your account.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">15. Severability & Entire Agreement</h2>
            <p>If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect. These Terms, together with our Privacy Policy, constitute the entire agreement between you and CRÉO regarding the Service and supersede any prior agreements.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">16. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:hello@creo.ai" className="text-purple-400 hover:text-purple-300">hello@creo.ai</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}

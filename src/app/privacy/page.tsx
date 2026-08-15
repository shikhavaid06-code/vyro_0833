'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

export default function PrivacyPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-creo-bg px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-creo-text-muted hover:text-creo-text-primary text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-2 mb-8">
          <AppLogo size={24} />
          <span className="font-display text-lg font-semibold text-creo-text-primary">CRÉO</span>
        </div>
        <h1 className="text-3xl font-bold text-creo-text-primary mb-2">Privacy Policy</h1>
        <p className="text-creo-text-muted text-sm mb-10">Last updated: June 2026 · Applies to all users of CRÉO worldwide</p>

        <div className="space-y-8 text-creo-text-secondary text-sm leading-relaxed">

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">1. Introduction</h2>
            <p>This Privacy Policy explains how CRÉO ("we", "us", "our") collects, uses, discloses, and safeguards your information when you use our website and AI content creation platform (the "Service"). We are committed to protecting your privacy and handling your data transparently. By using CRÉO, you consent to the practices described in this policy.</p>
            <p className="mt-2">This policy is designed to be consistent with applicable data protection laws, including the General Data Protection Regulation (GDPR) for users in the European Economic Area, the California Consumer Privacy Act (CCPA) for California residents, and India's Digital Personal Data Protection Act (DPDPA).</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">2. Information We Collect</h2>
            <p><strong className="text-creo-text-secondary">2.1 Information you provide directly:</strong></p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Account information: name, email address, and password (stored in hashed form)</li>
              <li>Onboarding responses: how you discovered CRÉO, and your self-reported creator skill level</li>
              <li>Billing information: processed by our third-party payment provider; we do not store full card numbers</li>
              <li>Communications: any messages you send to our support team</li>
              <li>Content prompts: the topics, titles, hooks, and instructions you submit for AI generation</li>
            </ul>
            <p className="mt-2"><strong className="text-creo-text-secondary">2.2 Information collected automatically:</strong></p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Usage data: features used, generation counts, session duration, pages visited</li>
              <li>Device information: browser type, operating system, device type, screen resolution</li>
              <li>Approximate location: derived from your IP address and timezone, used only for currency display and regional pricing — not for tracking</li>
              <li>Log data: IP address, access times, and error logs for security and debugging</li>
            </ul>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To provide, operate, and maintain the Service, including authenticating your account and processing AI generation requests</li>
              <li>To personalise your experience based on your stated skill level and usage patterns</li>
              <li>To process payments and manage subscriptions</li>
              <li>To communicate with you about your account, updates, security alerts, and support requests</li>
              <li>To analyse aggregated, anonymised usage trends to improve features and product direction</li>
              <li>To detect, prevent, and address fraud, abuse, security incidents, and technical issues</li>
              <li>To comply with legal obligations and enforce our Terms of Service</li>
            </ul>
            <p className="mt-2">We do not use your data to train third-party AI models beyond what is operationally necessary to generate your requested content, and we do not sell your personal data to data brokers or advertisers.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">4. Legal Basis for Processing (GDPR)</h2>
            <p>If you are located in the European Economic Area, our legal bases for processing your personal data include: performance of a contract (to provide the Service you signed up for), legitimate interests (to improve and secure the Service), consent (for optional communications such as newsletters), and compliance with legal obligations.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">5. How We Share Your Information</h2>
            <p>We do not sell your personal information. We may share information in the following limited circumstances:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-creo-text-secondary">AI service providers:</strong> Your prompts are transmitted to third-party AI providers (such as Google Gemini) solely to generate the content you request. These providers process data under their own privacy commitments.</li>
              <li><strong className="text-creo-text-secondary">Payment processors:</strong> Billing details are shared with payment processors (such as Razorpay or Stripe) to process subscription payments securely.</li>
              <li><strong className="text-creo-text-secondary">Service providers:</strong> We may share data with hosting providers, analytics services, and customer support tools that help us operate the Service, under contractual confidentiality obligations.</li>
              <li><strong className="text-creo-text-secondary">Legal requirements:</strong> We may disclose information if required by law, court order, or governmental request, or to protect the rights, property, or safety of CRÉO, our users, or others.</li>
              <li><strong className="text-creo-text-secondary">Business transfers:</strong> If CRÉO is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction, subject to confidentiality commitments.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">6. Data Storage, Security & Retention</h2>
            <p><strong className="text-creo-text-secondary">6.1 Storage.</strong> Account data is currently stored locally on your device via browser storage during our early-access phase. As CRÉO scales, we will migrate to secure encrypted cloud infrastructure, and will notify users in advance of this transition along with updated terms.</p>
            <p className="mt-2"><strong className="text-creo-text-secondary">6.2 Security Measures.</strong> We implement industry-standard technical and organisational measures to protect your data, including encryption in transit (HTTPS/TLS), access controls, and regular security reviews. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
            <p className="mt-2"><strong className="text-creo-text-secondary">6.3 Retention.</strong> We retain your personal data for as long as your account is active or as needed to provide the Service. If you delete your account, we will delete or anonymise your personal data within 30 days, except where retention is required for legal, tax, accounting, or dispute-resolution purposes.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">7. International Data Transfers</h2>
            <p>CRÉO and its service providers may process your data in countries other than your country of residence, including the United States and other jurisdictions where data protection laws may differ. Where required, we rely on appropriate safeguards such as standard contractual clauses to ensure your data receives an adequate level of protection wherever it is processed.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">8. Cookies & Tracking Technologies</h2>
            <p>CRÉO uses minimal cookies and browser local storage strictly necessary to keep you signed in, remember your preferences (such as currency and onboarding status), and maintain session security. We do not use third-party advertising cookies, cross-site tracking pixels, or sell data to ad networks. You can control cookie behaviour through your browser settings, though disabling essential cookies may prevent you from logging in or using core features.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">9. Your Privacy Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-creo-text-secondary">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-creo-text-secondary">Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong className="text-creo-text-secondary">Deletion:</strong> Request deletion of your account and associated personal data</li>
              <li><strong className="text-creo-text-secondary">Portability:</strong> Request your data in a structured, machine-readable format</li>
              <li><strong className="text-creo-text-secondary">Objection / Restriction:</strong> Object to or request restriction of certain processing activities</li>
              <li><strong className="text-creo-text-secondary">Withdraw consent:</strong> Where processing is based on consent, withdraw it at any time</li>
              <li><strong className="text-creo-text-secondary">Non-discrimination (CCPA):</strong> California residents will not receive discriminatory treatment for exercising privacy rights</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, email <a href="mailto:creo.app.ai@gmail.com" className="text-creo-primary hover:text-creo-primary">creo.app.ai@gmail.com</a>. We will respond to verified requests within 30 days, or as required by applicable law. You may also delete your account directly from Settings at any time.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">10. AI-Generated Content & Your Prompts</h2>
            <p>When you submit a prompt, it is sent to our AI provider to generate the requested output. We do not permanently store the content of your prompts or generated outputs on our servers beyond what is necessary to deliver the response and maintain short-term operational logs for debugging (typically retained for no longer than 30 days). Please do not include sensitive personal information (such as health data, financial account numbers, government ID numbers, or information about third parties) in your prompts.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">11. Children's Privacy</h2>
            <p>CRÉO is not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected personal data from a child under 13 without verified parental consent, we will take steps to delete that information promptly. Parents or guardians who believe their child has provided us with personal data should contact <a href="mailto:creo.app.ai@gmail.com" className="text-creo-primary hover:text-creo-primary">creo.app.ai@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">12. Third-Party Links</h2>
            <p>The Service may contain links to third-party websites or services that are not operated by us. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party sites you visit.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">13. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other operational reasons. If we make material changes, we will notify you via email or a prominent notice within the Service at least 7 days before the changes take effect. The "Last updated" date at the top of this page indicates when this policy was last revised. Continued use of the Service after changes take effect constitutes acceptance of the revised policy.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">14. Contact Us</h2>
            <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at <a href="mailto:creo.app.ai@gmail.com" className="text-creo-primary hover:text-creo-primary">creo.app.ai@gmail.com</a>. We aim to respond to all privacy-related inquiries within 7 business days.</p>
          </section>

        </div>
      </div>
    </div>
  );
}

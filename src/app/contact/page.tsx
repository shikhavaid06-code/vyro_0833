'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, Phone, Clock } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

// ✅ CONTACT PAGE — required by payment-gateway reviewers (Razorpay checks
// for a reachable email, phone and address before activating live mode).
// ⚠️ FILL THESE THREE VALUES with real details BEFORE submitting Razorpay KYC:
const CONTACT_EMAIL = 'creo.app.ai@gmail.com';
const CONTACT_PHONE = '+91-9086143557';
const CONTACT_ADDRESS = 'H. No. 155, Sector 4, Trikuta Nagar, Jammu, Jammu & Kashmir 180020, India';

export default function ContactPage() {
  const router = useRouter();
  const rows = [
    { icon: Mail, label: 'Email', value: CONTACT_EMAIL, sub: 'Best way to reach us — we reply within 24–48 hours' },
    { icon: Phone, label: 'Phone', value: CONTACT_PHONE, sub: 'Mon–Sat, 10:00–18:00 IST' },
    { icon: MapPin, label: 'Address', value: CONTACT_ADDRESS, sub: 'Operating address' },
    { icon: Clock, label: 'Support hours', value: 'Monday to Saturday, 10:00–18:00 IST', sub: 'Payment issues are prioritised' },
  ];
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
        <h1 className="text-3xl font-bold text-creo-text-primary mb-2">Contact Us</h1>
        <p className="text-creo-text-muted text-sm mb-10">Questions about CRÉO, your subscription, a payment, or a refund — we're easy to reach.</p>

        <div className="space-y-4">
          {rows.map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="creo-surface rounded-2xl border border-white/8 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-creo-primary/10 border border-creo-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon size={17} className="text-creo-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-creo-text-muted mb-0.5">{label}</p>
                <p className="text-creo-text-secondary text-sm font-medium break-all">{value}</p>
                <p className="text-creo-text-muted text-xs mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 creo-surface rounded-2xl border border-white/8 p-5">
          <p className="text-creo-text-secondary text-sm leading-relaxed">
            For payment or refund issues, email us with the subject line <b className="text-creo-text-secondary">"Payment support"</b> and include
            the email address on your CRÉO account. Refund requests can also be handled instantly and automatically from{' '}
            <a href="/settings" className="text-creo-primary hover:text-creo-primary">Settings → Cancel plan</a> — see our{' '}
            <a href="/refunds" className="text-creo-primary hover:text-creo-primary">Refund &amp; Cancellation Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

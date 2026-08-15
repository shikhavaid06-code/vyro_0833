'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

// ✅ STANDALONE REFUND & CANCELLATION POLICY — payment-gateway reviewers
// (Razorpay) require this as its own page, not buried inside the Terms.
// It describes EXACTLY what the code does (see /api/subscription): no
// auto-renewal, and a 24-hour full-refund window after purchase. Nothing
// promised here that isn't implemented.
export default function RefundsPage() {
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
        <h1 className="text-3xl font-bold text-creo-text-primary mb-2">Refund &amp; Cancellation Policy</h1>
        <p className="text-creo-text-muted text-sm mb-10">Last updated: July 2026 · Applies to all CRÉO paid plans (Pro and Ultra)</p>

        <div className="space-y-8 text-creo-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">1. How billing works</h2>
            <p>CRÉO paid plans are one-time payments covering a fixed period (one month or one year). Plans do <b className="text-creo-text-secondary">not</b> auto-renew and we never charge your payment method automatically. When your paid period ends, your account simply returns to the Free plan unless you choose to renew.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">2. The 24-hour refund window</h2>
            <p>If you change your mind within <b className="text-creo-text-secondary">24 hours</b> of purchasing a paid plan, cancel from <a href="/settings" className="text-creo-primary hover:text-creo-primary">Settings</a> in the app — no emails, no forms, no waiting. Cancellation takes effect immediately: your account switches to the Free plan and the <b className="text-creo-text-secondary">full payment</b> is refunded automatically in the same step.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">3. After 24 hours</h2>
            <p>Once the 24-hour window has passed, payments are <b className="text-creo-text-secondary">non-refundable</b>. There is nothing you need to cancel: plans never auto-renew, so your plan simply stays active until the end of the period you paid for, and your account then returns to the Free plan automatically. You are never charged again without making a new payment yourself.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">4. Why this policy</h2>
            <p>CRÉO is usable at full power from minute one — generations, reviews, and exports all happen instantly. The 24-hour window gives you a genuine, risk-free chance to confirm the plan is right for you, while keeping the policy simple: <b className="text-creo-text-secondary">one day to decide, full money back, zero questions</b>.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">5. Upgrade credits</h2>
            <p>If you upgrade from Pro to Ultra mid-period, the unused days of your Pro payment are automatically refunded to you when the Ultra payment completes — you never pay for the same days twice.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">6. How and when refunds arrive</h2>
            <p>Refunds are issued automatically to your <b className="text-creo-text-secondary">original payment method</b> via our payment processor, Razorpay. They typically reach your account within <b className="text-creo-text-secondary">5–7 business days</b>, depending on your bank.</p>
          </section>

          <section>
            <h2 className="text-creo-text-primary font-semibold text-base mb-3">7. Questions or issues</h2>
            <p>If a refund hasn't arrived within 7 business days, or anything about billing looks wrong, <a href="/contact" className="text-creo-primary hover:text-creo-primary">contact us</a> with the subject "Payment support" and your account email — billing issues are prioritised.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

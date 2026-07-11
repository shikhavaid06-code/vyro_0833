'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

// ✅ STANDALONE REFUND & CANCELLATION POLICY — payment-gateway reviewers
// (Razorpay) require this as its own page, not buried inside the Terms.
// It describes EXACTLY what the code does (see /api/subscription): no
// auto-renewal, instant cancellation, automatic prorated refunds, 7-day
// full money-back. Nothing promised here that isn't implemented.
export default function RefundsPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">Refund &amp; Cancellation Policy</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: July 2026 · Applies to all CRÉO paid plans (Pro and Ultra)</p>

        <div className="space-y-8 text-white/60 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. How billing works</h2>
            <p>CRÉO paid plans are one-time payments covering a fixed period (one month or one year). Plans do <b className="text-white/80">not</b> auto-renew and we never charge your payment method automatically. When your paid period ends, your account simply returns to the Free plan unless you choose to renew.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Cancelling your plan</h2>
            <p>You can cancel at any time from <a href="/settings" className="text-purple-400 hover:text-purple-300">Settings</a> in the app — no emails, no forms, no waiting. Cancellation takes effect immediately: your account switches to the Free plan and your refund (if applicable) is initiated automatically in the same step.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. 7-day money-back guarantee</h2>
            <p>If you cancel within 7 days of purchasing a paid plan, you receive a <b className="text-white/80">full refund</b> of that payment — no questions asked.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Prorated refunds after 7 days</h2>
            <p>After the 7-day window, cancelling refunds the <b className="text-white/80">prorated value of the unused full days</b> remaining in your paid period, calculated automatically per day. Example: cancel a 30-day plan on day 26 and the value of the 4 unused days is refunded. The day you cancel on counts as a used day.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Upgrade credits</h2>
            <p>If you upgrade from Pro to Ultra mid-period, the unused days of your Pro payment are automatically refunded to you when the Ultra payment completes — you never pay for the same days twice.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. How and when refunds arrive</h2>
            <p>Refunds are issued automatically to your <b className="text-white/80">original payment method</b> via our payment processor, Razorpay. They typically reach your account within <b className="text-white/80">5–7 business days</b>, depending on your bank.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Questions or issues</h2>
            <p>If a refund hasn't arrived within 7 business days, or anything about billing looks wrong, <a href="/contact" className="text-purple-400 hover:text-purple-300">contact us</a> with the subject "Payment support" and your account email — billing issues are prioritised.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

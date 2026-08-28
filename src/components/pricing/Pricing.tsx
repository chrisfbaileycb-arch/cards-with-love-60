import React, { useState } from 'react';
import { BRAND, CRM_SUBSCRIBE_URL } from '@/data/cardConfig';
import { BillingCycle, PLANS, PRICING_FAQ, priceLabel } from '@/data/plans';
import { usePlan } from '@/lib/plan';
import { Check, KeyRound, Loader2, Lock, Sparkles, X } from 'lucide-react';

/** Pricing + plan switcher. Activation is local (no billing provider wired up yet). */
const Pricing: React.FC = () => {
  const { plan, isPro, activate, downgrade } = usePlan();
  const [cycle, setCycle] = useState<BillingCycle>(plan.cycle);
  const [pending, setPending] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [note, setNote] = useState<string | null>(null);

  const choose = async (planId: string) => {
    if (planId === 'free') {
      downgrade();
      setNote('You are on Personal. Your people and cards are untouched.');
      return;
    }
    setPending(planId);
    try {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        await fetch(CRM_SUBSCRIBE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            phone: phone.trim() || undefined,
            sms_opt_in: smsOptIn === true,
            source: 'pricing-upgrade',
            tags: ['local-agent', 'pro-interest', cycle === 'annual' ? 'annual' : 'monthly']
          })
        });
      }
      activate(cycle);
      setNote(
        cycle === 'annual'
          ? 'Local Agent unlocked — $79/year. All 50 contact slots, social exporters and branded footers are live.'
          : 'Local Agent unlocked — $9.99/month. All 50 contact slots, social exporters and branded footers are live.'
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <section id="pricing" className="border-y border-[#EDE4D3] bg-[#FAF7F0] py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF8EE] px-3.5 py-1 text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-wider text-[#A4794A] border border-[#E8DEC9]">
            <Sparkles className="h-3.5 w-3.5" /> Simple, Transparent Pricing
          </span>
          <h2 className="mt-3 font-['Fredoka',sans-serif] text-3xl font-bold tracking-tight text-[#1F1D1B] sm:text-4xl">
            Free for Personal Stories. Pro for Brands &amp; Creators.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6D6459] font-medium">
            Create, direct, and export your 30s, 60s, and 90s animated storyboards with complete creative freedom.
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#E8F5E9] px-4 py-1.5 text-xs font-['Fredoka',sans-serif] font-bold text-[#2E7D32] border border-[#C8E6C9]">
            <KeyRound className="h-3.5 w-3.5" /> No complex subscriptions · Direct 3-click export on all plans
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {(['monthly', 'annual'] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`rounded-2xl px-5 py-2.5 text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-wider transition-all ${
                cycle === c
                  ? 'bg-[#1F1D1B] text-[#FFFDF9] shadow-md scale-105'
                  : 'border border-[#EDE4D3] bg-white text-[#8B8177] hover:border-[#E11D48]'
              }`}
            >
              {c === 'monthly' ? 'Monthly' : 'Annual · Save 40%'}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {PLANS.map((p) => {
            const price = priceLabel(p, cycle);
            const current = plan.id === p.id;
            return (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-3xl border-2 bg-[#FFFDF9] p-6 shadow-sm sm:p-8 transition-all duration-300 hover:shadow-md ${
                  p.highlight ? 'border-[#E11D48] ring-2 ring-[#E11D48]/20' : 'border-[#EDE4D3]'
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3.5 left-8 rounded-full bg-gradient-to-r from-[#E11D48] to-[#EAB308] px-4 py-1 text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-wider text-white shadow-md">
                    Most Popular Choice
                  </span>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-['Fredoka',sans-serif] text-2xl font-bold text-[#1F1D1B]">{p.name}</p>
                    <p className="mt-1 text-xs text-[#8B8177] font-medium">{p.audience}</p>
                  </div>
                  {current && (
                    <span className="rounded-full bg-[#E8F5E9] px-3.5 py-1 text-[11px] font-['Fredoka',sans-serif] font-bold uppercase tracking-wider text-[#2E7D32] border border-[#C8E6C9]">
                      Active Plan
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-end gap-2">
                  <span className="font-['Fredoka',sans-serif] text-4xl font-bold text-[#1F1D1B]">{price.amount}</span>
                  <span className="pb-1 text-xs font-bold uppercase tracking-wider text-[#8A7E72]">{price.per}</span>
                </div>
                {p.savingsNote && cycle === 'annual' && (
                  <p className="mt-1 text-xs font-semibold text-[#2E7D32]">{p.savingsNote}</p>
                )}
                <p className="mt-3 text-xs leading-relaxed text-[#6D6459]">{p.blurb}</p>

                <ul className="mt-5 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#FFF8EE] text-[#A4794A] border border-[#EDE4D3]">
                        {f.pro ? <Sparkles className="h-3 w-3 text-[#E11D48]" /> : <Check className="h-3 w-3 text-[#2E7D32]" />}
                      </span>
                      <span>
                        <span className="block text-xs font-bold text-[#1F1D1B]">{f.label}</span>
                        {f.detail && <span className="block text-[11px] leading-relaxed text-[#8B8177]">{f.detail}</span>}
                      </span>
                    </li>
                  ))}
                </ul>

                {p.id === 'pro' && !isPro && (
                  <div className="mt-6 space-y-2 rounded-2xl border border-[#EDE4D3] bg-[#FAF7F0] p-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full rounded-xl border border-[#E0D5C2] bg-white px-3 py-2 text-xs outline-none focus:border-[#E11D48]"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number (optional)"
                      className="w-full rounded-xl border border-[#E0D5C2] bg-white px-3 py-2 text-xs outline-none focus:border-[#E11D48]"
                    />
                    <label className="flex items-start gap-2 text-[11px] text-[#7C7266]">
                      <input
                        type="checkbox"
                        checked={smsOptIn}
                        onChange={(e) => setSmsOptIn(e.target.checked)}
                        className="mt-0.5 accent-[#E11D48]"
                      />
                      <span>Notify me of feature drops and custom cartoon templates.</span>
                    </label>
                  </div>
                )}

                <button
                  onClick={() => choose(p.id)}
                  disabled={pending === p.id || (current && p.id === 'free')}
                  className={`mt-6 inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-xs font-storybook font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-60 ${
                    p.highlight
                      ? 'bg-gradient-to-r from-[#E11D48] to-[#EAB308] text-white shadow-md hover:scale-105 active:scale-95'
                      : 'bg-[#1F1D1B] text-white hover:bg-[#3D3730]'
                  }`}
                >
                  {pending === p.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : current ? (
                    'Current Plan'
                  ) : (
                    `Select ${p.name}`
                  )}
                </button>
                {p.id === 'pro' && isPro && (
                  <button
                    onClick={() => choose('free')}
                    className="mt-2 inline-flex items-center justify-center gap-1.5 text-[11px] text-[#A49A8D] transition hover:text-[#E11D48]"
                  >
                    <X className="h-3 w-3" /> Cancel and go back to Personal
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {note && (
          <p className="mt-6 text-center text-xs font-storybook font-bold text-[#2E7D32]" role="status">
            {note}
          </p>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PRICING_FAQ.map((f) => (
            <div key={f.q} className="rounded-3xl border border-[#EDE4D3] bg-[#FFFDF9] p-5 shadow-xs">
              <p className="flex items-start gap-2 text-xs font-storybook font-bold text-[#1F1D1B]">
                <Lock className="mt-0.5 h-3.5 w-3.5 flex-none text-[#E11D48]" /> {f.q}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#6D6459]">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

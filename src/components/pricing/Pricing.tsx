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
    <section id="pricing" className="border-y border-[#e9e0d1] bg-[#F6F1E8] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A4794A]">Pricing</span>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-[#2C2A29] sm:text-4xl">
            Free for your family. Nine dollars for your pipeline.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#7c7266]">
            {BRAND.short} builds your card in the browser and hands it to your own mailbox, so there is no per-email
            cost to pass on. AI caricature generation runs on our AI service and uses plan credits.
          </p>

          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#e7f0e4] px-3 py-1.5 text-[11px] font-semibold text-[#3d6b46]">
            <KeyRound className="h-3 w-3" /> No email API key, no per-email sending fees, on either plan
          </span>
          <p className="mt-3 text-[11px] leading-relaxed text-[#a49a8d]">
            Prices, limits and AI credit amounts below are provisional and administrator-configurable. AI artwork
            generation may use plan credits; email delivery always happens through your own email app.
          </p>

        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {(['monthly', 'annual'] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                cycle === c
                  ? 'bg-[#2C2A29] text-[#FDFBF7]'
                  : 'border border-[#e0d5c2] bg-white text-[#8b8177] hover:border-[#c9a273]'
              }`}
            >
              {c === 'monthly' ? 'Monthly' : 'Annual · save $41'}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {PLANS.map((p) => {
            const price = priceLabel(p, cycle);
            const current = plan.id === p.id;
            return (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm sm:p-8 ${
                  p.highlight ? 'border-[#A4794A] shadow-[0_24px_60px_-40px_rgba(120,85,40,0.7)]' : 'border-[#e6dccb]'
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-8 rounded-full bg-[#A4794A] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                    Most popular with agents
                  </span>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-2xl text-[#2C2A29]">{p.name}</p>
                    <p className="mt-1 text-xs text-[#8b8177]">{p.audience}</p>
                  </div>
                  {current && (
                    <span className="rounded-full bg-[#e7f0e4] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3d6b46]">
                      Your plan
                    </span>
                  )}
                </div>

                <div className="mt-5 flex items-end gap-2">
                  <span className="font-serif text-4xl text-[#2C2A29]">{price.amount}</span>
                  <span className="pb-1 text-xs uppercase tracking-[0.14em] text-[#a49a8d]">{price.per}</span>
                </div>
                {p.savingsNote && cycle === 'annual' && (
                  <p className="mt-1 text-[11px] font-semibold text-[#3d6b46]">{p.savingsNote}</p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-[#7c7266]">{p.blurb}</p>

                <ul className="mt-5 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#f3e9d8] text-[#8f6739]">
                        {f.pro ? <Sparkles className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-[#2C2A29]">{f.label}</span>
                        {f.detail && <span className="block text-xs leading-relaxed text-[#8b8177]">{f.detail}</span>}
                      </span>
                    </li>
                  ))}
                </ul>

                {p.id === 'pro' && !isPro && (
                  <div className="mt-6 space-y-2 rounded-2xl border border-[#e6dccb] bg-[#fdfbf7] p-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full rounded-lg border border-[#e0d5c2] bg-white px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number (optional)"
                      className="w-full rounded-lg border border-[#e0d5c2] bg-white px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
                    />
                    <label className="flex items-start gap-2 text-[11px] text-[#7c7266]">
                      <input
                        type="checkbox"
                        checked={smsOptIn}
                        onChange={(e) => setSmsOptIn(e.target.checked)}
                        className="mt-0.5 accent-[#A4794A]"
                      />
                      <span>Text me updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
                    </label>
                  </div>
                )}

                <button
                  onClick={() => choose(p.id)}
                  disabled={pending === p.id || (current && p.id === 'free')}
                  className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition disabled:opacity-60 ${
                    p.highlight
                      ? 'bg-[#A4794A] text-white hover:bg-[#8f6739]'
                      : 'border border-[#d9cbb6] bg-white text-[#5c5248] hover:border-[#c9a273]'
                  }`}
                >
                  {pending === p.id && <Loader2 className="h-4 w-4 animate-spin" />}
                  {current
                    ? p.id === 'free'
                      ? 'You are on Personal'
                      : 'Local Agent is active'
                    : p.id === 'free'
                    ? 'Switch back to Personal'
                    : p.cta}
                </button>
                {p.id === 'pro' && isPro && (
                  <button
                    onClick={() => choose('free')}
                    className="mt-2 inline-flex items-center justify-center gap-1.5 text-[11px] text-[#a49a8d] transition hover:text-[#8A3B44]"
                  >
                    <X className="h-3 w-3" /> Cancel and go back to Personal
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {note && (
          <p className="mt-6 text-center text-sm font-medium text-[#3d6b46]" role="status">
            {note}
          </p>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PRICING_FAQ.map((f) => (
            <div key={f.q} className="rounded-2xl border border-[#e6dccb] bg-white p-5">
              <p className="flex items-start gap-2 text-sm font-semibold text-[#2C2A29]">
                <Lock className="mt-0.5 h-3.5 w-3.5 flex-none text-[#A4794A]" /> {f.q}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#8b8177]">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

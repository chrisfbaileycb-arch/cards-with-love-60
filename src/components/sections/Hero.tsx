import React from 'react';
import { BRAND, HERO_IMAGE } from '@/data/cardConfig';
import { ArrowRight, CalendarClock, KeyRound, PenLine, Sparkles } from 'lucide-react';

const scrollTo = (href: string) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const STATS = [
  { value: 'No email API key', label: 'sends from your own email' },
  { value: '4 sizes', label: 'card, 1:1, 9:16, 16:9' },
  { value: '900×1200', label: 'crisp static PNG' }
];

const Hero: React.FC = () => (
  <section className="relative overflow-hidden bg-[#FDFBF7]">
    <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#f0dfc6] blur-3xl" />
    <div className="pointer-events-none absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-[#f3dede] blur-3xl" />

    <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#e6dccb] bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#A4794A]">
          <Sparkles className="h-3.5 w-3.5" /> {BRAND.tagline}
        </span>
        <h1 className="mt-6 font-serif text-4xl leading-[1.08] text-[#2C2A29] sm:text-5xl lg:text-6xl">
          Send love and follow-ups,
          <span className="block italic text-[#A4794A]">beautifully.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#6d6459]">
          Upload a photo, turn it into a warm carnival caricature, stamp it with real handwriting — then send it from
          your own inbox. A birthday card for your wife on a Tuesday, or a thank-you to the forty people in your
          pipeline. Same card, your name on it, no marketing machine.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#e7f0e4] px-3 py-1.5 text-xs font-semibold text-[#3d6b46]">
          <KeyRound className="h-3.5 w-3.5" /> Zero email API keys · nothing to connect · nothing per-email to pay
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => scrollTo('#studio')}
            className="inline-flex items-center gap-2 rounded-full bg-[#2C2A29] px-7 py-3.5 text-sm font-semibold text-[#FDFBF7] transition hover:bg-[#413d3a]"
          >
            <PenLine className="h-4 w-4" /> Create your card
          </button>
          <button
            onClick={() => scrollTo('#gallery')}
            className="inline-flex items-center gap-2 rounded-full border border-[#d9cbb6] bg-white px-6 py-3.5 text-sm font-medium text-[#5c5248] transition hover:border-[#c9a273]"
          >
            See the card styles <ArrowRight className="h-4 w-4" />
          </button>
        </div>


        <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-[#eee5d8] pt-6">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="font-serif text-xl text-[#2C2A29]">{s.value}</dt>
              <dd className="text-[11px] uppercase tracking-wide text-[#a49a8d]">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative">
        <div className="overflow-hidden rounded-[28px] border border-[#e6dccb] shadow-[0_40px_80px_-40px_rgba(70,55,35,0.6)]">
          <img src={HERO_IMAGE} alt="A handmade caricature greeting card on a linen desk" className="w-full object-cover" />
        </div>
        <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl border border-[#e6dccb] bg-white/95 px-4 py-3 shadow-lg sm:left-10">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3e9d8] text-[#8f6739]">
            <CalendarClock className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[#2C2A29]">Scheduled: Apr 14, 8:00 AM</p>
            <p className="text-[11px] text-[#8b8177]">"Just because" → Sarah</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;

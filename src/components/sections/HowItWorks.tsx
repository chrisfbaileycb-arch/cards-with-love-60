import React from 'react';
import { ArrowRight, CheckCircle2, Heart, Sparkles, Wand2 } from 'lucide-react';

const STEPS = [
  {
    step: 'Click 1',
    badge: '1. Describe IT',
    title: 'Type your idea, memory, or script',
    description:
      'Paste your script, write a heartfelt memory, or type a simple concept. It can be as simple as: "Re-enact our first date in the rain with my wife", "Chef Marco’s flaming truffle pasta specialty", or "My dog Max acting like a secret agent".',
    accentColor: '#E11D48',
    pillBg: '#FFE4E6',
    pillText: '#9F1239',
    bullets: [
      'Choose 30s, 60s, or 90s cartoon duration',
      'Select 3D Pixar, 2D Vector, Classic Comic, or Storyboard style',
      'Pick landscape (16:9), portrait reels (9:16), or square (1:1)'
    ]
  },
  {
    step: 'Click 2',
    badge: '2. Generate IT',
    title: 'LovAnimate orchestrates the entire cartoon',
    description:
      'Hit Generate and watch the full cinematic sequence come alive: storyboard frames, scene-by-scene character animations, natural voiceover dialogue narration, and sound effect layers generated in seconds.',
    accentColor: '#EAB308',
    pillBg: '#FEF3C7',
    pillText: '#92400E',
    bullets: [
      'Character Anchor consistency across all scenes',
      'Emotional voiceover narration and sound FX presets',
      'Live interactive video storyboard playback'
    ]
  },
  {
    step: 'Click 3',
    badge: '3. Download & Share IT',
    title: 'Download instantly & share wherever you want',
    description:
      'No complex schedulers, mailing lists, or email servers needed. Download your full cartoon video storyboard, high-res comic strip grid, or MP3 audio tracks directly to your phone or desktop, and share it anywhere.',
    accentColor: '#10B981',
    pillBg: '#D1FAE5',
    pillText: '#065F46',
    bullets: [
      'One-click high-res video & storyboard image export',
      'Download individual scene images & voiceover tracks',
      'Post straight to Instagram, TikTok, WhatsApp, or send to loved ones'
    ]
  }
];

const scrollTo = (href: string) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const HowItWorks: React.FC = () => (
  <section id="how-it-works" className="relative bg-[#1A1816] py-16 text-white sm:py-24 overflow-hidden">
    {/* Ambient Glow */}
    <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[#E11D48]/10 blur-3xl" />
    <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#EAB308]/10 blur-3xl" />

    <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#3D3833] bg-[#292522] px-4 py-1.5 text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-wider text-[#EAB308]">
          <Sparkles className="h-3.5 w-3.5" /> How It Works
        </div>
        <h2 className="mt-4 font-['Fredoka',sans-serif] text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Creating Animated Cartoons <br className="hidden sm:block" />
          <span className="text-[#EAB308]">With Just 3 Clicks</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#A89F91] leading-relaxed font-medium">
          From heartfelt wedding anniversaries and restaurant specials to sermons of faith and quirky bedtime tales.
        </p>
      </div>

      {/* 3 Click Cards Grid */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s, idx) => (
          <div
            key={s.step}
            className="group relative flex flex-col justify-between rounded-3xl border-2 border-[#332F2B] bg-[#24211E] p-7 transition duration-300 hover:border-[#EAB308] hover:bg-[#2B2724] hover:-translate-y-1 shadow-xl"
          >
            <div>
              {/* Step Pill */}
              <div className="flex items-center justify-between">
                <span
                  className="inline-block rounded-full px-3.5 py-1 text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-wider shadow-xs"
                  style={{ backgroundColor: s.pillBg, color: s.pillText }}
                >
                  {s.step}
                </span>
                <span className="text-xs font-['Fredoka',sans-serif] font-bold tracking-wider text-[#A89F91]">
                  Step {idx + 1} of 3
                </span>
              </div>

              <h3 className="mt-5 font-['Fredoka',sans-serif] text-xl font-bold text-white leading-snug">
                {s.badge}
              </h3>
              <p className="mt-1 text-xs font-semibold text-[#EAB308]">
                {s.title}
              </p>

              <p className="mt-3 text-xs leading-relaxed text-[#BDB5A8]">
                {s.description}
              </p>

              {/* Bullet list */}
              <ul className="mt-5 space-y-2 border-t border-[#38332E] pt-4">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs font-medium text-[#E0D8CB]">
                    <CheckCircle2 className="h-4 w-4 flex-none text-[#EAB308] mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => scrollTo('#studio')}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[#423C35] bg-[#1E1B19] py-2.5 text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-wider text-white transition group-hover:border-[#EAB308] group-hover:bg-[#EAB308] group-hover:text-black"
              >
                <span>Try {s.step}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Direct CTA Bar */}
      <div className="mt-14 rounded-3xl border border-[#38332E] bg-gradient-to-r from-[#291F22] via-[#26211C] to-[#1F221E] p-8 sm:p-10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-white">
            Ready to animate what you love?
          </h4>
          <p className="mt-1.5 text-sm text-[#A89F91]">
            Turn your script or premise into a custom animated cartoon right now.
          </p>
        </div>
        <button
          onClick={() => scrollTo('#studio')}
          className="flex-none inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#E11D48] to-[#EAB308] px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:scale-105 active:scale-95"
        >
          <Wand2 className="h-4 w-4" /> Open Cartoon Studio
        </button>
      </div>
    </div>
  </section>
);

export default HowItWorks;

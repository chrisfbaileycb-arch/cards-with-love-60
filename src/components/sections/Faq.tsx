import React, { useState } from 'react';
import { Minus, Plus, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the 3-click cartoon generation process work?',
    a: 'Step 1: Describe your idea or paste your script and pick your cartoon duration (30s, 60s, or 90s). Step 2: LovAnimate orchestrates character anchor consistency, scene visuals, and voiceover dialogue. Step 3: Download your HD storyboard, video sequence, or share directly!'
  },
  {
    q: 'What are the Palace Guard character slots?',
    a: 'Palace Guards are animated character anchor slots flanking the Sanctuary & Studio. They showcase responsive, floating character keyframes that serve as visual anchors for consistent character styles (such as 3D Pixar, 2D Vector, Classic Comic, and Storyboard Pencil) across all scenes.'
  },
  {
    q: 'Can I customize scene dialogue and camera actions after generation?',
    a: 'Absolutely! In Step 2 (Script & Scene Review), you can edit dialogue lines, modify visual prompts, tweak sound FX cues, regenerate individual scenes, or upload custom reference images.'
  },
  {
    q: 'What aspect ratios are supported?',
    a: 'You can export in standard widescreen landscape (16:9) for YouTube & presentations, vertical portrait (9:16) for Instagram Reels & TikTok, or square (1:1) for social feed carousels.'
  },
  {
    q: 'Are there hidden subscription traps or complex email schedulers?',
    a: 'None! LovAnimate puts you in direct creative control. You can generate, preview in the interactive story player, and download high-resolution assets directly to your device with zero friction.'
  }
];

const Faq: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#FFFDF9] py-16 sm:py-24 border-t border-[#EDE4D3]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF8EE] px-3.5 py-1 text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-wider text-[#A4794A] border border-[#E8DEC9]">
            <HelpCircle className="h-3.5 w-3.5" /> Good to Know
          </span>
          <h2 className="mt-3 font-['Fredoka',sans-serif] text-3xl font-bold leading-tight text-[#1F1D1B] sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6D6459] font-medium">
            Everything you need to know about directing your own animated shorts with LovAnimate.
          </p>
        </div>

        <div className="divide-y divide-[#EDE4D3] rounded-3xl border-2 border-[#EDE4D3] bg-white px-2 shadow-xs">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="px-4">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-sm font-['Fredoka',sans-serif] font-bold text-[#1F1D1B]">{item.q}</span>
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-[#EDE4D3] bg-[#FAF7F0] text-[#E11D48] transition-transform">
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                {isOpen && <p className="-mt-1 pb-5 pr-10 text-xs leading-relaxed text-[#6D6459] font-medium">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;

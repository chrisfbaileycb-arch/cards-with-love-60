import React from 'react';
import { CalendarClock, Image as ImageIcon, PenLine, ShieldCheck, Share2, Type } from 'lucide-react';

const STEPS = [
  {
    icon: ImageIcon,
    title: 'Upload one photo',
    body: 'A face, a couple, the dog. It stays private — we only use it to draw the artwork you asked for.'
  },
  {
    icon: PenLine,
    title: 'Pick the art style',
    body: 'Carnival ink caricature, soft watercolor, pop-art lines, pastel or vintage ink. Always a still image.'
  },
  {
    icon: Type,
    title: 'Write it by hand',
    body: 'Six real handwriting fonts, your own ink color, and a greeting line stamped onto card stock.'
  },
  {
    icon: CalendarClock,
    title: 'Put it on the calendar',
    body: 'Choose the date and time. Repeat yearly for birthdays and anniversaries so you never forget again.'
  },
  {
    icon: Share2,
    title: 'Email it or post it',
    body: 'One click opens your own email with the card copied to your clipboard. Or download the PNG and post it.'
  },
  {
    icon: ShieldCheck,
    title: 'No marketing machine',
    body: 'A short list of people you love and a handful of favorite clients. No blasts, no tracking pixels.'
  }
];

const HowItWorks: React.FC = () => (
  <section id="how" className="relative bg-[#2C2A29] py-16 text-[#FDFBF7] sm:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-8">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D2AE68]">How it works</span>
        <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
          A tiny pipeline that quietly makes you look thoughtful.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[#c9c1b6]">
          Photo in, caricature out, handwriting layered on a static card canvas, then saved to your send calendar with the
          note and address ready. On the day you tap once and it leaves your own inbox — no API keys, no sending service.
        </p>

      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className="rounded-2xl border border-[#41403c] bg-[#333230] p-6 transition duration-300 hover:border-[#D2AE68]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3f3e3a] text-[#D2AE68]">
                <s.icon className="h-4 w-4" />
              </span>
              <span className="font-serif text-2xl text-[#4e4c47]">0{i + 1}</span>
            </div>
            <h3 className="mt-4 font-serif text-lg">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#b8b0a5]">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-4 rounded-2xl border border-[#41403c] bg-[#333230] p-6 sm:grid-cols-4">
        {[
          ['Photo', 'you upload'],
          ['Caricature', 'drawn in your browser'],
          ['Card canvas', 'text stamped'],
          ['Your inbox', 'you press send']

        ].map(([label, sub], i) => (
          <div key={label} className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D2AE68]">{label}</p>
            <p className="mt-1 text-sm text-[#b8b0a5]">{sub}</p>
            {i < 3 && <span className="absolute right-0 top-2 hidden text-[#4e4c47] sm:block">→</span>}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;

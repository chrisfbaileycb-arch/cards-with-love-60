import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

const FAQS = [
  {
    q: 'Do I need an email API key or an email service?',
    a: 'You do not need an email API key. When a card is ready, the studio hands the finished PNG to your phone\u2019s share sheet or opens a pre-filled draft in your own mail app — Gmail, Outlook, Apple Mail, whatever you already use. You press send, so it comes from your real address. AI artwork generation is separate and may use plan credits.'
  },
  {
    q: 'Is the caricature animated in any way?',
    a: 'No. Every card is a single static PNG at 900 × 1200 pixels. Nothing dances, blinks or wiggles — it is a still drawing, like something a street artist handed you.'
  },
  {
    q: 'What happens to the photo I upload?',
    a: 'Your photo stays in the browser while you edit. If you choose Draw my caricature, it is sent to the app\u2019s AI generation service to create the artwork. Finished card images can be stored in your private library for re-use; they are not published as a public post by Kindred.'
  },
  {
    q: 'How does scheduling work without a server sending for me?',
    a: 'Your send calendar keeps the card, the note and the address prepared. On the day, open the Send calendar and hit "Send from my email" — one tap and the draft is already written and addressed. Mark it sent, or push it a day if life happens.'
  },
  {
    q: 'Can I use this for clients as well as family?',
    a: 'That is exactly the idea. Tag someone as a client, pick the Client Appreciation template, and work through a small list a handful at a time. It stays personal because every card leaves your own mailbox, one at a time — not a blast.'
  },
  {
    q: 'Can I post the card on Facebook or Instagram instead?',
    a: 'Yes. Export it as a 1:1 square for a feed post, 9:16 for a story or Reel cover, or 16:9 for a banner or listing flyer. There are no social connectors on purpose — you download the image and upload it yourself.'
  },
  {
    q: 'Can I print the card instead of emailing it?',
    a: 'Download the PNG and send it to any print shop or home printer. At 900 × 1200 it prints crisply at roughly 5 × 7 inches.'
  }
];


const Faq: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#FDFBF7] py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A4794A]">Good to know</span>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-[#2C2A29] sm:text-4xl">
            The small print, written like a human.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#7c7266]">
            No subscriptions to decode, no social logins, no "engagement". Just a card, a date, and a person who will
            be glad you thought of them.
          </p>
        </div>

        <div className="divide-y divide-[#eee5d8] rounded-3xl border border-[#e6dccb] bg-white px-2 shadow-sm">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="px-4">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-sm font-semibold text-[#2C2A29]">{item.q}</span>
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-[#e0d5c2] text-[#A4794A]">
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                {isOpen && <p className="-mt-1 pb-5 pr-10 text-sm leading-relaxed text-[#7c7266]">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;

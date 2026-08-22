import React, { useState } from 'react';
import { BRAND, CRM_SUBSCRIBE_URL } from '@/data/cardConfig';
import { Loader2, Mail, PenLine } from 'lucide-react';


const scrollTo = (href: string) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Studio',
    links: [
      { label: 'Make a card', href: '#studio' },
      { label: 'Card styles', href: '#gallery' },
      { label: 'How it works', href: '#how' }
    ]
  },
  {
    title: 'Sending',
    links: [
      { label: 'Your people', href: '#people' },
      { label: 'My identity', href: '#settings' },
      { label: 'Send calendar', href: '#outbox' },
      { label: 'Export for social', href: '#studio' }
    ]
  },

  {
    title: 'Occasions',
    links: [
      { label: 'Birthdays', href: '#gallery' },
      { label: 'Anniversaries', href: '#gallery' },
      { label: 'Thank you notes', href: '#gallery' },
      { label: 'Client appreciation', href: '#gallery' }
    ]
  }
];

const SiteFooter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [note, setNote] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setNote('That email address does not look right.');
      return;
    }
    setStatus('busy');
    try {
      await fetch(CRM_SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          sms_opt_in: smsOptIn === true,
          source: 'footer-signup',
          tags: ['newsletter', 'kindred-cards']
        })
      });
      setStatus('done');
      setNote('You are in. Card ideas and seasonal templates, never spam.');
      setEmail('');
      setPhone('');
      setName('');
    } catch {
      setStatus('error');
      setNote('Something went wrong. Try again in a moment.');
    }
  };

  return (
    <footer className="bg-[#221F1E] pt-16 text-[#c9c1b6]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#FDFBF7] text-[#2C2A29]">
                <PenLine className="h-4 w-4" />
              </span>
              <span className="font-serif text-lg text-[#FDFBF7]">{BRAND.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">{BRAND.promise}</p>


            <form onSubmit={submit} className="mt-6 max-w-sm space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D2AE68]">
                Get new templates + card ideas
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name"
                className="w-full rounded-lg border border-[#3d3b38] bg-[#2b2927] px-3 py-2 text-sm text-[#FDFBF7] outline-none placeholder:text-[#7d766d] focus:border-[#D2AE68]"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-lg border border-[#3d3b38] bg-[#2b2927] px-3 py-2 text-sm text-[#FDFBF7] outline-none placeholder:text-[#7d766d] focus:border-[#D2AE68]"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (optional)"
                className="w-full rounded-lg border border-[#3d3b38] bg-[#2b2927] px-3 py-2 text-sm text-[#FDFBF7] outline-none placeholder:text-[#7d766d] focus:border-[#D2AE68]"
              />
              <label className="flex items-start gap-2 text-[11px] text-[#9a9288]">
                <input
                  type="checkbox"
                  checked={smsOptIn}
                  onChange={(e) => setSmsOptIn(e.target.checked)}
                  className="mt-0.5 accent-[#D2AE68]"
                />
                <span>Text me updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
              </label>
              <button
                type="submit"
                disabled={status === 'busy'}
                className="inline-flex items-center gap-2 rounded-full bg-[#D2AE68] px-5 py-2.5 text-sm font-semibold text-[#2C2A29] transition hover:bg-[#c39d53] disabled:opacity-60"
              >
                {status === 'busy' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {status === 'busy' ? 'Signing you up…' : 'Keep me posted'}
              </button>
              {note && (
                <p className={`text-xs ${status === 'error' ? 'text-[#e39b9b]' : 'text-[#9ec7a4]'}`}>{note}</p>
              )}
            </form>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FDFBF7]">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <button onClick={() => scrollTo(l.href)} className="text-sm transition hover:text-[#D2AE68]">
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-[#332f2d] py-6 text-xs text-[#7d766d] sm:flex-row">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. Made for the people who keep your cards on the fridge.
          </p>
          <p>Static PNG cards · sent from your own inbox · no email API keys, no social connectors, on purpose.</p>
        </div>

      </div>
    </footer>
  );
};

export default SiteFooter;

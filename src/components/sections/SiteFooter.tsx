import React, { useState } from 'react';
import { Heart, Loader2, Sparkles, Wand2, Download, Share2, Film } from 'lucide-react';

const scrollTo = (href: string) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const COLUMNS = [
  {
    title: 'Studio & Create',
    links: [
      { label: 'Start Cartoon Studio', href: '#studio' },
      { label: 'How It Works (3 Clicks)', href: '#how-it-works' },
      { label: 'Sample Cartoons', href: '#samples' },
      { label: 'My Saved Cartoons', href: '#library' }
    ]
  },
  {
    title: 'Templates & Ideas',
    links: [
      { label: 'First Dates & Anniversaries', href: '#samples' },
      { label: 'Restaurant & Food Specialties', href: '#samples' },
      { label: 'Visions of Faith & Parables', href: '#samples' },
      { label: 'Best Friends, Pets & Bedtime', href: '#samples' }
    ]
  },
  {
    title: 'Formats & Exports',
    links: [
      { label: '30s, 60s & 90s Videos', href: '#studio' },
      { label: 'Printable Storyboard Sheets', href: '#studio' },
      { label: 'Voiceover MP3 Tracks', href: '#studio' },
      { label: 'Instagram & TikTok 9:16', href: '#studio' }
    ]
  }
];

const SiteFooter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [note, setNote] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setNote('Please enter a valid email address.');
      return;
    }
    setStatus('busy');
    try {
      setStatus('done');
      setNote('You are on the list! We will notify you when new art styles and character models drop.');
      setEmail('');
    } catch {
      setStatus('error');
      setNote('Something went wrong. Please try again.');
    }
  };

  return (
    <footer className="bg-[#141211] pt-16 text-[#A89F91] border-t border-[#292522]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-gradient-to-tr from-[#E11D48] to-[#F59E0B] text-white shadow-md">
                <Heart className="h-5 w-5 fill-white" />
              </span>
              <span className="text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
                Lov<span className="text-[#E11D48]">Animate</span>
              </span>
            </div>
            
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#B8AF9F]">
              Turn first dates, restaurant specialties, visions of faith, and pure imagination into 30, 60, and 90-second animated cartoons & storyboards. Create, download, and share wherever you want.
            </p>

            <form onSubmit={submit} className="mt-6 max-w-sm space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#EAB308]">
                Get new cartoon styles & templates
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 rounded-xl border border-[#3D3730] bg-[#1E1B19] px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-[#6B6155] focus:border-[#EAB308]"
                />
                <button
                  type="submit"
                  disabled={status === 'busy'}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#EAB308] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
                >
                  {status === 'busy' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Join
                </button>
              </div>
              {note && (
                <p className={`text-xs ${status === 'error' ? 'text-[#F87171]' : 'text-[#34D399]'}`}>{note}</p>
              )}
            </form>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <button
                        onClick={() => scrollTo(l.href)}
                        className="text-xs font-medium text-[#A89F91] transition hover:text-[#EAB308]"
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-[#292522] py-6 text-xs text-[#7A7165] sm:flex-row">
          <p>
            © {new Date().getFullYear()} LovAnimate. Turn ideas and memories into animated cartoons with 3 clicks.
          </p>
          <p>Instant video exports · High-res Storyboard PNGs · MP3 Voiceovers · Share anywhere</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;

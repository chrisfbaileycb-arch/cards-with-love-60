import React, { useState } from 'react';
import { BRAND } from '@/data/cardConfig';
import { useAuth } from '@/contexts/AuthContext';
import { useAiCredits, creditLabel } from '@/lib/aiCredits';
import AuthDialog from '@/components/auth/AuthDialog';
import { LogIn, LogOut, Menu, PenLine, X } from 'lucide-react';

const LINKS = [
  { label: 'Studio', href: '#studio' },
  { label: 'Library', href: '#library' },
  { label: 'People', href: '#people' },
  { label: 'Outreach', href: '#outreach' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Send calendar', href: '#outbox' }
];




const scrollTo = (href: string) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const SiteHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { summary } = useAiCredits(user?.id ?? null);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e9e0d1] bg-[#FDFBF7]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 text-left">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#2C2A29] text-[#FDFBF7]">
            <PenLine className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-lg tracking-tight text-[#2C2A29]">{BRAND.name}</span>
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-[#a49a8d] sm:block">
              {BRAND.tagline}
            </span>
          </span>
        </button>


        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="text-sm text-[#6d6459] transition hover:text-[#2C2A29]"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && summary.authenticated && (
            <span className="hidden rounded-full border border-[#e0d5c2] bg-[#fdfbf7] px-3 py-1.5 text-[11px] font-medium text-[#5c5248] lg:inline-block">
              {creditLabel(summary.total_remaining)}
            </span>
          )}
          {user ? (
            <button
              onClick={() => void signOut()}
              className="hidden items-center gap-1.5 rounded-full border border-[#e0d5c2] px-4 py-2 text-sm font-medium text-[#5c5248] transition hover:border-[#c9a273] sm:inline-flex"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="hidden items-center gap-1.5 rounded-full border border-[#e0d5c2] px-4 py-2 text-sm font-medium text-[#5c5248] transition hover:border-[#c9a273] sm:inline-flex"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </button>
          )}
          <button
            onClick={() => scrollTo('#studio')}
            className="hidden rounded-full bg-[#A4794A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8f6739] sm:block"
          >
            Make a card
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="rounded-full border border-[#e0d5c2] p-2 text-[#5c5248] md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[#e9e0d1] bg-[#FDFBF7] px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => {
                scrollTo(l.href);
                setOpen(false);
              }}
              className="block w-full py-2 text-left text-sm text-[#5c5248]"
            >
              {l.label}
            </button>
          ))}
          {user ? (
            <button
              onClick={() => {
                void signOut();
                setOpen(false);
              }}
              className="block w-full py-2 text-left text-sm font-medium text-[#5c5248]"
            >
              Sign out{summary.authenticated ? ` · ${creditLabel(summary.total_remaining)}` : ''}
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthOpen(true);
                setOpen(false);
              }}
              className="block w-full py-2 text-left text-sm font-medium text-[#5c5248]"
            >
              Sign in
            </button>
          )}
        </nav>
      )}

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
};

export default SiteHeader;

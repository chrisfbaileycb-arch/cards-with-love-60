import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAiCredits, creditLabel } from '@/lib/aiCredits';
import AuthDialog from '@/components/auth/AuthDialog';
import { Heart, LogIn, LogOut, Menu, Sparkles, Video, Wand2, X } from 'lucide-react';

const LINKS = [
  { label: 'Create in 3 Clicks', href: '#studio' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Sample Cartoons', href: '#samples' },
  { label: 'My Library', href: '#library' },
  { label: 'Pricing', href: '#pricing' }
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
    <header className="sticky top-0 z-40 border-b border-[#F0E6D8] bg-[#FDFBF7]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 text-left group">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-gradient-to-tr from-[#E11D48] to-[#F59E0B] text-white shadow-md transition group-hover:scale-105">
            <Heart className="h-5 w-5 fill-white" />
          </span>
          <span className="leading-tight">
            <span className="block text-xl font-bold tracking-tight text-[#1F1D1B] font-['Plus_Jakarta_Sans',sans-serif]">
              Lov<span className="text-[#E11D48]">Animate</span>
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9E8E7D] sm:block">
              Create · Animate · Share What You Love
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="text-sm font-medium text-[#6B6155] transition hover:text-[#1F1D1B] hover:scale-105"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {user && summary.authenticated && (
            <span className="hidden rounded-full border border-[#E8DEC9] bg-[#FFF8EE] px-3.5 py-1.5 text-xs font-semibold text-[#8C6228] lg:inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#EAB308]" /> {creditLabel(summary.total_remaining)}
            </span>
          )}
          {user ? (
            <button
              onClick={() => void signOut()}
              className="hidden items-center gap-1.5 rounded-full border border-[#E2D6C0] px-4 py-2 text-xs font-semibold text-[#5C5248] transition hover:bg-[#F3EDE2] sm:inline-flex"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="hidden items-center gap-1.5 rounded-full border border-[#E2D6C0] px-4 py-2 text-xs font-semibold text-[#5C5248] transition hover:bg-[#F3EDE2] sm:inline-flex"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </button>
          )}
          <button
            onClick={() => scrollTo('#studio')}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E11D48] to-[#EAB308] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:opacity-95 hover:shadow-lg active:scale-95"
          >
            <Wand2 className="h-4 w-4" /> Start Animating
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="rounded-full border border-[#E2D6C0] p-2 text-[#5C5248] md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[#F0E6D8] bg-[#FDFBF7] px-4 py-3 md:hidden space-y-1">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => {
                scrollTo(l.href);
                setOpen(false);
              }}
              className="block w-full py-2.5 text-left text-sm font-medium text-[#5C5248] hover:text-[#1F1D1B]"
            >
              {l.label}
            </button>
          ))}
          <div className="pt-2 border-t border-[#EFE5D5]">
            {user ? (
              <button
                onClick={() => {
                  void signOut();
                  setOpen(false);
                }}
                className="block w-full py-2 text-left text-xs font-semibold text-[#5C5248]"
              >
                Sign out{summary.authenticated ? ` · ${creditLabel(summary.total_remaining)}` : ''}
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthOpen(true);
                  setOpen(false);
                }}
                className="block w-full py-2 text-left text-xs font-semibold text-[#5C5248]"
              >
                Sign in / Create Account
              </button>
            )}
          </div>
        </nav>
      )}

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
};

export default SiteHeader;


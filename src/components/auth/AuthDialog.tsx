import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  reason?: string;
};

const AuthDialog: React.FC<Props> = ({ open, onClose, reason }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ text: 'That email address does not look right.', tone: 'error' });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', tone: 'error' });
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        onClose();
      } else {
        const { needsConfirmation } = await signUp(email, password);
        if (needsConfirmation) {
          setMessage({ text: 'Check your email to confirm the account, then sign in.', tone: 'ok' });
        } else {
          onClose();
        }
      }
    } catch (err) {
      setMessage({ text: (err as Error).message || 'Could not sign you in.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2A29]/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kindred-auth-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#e6dccb] bg-[#FDFBF7] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="kindred-auth-title" className="font-serif text-2xl text-[#2C2A29]">
              {mode === 'signin' ? 'Sign in to Kindred' : 'Create your Kindred account'}
            </h2>
            <p className="mt-1 text-sm text-[#7c7266]">
              {reason ||
                'An account keeps your AI drawing credits with you. Everything else in the studio works without signing in.'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sign in"
            className="rounded-full p-1 text-[#8b8177] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A4794A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e0d5c2] bg-white px-3 py-2 text-sm text-[#2C2A29] outline-none focus:border-[#c9a273]"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Password</span>
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e0d5c2] bg-white px-3 py-2 text-sm text-[#2C2A29] outline-none focus:border-[#c9a273]"
            />
          </label>

          {message && (
            <p
              role="status"
              className={`text-xs ${message.tone === 'error' ? 'text-[#a05a5a]' : 'text-[#5c7a53]'}`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2C2A29] px-6 py-3 text-sm font-semibold text-[#FDFBF7] transition hover:bg-[#413d3a] disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setMessage(null);
          }}
          className="mt-3 w-full text-center text-xs text-[#8b8177] underline underline-offset-2 transition hover:text-[#5c5248]"
        >
          {mode === 'signin' ? 'No account yet? Create one — new accounts start with 3 AI drawings.' : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default AuthDialog;

import React, { useRef, useState } from 'react';
import { ART_STYLES } from '@/data/cardConfig';
import { CardDraft, fileToDataUrl } from '@/lib/cardRender';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { creditLabel, recordPhotoConsent, useAiCredits } from '@/lib/aiCredits';
import AuthDialog from '@/components/auth/AuthDialog';
import AiConsentDialog from '@/components/studio/AiConsentDialog';
import { ImagePlus, Loader2, Sparkles, Trash2, ZoomIn } from 'lucide-react';

type Props = {
  draft: CardDraft;
  update: (patch: Partial<CardDraft>) => void;
  notify: (msg: string, tone?: 'ok' | 'error') => void;
};

const newRequestId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `req-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

const PhotoStep: React.FC<Props> = ({ draft, update, notify }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sourcePhoto, setSourcePhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);

  const { user } = useAuth();
  const { summary, refresh } = useAiCredits(user?.id ?? null);
  const remaining = summary.authenticated ? summary.total_remaining ?? 0 : null;
  const outOfCredits = summary.authenticated && (summary.total_remaining ?? 0) <= 0;

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Please choose an image file.', 'error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      notify('That photo is over 8MB. Try a smaller one.', 'error');
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setSourcePhoto(dataUrl);
    update({ artwork: dataUrl, useAiArt: false });
    notify('Photo added. Pick a style, then draw the caricature.');
  };

  const runGeneration = async () => {
    const base = sourcePhoto || draft.artwork;
    if (!base || !base.startsWith('data:')) {
      notify('Upload a photo first so the artist has something to draw.', 'error');
      return;
    }
    if (busy) return; // a double-click can never spend two credits
    setBusy(true);
    const requestId = newRequestId();
    try {
      const { data, error } = await supabase.functions.invoke('generate-caricature', {
        body: { imageDataUrl: base, styleId: draft.styleId, requestId }
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.imageDataUrl) throw new Error('No artwork came back. Try again.');
      update({ artwork: data.imageDataUrl, useAiArt: true });
      notify('Your caricature is ready.');
    } catch (err) {
      notify((err as Error).message || 'The artist is on a break. Try again.', 'error');
    } finally {
      setBusy(false);
      void refresh();
    }
  };

  const drawCaricature = async () => {
    if (busy) return;
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (!summary.has_photo_consent) {
      setConsentOpen(true);
      return;
    }
    if (outOfCredits) {
      notify('You have no AI drawings left. Your photo, filters and every send option still work.', 'error');
      return;
    }
    await runGeneration();
  };

  const acceptConsent = async () => {
    if (!user) return;
    try {
      await recordPhotoConsent(user.id);
      await refresh();
      setConsentOpen(false);
      await runGeneration();
    } catch (err) {
      notify((err as Error).message || 'Could not record consent.', 'error');
    }
  };

  const revertToPhoto = () => {
    if (!sourcePhoto) return;
    update({ artwork: sourcePhoto, useAiArt: false });
    notify('Back to your original photo with a style filter.');
  };


  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-2xl text-[#2C2A29]">1. Add the photo</h3>
        <p className="mt-1 text-sm text-[#7c7266]">
          A clear, well-lit face works best — people or pets. Choosing “Draw my caricature” sends the selected photo to
          our AI generation service. Style filters and original-photo cards stay on your device.
        </p>
      </div>


      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className="rounded-2xl border-2 border-dashed border-[#ddd0bb] bg-[#fdfbf7] p-6 text-center transition hover:border-[#c9a273]"

      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {draft.artwork ? (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:text-left">
            <img
              src={draft.artwork}
              alt="Selected artwork"
              className="h-24 w-24 rounded-xl border border-[#e6dccb] object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#2C2A29]">
                {draft.useAiArt ? 'Caricature artwork applied' : 'Photo ready with style filter'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="rounded-full border border-[#d9cbb6] px-4 py-1.5 text-xs font-medium text-[#5c5248] transition hover:bg-white"

                >
                  Replace photo
                </button>
                {draft.useAiArt && sourcePhoto && (
                  <button
                    onClick={revertToPhoto}
                    className="rounded-full border border-[#d9cbb6] px-4 py-1.5 text-xs font-medium text-[#5c5248] transition hover:bg-white"
                  >
                    Use original photo
                  </button>
                )}
                <button
                  onClick={() => {
                    setSourcePhoto(null);
                    update({ artwork: null, useAiArt: false });
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-[#e3c9c9] px-4 py-1.5 text-xs font-medium text-[#a05a5a] transition hover:bg-white"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => inputRef.current?.click()} className="mx-auto flex flex-col items-center gap-3 py-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f1e6d5] text-[#a4794a]">
              <ImagePlus className="h-6 w-6" />
            </span>
            <span className="text-sm font-medium text-[#2C2A29]">Click to upload or drag a photo here</span>
            <span className="text-xs text-[#9a9084]">JPG or PNG, up to 8MB</span>
          </button>
        )}
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Art style</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ART_STYLES.map((style) => {
            const active = style.id === draft.styleId;
            return (
              <button
                key={style.id}
                onClick={() => update({ styleId: style.id })}
                className={`rounded-xl border p-3 text-left transition-all duration-200 ${
                  active
                    ? 'border-[#c9a273] bg-white shadow-[0_10px_24px_-14px_rgba(120,90,50,0.55)]'
                    : 'border-[#e6dccb] bg-[#fdfbf7] hover:border-[#d3bfa1]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: style.swatch }} />
                  <span className="text-sm font-medium text-[#2C2A29]">{style.name}</span>
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-[#8b8177]">{style.blurb}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#e6dccb] bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={drawCaricature}
            disabled={busy || outOfCredits}
            aria-busy={busy}
            className="inline-flex items-center gap-2 rounded-full bg-[#2C2A29] px-6 py-3 text-sm font-semibold text-[#FDFBF7] transition hover:bg-[#413d3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A4794A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Sparkles className="h-4 w-4" />}
            {busy ? 'Drawing your caricature…' : 'Draw my caricature'}
          </button>

          {remaining !== null ? (
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                outOfCredits
                  ? 'border-[#e3c9c9] bg-[#fdf5f5] text-[#a05a5a]'
                  : 'border-[#e0d5c2] bg-[#fdfbf7] text-[#5c5248]'
              }`}
            >
              {creditLabel(remaining)}
            </span>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="rounded-full border border-[#d9cbb6] bg-white px-3 py-1.5 text-xs font-medium text-[#5c5248] transition hover:border-[#c9a273]"
            >
              Sign in to see your AI drawing credits
            </button>
          )}
        </div>

        <p role="status" aria-live="polite" className="mt-2 text-xs text-[#9a9084]">
          {busy
            ? 'Drawing your caricature — this takes about 10–20 seconds. Your card is kept exactly as it is.'
            : 'Takes about 10–20 seconds. AI artwork generation may use plan credits.'}
        </p>

        {outOfCredits && (
          <div className="mt-3 rounded-xl border border-[#dec9aa] bg-[#fffaf1] p-3 text-xs leading-relaxed text-[#675b4e]">
            <p className="font-semibold text-[#4f4438]">You have used every AI drawing on your plan.</p>
            <p className="mt-1">
              Nothing else is affected: your photo, style filters, any artwork you already made, editing, PNG downloads,
              sharing, Gmail scheduling, reminders, the library and the Outbox all keep working. Included credits renew
              on {summary.period_end ? new Date(summary.period_end).toLocaleDateString() : 'your renewal date'} — or
              upgrade / add an AI credit pack from Pricing.
            </p>
            <a
              href="#pricing"
              className="mt-2 inline-block rounded-full border border-[#d9cbb6] bg-white px-4 py-1.5 font-medium text-[#5c5248] transition hover:border-[#c9a273]"
            >
              See plans & credit packs
            </a>
          </div>
        )}
      </div>


      <div className="rounded-2xl border border-[#e6dccb] bg-[#fdfbf7] p-4">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">
          <ZoomIn className="h-3.5 w-3.5" /> Fit the art in the frame
        </label>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-xs text-[#7c7266]">Zoom</span>
            <input
              type="range"
              min={0.7}
              max={1.6}
              step={0.02}
              value={draft.artScale}
              onChange={(e) => update({ artScale: Number(e.target.value) })}
              className="mt-1 w-full accent-[#a4794a]"
            />
          </div>
          <div>
            <span className="text-xs text-[#7c7266]">Nudge up / down</span>
            <input
              type="range"
              min={-120}
              max={120}
              step={2}
              value={draft.artOffsetY}
              onChange={(e) => update({ artOffsetY: Number(e.target.value) })}
              className="mt-1 w-full accent-[#a4794a]"
            />
          </div>
        </div>
      </div>

      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        reason="AI drawing credits belong to your account, so please sign in before drawing a caricature. Everything else in the studio works without an account."
      />
      <AiConsentDialog open={consentOpen} onClose={() => setConsentOpen(false)} onAccept={acceptConsent} />
    </div>
  );
};

export default PhotoStep;

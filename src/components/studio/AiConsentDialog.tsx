import React, { useState } from 'react';
import { AI_PHOTO_DISCLOSURE } from '@/lib/aiCredits';
import { Loader2, ShieldCheck, X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onAccept: () => Promise<void>;
};

const AiConsentDialog: React.FC<Props> = ({ open, onClose, onAccept }) => {
  // Never pre-checked.
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const accept = async () => {
    if (!agreed) return;
    setBusy(true);
    try {
      await onAccept();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2A29]/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kindred-consent-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#e6dccb] bg-[#FDFBF7] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 id="kindred-consent-title" className="flex items-center gap-2 font-serif text-2xl text-[#2C2A29]">
            <ShieldCheck className="h-5 w-5 text-[#A4794A]" /> Before your first drawing
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-[#8b8177] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A4794A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 rounded-xl border border-[#dec9aa] bg-[#fffaf1] p-4 text-sm leading-relaxed text-[#5c5248]">
          {AI_PHOTO_DISCLOSURE}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[#8b8177]">
          We do not keep the original uploaded photo after the artwork is created unless you choose to save it to your
          card. Style filters and original-photo cards never leave your device.
        </p>

        <label className="mt-4 flex items-start gap-2 text-sm text-[#5c5248]">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 accent-[#A4794A]"
          />
          <span>I understand and agree to send this photo to the AI generation service.</span>
        </label>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={accept}
            disabled={!agreed || busy}
            className="inline-flex items-center gap-2 rounded-full bg-[#2C2A29] px-6 py-3 text-sm font-semibold text-[#FDFBF7] transition hover:bg-[#413d3a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Agree & draw
          </button>
          <button
            onClick={onClose}
            className="rounded-full border border-[#d9cbb6] bg-white px-6 py-3 text-sm font-medium text-[#5c5248] transition hover:border-[#c9a273]"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiConsentDialog;

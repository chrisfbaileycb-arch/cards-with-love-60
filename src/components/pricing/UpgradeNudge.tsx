import React from 'react';
import { FeatureKey, LOCKED_COPY } from '@/data/plans';
import { goToPricing } from '@/lib/plan';
import { Lock, Sparkles } from 'lucide-react';

type Props = {
  feature: FeatureKey;
  /** compact inline strip vs full card */
  variant?: 'card' | 'inline';
  className?: string;
};

/** Shown wherever a Local Agent feature is touched on the free plan. */
const UpgradeNudge: React.FC<Props> = ({ feature, variant = 'card', className = '' }) => {
  const copy = LOCKED_COPY[feature];

  if (variant === 'inline') {
    return (
      <button
        onClick={goToPricing}
        className={`inline-flex items-center gap-1.5 rounded-full border border-[#e0d5c2] bg-[#fdf4e8] px-3 py-1 text-[11px] font-semibold text-[#8f6739] transition hover:border-[#c9a273] ${className}`}
      >
        <Lock className="h-3 w-3" /> Local Agent
      </button>
    );
  }

  return (
    <div className={`rounded-2xl border border-dashed border-[#d9cbb6] bg-[#fdf9f1] p-5 ${className}`}>
      <p className="flex items-center gap-2 text-sm font-semibold text-[#2C2A29]">
        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#f3e9d8] text-[#8f6739]">
          <Lock className="h-3 w-3" />
        </span>
        {copy.title}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-[#8b8177]">{copy.detail}</p>
      <button
        onClick={goToPricing}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#A4794A] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#8f6739]"
      >
        <Sparkles className="h-3.5 w-3.5" /> See Local Agent — $9.99/mo
      </button>
    </div>
  );
};

export default UpgradeNudge;

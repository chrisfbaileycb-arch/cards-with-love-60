import React, { useEffect, useRef } from 'react';
import { CardBrand, CardDraft, ensureFontsReady, renderCard } from '@/lib/cardRender';

type Props = {
  draft: CardDraft;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  className?: string;
  /** Local Agent branding — undefined on the free plan. */
  brand?: CardBrand | null;
};

const CardPreview: React.FC<Props> = ({ draft, canvasRef, className, brand }) => {
  const fontsLoaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!fontsLoaded.current) {
        await ensureFontsReady();
        fontsLoaded.current = true;
      }
      if (cancelled || !canvasRef.current) return;
      await renderCard(canvasRef.current, draft, brand);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [draft, canvasRef, brand]);


  return (
    <div className={className}>
      <div className="relative mx-auto w-full max-w-[420px]">
        <div className="absolute -inset-3 rounded-[26px] bg-gradient-to-br from-[#e8d9c4] via-transparent to-[#d9bfae] opacity-70 blur-xl" />
        <div className="relative overflow-hidden rounded-[18px] border border-[#e6dccb] bg-white shadow-[0_30px_60px_-20px_rgba(60,45,30,0.45)]">
          <canvas ref={canvasRef} className="block h-auto w-full" aria-label="Live greeting card preview" />
        </div>
      </div>
    </div>
  );
};

export default CardPreview;

import React, { useState } from 'react';
import { Sparkles, Shield, Feather, Palette, Heart } from 'lucide-react';

export interface PalaceGuardSlotProps {
  position: 'left' | 'right';
  name?: string;
  roleTitle?: string;
  badgeText?: string;
  dialogue?: string;
  mediaUrl?: string; // Optional custom transparent WebM/Lottie/SVG
  className?: string;
  children?: React.ReactNode;
}

export const PalaceGuardSlot: React.FC<PalaceGuardSlotProps> = ({
  position,
  name = position === 'left' ? 'Sir Quills-a-Lot' : 'Lady Chromata',
  roleTitle = position === 'left' ? 'The Ink Sentinel' : 'The Color Paladin',
  badgeText = position === 'left' ? '🛡️ Guard of the Inks' : '✨ Keeper of Colors',
  dialogue = position === 'left'
    ? 'Halt, Storyteller! Present your finest memories and I shall guard them forever!'
    : 'Greetings Creator! I bring magic paints to bring your characters alive in 3 clicks!',
  mediaUrl,
  className = '',
  children
}) => {
  const [showBubble, setShowBubble] = useState(false);
  const [isInteracted, setIsInteracted] = useState(false);

  const handleClick = () => {
    setShowBubble(true);
    setIsInteracted(true);
    setTimeout(() => {
      setShowBubble(false);
    }, 4000);
  };

  const isLeft = position === 'left';

  return (
    <div
      data-slot={`palace-guard-${position}`}
      className={`group relative flex flex-col items-center select-none ${className}`}
      onMouseEnter={() => setShowBubble(true)}
      onMouseLeave={() => !isInteracted && setShowBubble(false)}
      onClick={handleClick}
    >
      {/* Whimsical Story Speech Bubble */}
      <div
        className={`absolute -top-16 z-30 w-56 rounded-2xl border-2 border-[#4A3828] bg-[#FFFDF9] p-3 text-xs shadow-xl transition-all duration-300 pointer-events-none ${
          isLeft ? 'left-0 sm:-left-4 origin-bottom-left' : 'right-0 sm:-right-4 origin-bottom-right'
        } ${showBubble ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-2 pointer-events-none'}`}
      >
        <div className="flex items-center gap-1.5 font-['Fredoka',sans-serif] font-bold text-[#E11D48]">
          {isLeft ? <Shield className="h-3.5 w-3.5" /> : <Palette className="h-3.5 w-3.5" />}
          <span>{name} says:</span>
        </div>
        <p className="mt-1 font-medium text-[#4A4237] leading-tight">
          "{dialogue}"
        </p>
        {/* Comic speech bubble tail */}
        <div
          className={`absolute -bottom-2 h-3.5 w-3.5 rotate-45 border-b-2 border-r-2 border-[#4A3828] bg-[#FFFDF9] ${
            isLeft ? 'left-6' : 'right-6'
          }`}
        />
      </div>

      {/* Main Guard Slot / Character Animation Wrapper */}
      <div
        className={`relative flex items-center justify-center cursor-pointer transition-transform duration-300 group-hover:scale-105 ${
          isLeft ? 'animate-float-gentle' : 'animate-float-slow'
        }`}
      >
        {/* Soft magical glow base */}
        <div
          className={`absolute -inset-2 rounded-full blur-xl opacity-60 transition-opacity group-hover:opacity-90 ${
            isLeft ? 'bg-[#FFE4E6]' : 'bg-[#FEF3C7]'
          }`}
        />

        {/* Custom provided media / Lottie / WebM OR Default Vector Palace Guard */}
        {children ? (
          <div className="relative z-10">{children}</div>
        ) : mediaUrl ? (
          <div className="relative z-10 h-44 w-36 overflow-hidden rounded-2xl">
            {mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.mp4') ? (
              <video
                src={mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-contain"
              />
            ) : (
              <img
                src={mediaUrl}
                alt={name}
                className="h-full w-full object-contain"
              />
            )}
          </div>
        ) : (
          /* High-Fidelity Whimsical Vector Palace Guard Placeholder */
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative h-44 w-36 overflow-visible">
              <svg
                viewBox="0 0 160 200"
                className="h-full w-full drop-shadow-lg"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Decorative Ground Shadow */}
                <ellipse cx="80" cy="188" rx="45" ry="8" fill="#D3C7B5" opacity="0.5" />

                {isLeft ? (
                  /* SIR QUILLS-A-LOT (Left Guard with Royal Plumed Helmet & Ink Shield) */
                  <g>
                    {/* Cape */}
                    <path
                      d="M50 85 C35 120, 30 170, 42 180 C55 185, 75 180, 80 170 Z"
                      fill="#E11D48"
                      stroke="#881337"
                      strokeWidth="3"
                    />
                    <path
                      d="M110 85 C125 120, 130 170, 118 180 C105 185, 85 180, 80 170 Z"
                      fill="#BE123C"
                      stroke="#881337"
                      strokeWidth="3"
                    />

                    {/* Armor Body */}
                    <path
                      d="M55 80 Q80 75 105 80 Q112 125 100 155 Q80 160 60 155 Q48 125 55 80 Z"
                      fill="#F3F4F6"
                      stroke="#374151"
                      strokeWidth="3.5"
                    />
                    {/* Golden Breastplate Crest */}
                    <path
                      d="M80 92 L88 108 L72 108 Z"
                      fill="#F59E0B"
                      stroke="#B45309"
                      strokeWidth="2"
                    />
                    <circle cx="80" cy="120" r="8" fill="#E11D48" stroke="#9F1239" strokeWidth="2" />
                    <path
                      d="M80 116 L82 124 L78 124 Z"
                      fill="#FFE4E6"
                    />

                    {/* Legs & Boots */}
                    <rect x="62" y="152" width="12" height="28" rx="6" fill="#374151" stroke="#1F2937" strokeWidth="2" />
                    <rect x="86" y="152" width="12" height="28" rx="6" fill="#374151" stroke="#1F2937" strokeWidth="2" />
                    <path d="M58 176 H76 V186 C76 188 70 188 58 188 Z" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
                    <path d="M84 176 H102 V188 C90 188 84 188 84 186 Z" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />

                    {/* Head / Helmet */}
                    <circle cx="80" cy="52" r="26" fill="#F3F4F6" stroke="#374151" strokeWidth="3.5" />
                    {/* Visor Slit */}
                    <path
                      d="M62 50 Q80 46 98 50 Q98 60 80 62 Q62 60 62 50 Z"
                      fill="#1F2937"
                      stroke="#111827"
                      strokeWidth="2.5"
                    />
                    {/* Cheerful Animated Eyes in Visor */}
                    <circle cx="73" cy="55" r="3" fill="#60A5FA" />
                    <circle cx="87" cy="55" r="3" fill="#60A5FA" />
                    <circle cx="74" cy="54" r="1" fill="#FFFFFF" />
                    <circle cx="88" cy="54" r="1" fill="#FFFFFF" />

                    {/* Royal Feather Plume */}
                    <path
                      d="M80 26 C75 8, 55 4, 45 10 C50 18, 65 24, 78 26 Z"
                      fill="#E11D48"
                      stroke="#881337"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M80 26 C85 6, 105 2, 115 10 C108 18, 95 24, 82 26 Z"
                      fill="#F59E0B"
                      stroke="#B45309"
                      strokeWidth="2.5"
                    />
                    <circle cx="80" cy="27" r="5" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />

                    {/* Shield (Left arm) */}
                    <g transform="translate(18, 85) rotate(-8)">
                      <path
                        d="M0 5 Q18 0 36 5 Q38 32 18 46 Q-2 32 0 5 Z"
                        fill="#E11D48"
                        stroke="#881337"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 10 L22 24 L14 24 Z"
                        fill="#FDE047"
                      />
                      <circle cx="18" cy="30" r="4" fill="#FFFFFF" />
                    </g>

                    {/* Giant Inking Quill / Spear (Right arm) */}
                    <g transform="translate(112, 40) rotate(12)">
                      <line x1="10" y1="0" x2="10" y2="135" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
                      {/* Nib / Quill */}
                      <path
                        d="M10 0 C0 15, 5 35, 10 40 C15 35, 20 15, 10 0 Z"
                        fill="#F59E0B"
                        stroke="#B45309"
                        strokeWidth="2"
                      />
                      <circle cx="10" cy="32" r="3" fill="#1E3A8A" />
                      {/* Hand grip */}
                      <circle cx="10" cy="65" r="7" fill="#F3F4F6" stroke="#374151" strokeWidth="2.5" />
                    </g>
                  </g>
                ) : (
                  /* LADY CHROMATA (Right Guard with Storybook Crown & Magic Painter's Wand) */
                  <g>
                    {/* Cape */}
                    <path
                      d="M50 85 C35 120, 30 170, 42 180 C55 185, 75 180, 80 170 Z"
                      fill="#F59E0B"
                      stroke="#B45309"
                      strokeWidth="3"
                    />
                    <path
                      d="M110 85 C125 120, 130 170, 118 180 C105 185, 85 180, 80 170 Z"
                      fill="#D97706"
                      stroke="#B45309"
                      strokeWidth="3"
                    />

                    {/* Armor / Dress Body */}
                    <path
                      d="M55 80 Q80 75 105 80 Q115 130 102 155 Q80 162 58 155 Q45 130 55 80 Z"
                      fill="#FFFBEB"
                      stroke="#78350F"
                      strokeWidth="3.5"
                    />
                    {/* Rainbow Heart Crest */}
                    <circle cx="80" cy="115" r="12" fill="#E11D48" stroke="#9F1239" strokeWidth="2" />
                    <path
                      d="M80 110 C77 106, 72 108, 72 113 C72 118, 80 123, 80 123 C80 123, 88 118, 88 113 C88 108, 83 106, 80 110 Z"
                      fill="#FFFFFF"
                    />

                    {/* Legs / Boots */}
                    <rect x="62" y="152" width="12" height="28" rx="6" fill="#78350F" stroke="#451A03" strokeWidth="2" />
                    <rect x="86" y="152" width="12" height="28" rx="6" fill="#78350F" stroke="#451A03" strokeWidth="2" />
                    <path d="M58 176 H76 V186 C76 188 70 188 58 188 Z" fill="#E11D48" stroke="#881337" strokeWidth="2.5" />
                    <path d="M84 176 H102 V188 C90 188 84 188 84 186 Z" fill="#E11D48" stroke="#881337" strokeWidth="2.5" />

                    {/* Head / Smile */}
                    <circle cx="80" cy="52" r="24" fill="#FED7AA" stroke="#78350F" strokeWidth="3" />
                    {/* Cheerful Friendly Face */}
                    <circle cx="72" cy="50" r="3.5" fill="#1F2937" />
                    <circle cx="88" cy="50" r="3.5" fill="#1F2937" />
                    <circle cx="73" cy="49" r="1.2" fill="#FFFFFF" />
                    <circle cx="89" cy="49" r="1.2" fill="#FFFFFF" />
                    {/* Pink Cheeks */}
                    <circle cx="67" cy="56" r="4" fill="#FDA4AF" opacity="0.7" />
                    <circle cx="93" cy="56" r="4" fill="#FDA4AF" opacity="0.7" />
                    {/* Happy Smile */}
                    <path d="M74 58 Q80 65 86 58" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                    {/* Golden Palace Guard Tiara / Crown */}
                    <path
                      d="M62 36 L70 42 L80 32 L90 42 L98 36 L94 48 L66 48 Z"
                      fill="#F59E0B"
                      stroke="#B45309"
                      strokeWidth="2.5"
                    />
                    <circle cx="80" cy="34" r="3" fill="#E11D48" />

                    {/* Magic Artist Palette (Left Hand) */}
                    <g transform="translate(18, 90) rotate(10)">
                      <ellipse cx="16" cy="18" rx="18" ry="14" fill="#FDE68A" stroke="#B45309" strokeWidth="2.5" />
                      <circle cx="10" cy="12" r="3" fill="#EF4444" />
                      <circle cx="18" cy="10" r="3" fill="#3B82F6" />
                      <circle cx="26" cy="14" r="3" fill="#10B981" />
                      <circle cx="20" cy="22" r="3" fill="#8B5CF6" />
                      {/* Thumb hole */}
                      <ellipse cx="9" cy="22" rx="3" ry="4" fill="#FAF7F0" stroke="#B45309" strokeWidth="1.5" />
                    </g>

                    {/* Magic Star Wand (Right Hand) */}
                    <g transform="translate(110, 42) rotate(-8)">
                      <line x1="8" y1="10" x2="8" y2="125" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
                      {/* Star tip */}
                      <path
                        d="M8 0 L11 8 L19 8 L13 13 L15 21 L8 16 L1 21 L3 13 L-3 8 L5 8 Z"
                        fill="#FDE047"
                        stroke="#B45309"
                        strokeWidth="2"
                      />
                      {/* Sparkle drops */}
                      <circle cx="18" cy="6" r="2" fill="#F59E0B" className="animate-star-twinkle" />
                      <circle cx="-1" cy="2" r="1.5" fill="#E11D48" className="animate-star-twinkle" />
                      {/* Hand */}
                      <circle cx="8" cy="65" r="7" fill="#FED7AA" stroke="#78350F" strokeWidth="2.5" />
                    </g>
                  </g>
                )}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Storybook Pedestal / Name Tag Badge */}
      <div className="mt-2 text-center">
        <span className="inline-flex items-center gap-1 rounded-full border border-[#DCD0BB] bg-[#FFFDF9] px-3 py-1 text-[11px] font-['Fredoka',sans-serif] font-bold text-[#4A4237] shadow-xs">
          <Sparkles className="h-3 w-3 text-[#EAB308]" />
          <span>{name}</span>
        </span>
        <p className="mt-0.5 text-[10px] font-semibold text-[#8C8071] tracking-wide">
          {roleTitle}
        </p>
      </div>
    </div>
  );
};
export default PalaceGuardSlot;

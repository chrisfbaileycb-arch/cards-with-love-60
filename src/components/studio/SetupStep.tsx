import React from 'react';
import {
  ASPECT_RATIOS,
  AspectRatioId,
  CARTOON_STYLES,
  CartoonDuration,
  CartoonPillar,
  DURATION_OPTIONS,
  PILLARS,
  VOICE_TONES
} from '@/data/cartoonConfig';
import { Heart, UtensilsCrossed, Sparkles, Wand2, Upload, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SetupStepProps {
  pillar: CartoonPillar;
  setPillar: (p: CartoonPillar) => void;
  duration: CartoonDuration;
  setDuration: (d: CartoonDuration) => void;
  aspectRatio: AspectRatioId;
  setAspectRatio: (a: AspectRatioId) => void;
  styleId: string;
  setStyleId: (s: string) => void;
  voiceToneId: string;
  setVoiceToneId: (v: string) => void;
  characterDesc: string;
  setCharacterDesc: (c: string) => void;
  characterPhoto: string | null;
  setCharacterPhoto: (p: string | null) => void;
  premise: string;
  setPremise: (p: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const PILLAR_ICONS: Record<CartoonPillar, React.ComponentType<{ className?: string }>> = {
  love: Heart,
  restaurant: UtensilsCrossed,
  faith: Sparkles,
  imagination: Wand2
};

export const SetupStep: React.FC<SetupStepProps> = ({
  pillar,
  setPillar,
  duration,
  setDuration,
  aspectRatio,
  setAspectRatio,
  styleId,
  setStyleId,
  voiceToneId,
  setVoiceToneId,
  characterDesc,
  setCharacterDesc,
  characterPhoto,
  setCharacterPhoto,
  premise,
  setPremise,
  onGenerate,
  isGenerating
}) => {
  const currentPillar = (pillar && PILLARS[pillar]) || PILLARS.love;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCharacterPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const loadPremiseIdea = (idea: string) => {
    setPremise(idea);
  };

  return (
    <div className="space-y-7" id="setup-step-container">
      {/* 1. Core Pillar Selection */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-[0.16em] text-[#9A9084]">
            1. Select Your Cartoon Category
          </label>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF8EE] px-3 py-1 text-xs font-['Fredoka',sans-serif] font-bold text-[#A4794A] border border-[#E8DEC9]">
            {currentPillar.name}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(PILLARS) as CartoonPillar[]).map((pKey) => {
            const p = PILLARS[pKey];
            const Icon = PILLAR_ICONS[pKey];
            const isSelected = pillar === pKey;

            return (
              <button
                key={pKey}
                type="button"
                id={`pillar-btn-${pKey}`}
                onClick={() => setPillar(pKey)}
                className={cn(
                  'group relative flex flex-col justify-between rounded-3xl border-2 p-4 text-left transition-all duration-300',
                  isSelected
                    ? 'border-[#E11D48] bg-gradient-to-b from-[#FFF5F7] to-[#FFFDF9] text-[#1F1D1B] shadow-md scale-[1.02]'
                    : 'border-[#EDE4D3] bg-[#FFFDF9] text-[#2C2A29] hover:border-[#F59E0B] hover:bg-white hover:scale-[1.01]'
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-hover:scale-110',
                        isSelected ? 'bg-[#E11D48] text-white shadow-sm' : 'bg-[#F4ECE1] text-[#A4794A]'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-[10px] font-storybook font-bold uppercase tracking-wider',
                        isSelected ? 'bg-[#FFE4E6] text-[#E11D48]' : 'bg-[#F4ECE1] text-[#78542F]'
                      )}
                    >
                      {pKey}
                    </span>
                  </div>
                  <h4 className="mt-3 font-['Fredoka',sans-serif] text-base font-bold text-[#1F1D1B]">{p.name}</h4>
                  <p
                    className={cn(
                      'mt-1 text-xs leading-relaxed',
                      isSelected ? 'text-[#6B5A4B]' : 'text-[#6D6459]'
                    )}
                  >
                    {p.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Duration & Aspect Ratio */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Duration selector */}
        <div className="space-y-3">
          <label className="text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-[0.16em] text-[#9A9084]">
            2. Target Duration
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {DURATION_OPTIONS.map((d) => {
              const isSelected = duration === d.seconds;
              return (
                <button
                  key={d.seconds}
                  type="button"
                  id={`duration-btn-${d.seconds}`}
                  onClick={() => setDuration(d.seconds)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-2xl border-2 p-3 text-center transition-all duration-200',
                    isSelected
                      ? 'border-[#E11D48] bg-[#FFF5F7] text-[#1F1D1B] shadow-sm ring-1 ring-[#E11D48]'
                      : 'border-[#EDE4D3] bg-[#FFFDF9] text-[#5C5248] hover:border-[#E8DEC9] hover:bg-white'
                  )}
                >
                  <span className="font-['Fredoka',sans-serif] text-2xl font-bold text-[#1F1D1B]">{d.seconds}s</span>
                  <span className="text-[11px] font-bold text-[#E11D48]">{d.scenesCount} Scenes</span>
                  <span className="mt-0.5 text-[10px] font-medium text-[#8A7E72]">{d.seconds === 30 ? 'Punchy' : d.seconds === 60 ? 'Balanced' : 'Full Story'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio selector */}
        <div className="space-y-3">
          <label className="text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-[0.16em] text-[#9A9084]">
            3. Aspect Ratio & Format
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(Object.keys(ASPECT_RATIOS) as AspectRatioId[]).map((rKey) => {
              const r = ASPECT_RATIOS[rKey];
              const isSelected = aspectRatio === rKey;
              return (
                <button
                  key={rKey}
                  type="button"
                  id={`ratio-btn-${rKey.replace(':', '-')}`}
                  onClick={() => setAspectRatio(rKey)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-2xl border-2 p-3 text-center transition-all duration-200',
                    isSelected
                      ? 'border-[#E11D48] bg-[#FFF5F7] text-[#1F1D1B] shadow-sm ring-1 ring-[#E11D48]'
                      : 'border-[#EDE4D3] bg-[#FFFDF9] text-[#5C5248] hover:border-[#E8DEC9] hover:bg-white'
                  )}
                >
                  <span className="font-['Fredoka',sans-serif] text-lg font-bold text-[#1F1D1B]">{rKey}</span>
                  <span className="text-[11px] font-semibold text-[#2C2A29]">{r.name}</span>
                  <span className="text-[10px] font-medium text-[#8A7E72]">{r.platform}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Animation Style Selector */}
      <section className="space-y-3">
        <label className="text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-[0.16em] text-[#9A9084]">
          4. Cartoon Animation Style (Collectible Art Cards)
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CARTOON_STYLES.map((style) => {
            const isSelected = styleId === style.id;
            return (
              <button
                key={style.id}
                type="button"
                id={`style-btn-${style.id}`}
                onClick={() => setStyleId(style.id)}
                className={cn(
                  'group flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-all duration-300',
                  isSelected
                    ? 'border-[#E11D48] bg-white shadow-md ring-2 ring-[#E11D48]/30 scale-105'
                    : 'border-[#EDE4D3] bg-[#FFFDF9] hover:border-[#F59E0B] hover:shadow-xs'
                )}
              >
                <div className="relative h-20 w-full overflow-hidden bg-[#F4ECE1]">
                  <img
                    src={style.previewImage}
                    alt={style.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-1.5 left-2 font-['Fredoka',sans-serif] text-[11px] font-bold text-white">
                    {style.name}
                  </span>
                </div>
                <div className="p-2 bg-[#FFFDF9]">
                  <p className="line-clamp-2 text-[10px] leading-tight text-[#6D6459]">{style.blurb}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Story Premise & Character Details */}
      <section className="space-y-4 rounded-3xl border-2 border-[#EDE4D3] bg-[#FFFDF9] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <label htmlFor="premise-input" className="text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-[0.16em] text-[#9A9084]">
            5. Story Premise or Memory
          </label>
          <span className="text-[11px] font-medium text-[#8A7E72]">What happens in your cartoon?</span>
        </div>

        <textarea
          id="premise-input"
          rows={3}
          value={premise}
          onChange={(e) => setPremise(e.target.value)}
          placeholder={`Describe your story or campaign (e.g. "Re-enact our first date in the rain at the little bistro" or "Grandpa telling the secret cookie recipe")`}
          className="w-full rounded-2xl border border-[#E0D5C2] bg-[#FAF7F0] p-3.5 text-sm text-[#2C2A29] outline-none placeholder:text-[#A49A8D] focus:border-[#E11D48] focus:bg-white focus:ring-2 focus:ring-[#FFE4E6]"
        />

        {/* Quick Sample Premise Inspirations */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-['Fredoka',sans-serif] font-bold uppercase tracking-wider text-[#A4794A]">
            💡 Story Ideas for {currentPillar.name}:
          </span>
          <div className="flex flex-wrap gap-2">
            {currentPillar.samplePremises.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPremiseIdea(sample)}
                className="rounded-full border border-[#E6DCCB] bg-[#FFF8EE] px-3.5 py-1.5 text-left text-xs font-medium text-[#5C5248] transition hover:border-[#E11D48] hover:bg-white hover:text-[#E11D48] hover:scale-105"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Character & Voice Customization (Collapsible or 2-column) */}
        <div className="grid grid-cols-1 gap-4 pt-3 sm:grid-cols-2">
          {/* Character Description & Reference */}
          <div className="space-y-2">
            <label htmlFor="char-desc-input" className="text-xs font-bold uppercase tracking-[0.16em] text-[#9A9084]">
              Main Character (Optional)
            </label>
            <input
              id="char-desc-input"
              type="text"
              value={characterDesc}
              onChange={(e) => setCharacterDesc(e.target.value)}
              placeholder="e.g. A cheerful barista in teal apron with fluffy hair"
              className="w-full rounded-lg border border-[#E0D5C2] bg-[#FDFBF7] px-3 py-2 text-xs text-[#2C2A29] outline-none focus:border-[#2C2A29] focus:bg-white"
            />
            
            {/* Optional photo upload */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="char-photo-upload"
                className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-dashed border-[#C9A273] bg-[#FAF5EE] px-4 py-2 text-xs font-semibold text-[#78542F] hover:bg-[#F4ECE1] transition hover:scale-105"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{characterPhoto ? 'Change Reference Photo' : 'Upload Character Reference'}</span>
              </label>
              <input
                id="char-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {characterPhoto && (
                <div className="relative flex items-center gap-1.5">
                  <img
                    src={characterPhoto}
                    alt="Character reference"
                    className="h-8 w-8 rounded-full object-cover border-2 border-[#E11D48]"
                  />
                  <button
                    type="button"
                    onClick={() => setCharacterPhoto(null)}
                    className="text-[10px] font-bold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Voice Tone Selector */}
          <div className="space-y-2">
            <label htmlFor="voice-tone-select" className="text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-[0.16em] text-[#9A9084]">
              Voiceover Tone
            </label>
            <select
              id="voice-tone-select"
              value={voiceToneId}
              onChange={(e) => setVoiceToneId(e.target.value)}
              className="w-full rounded-2xl border border-[#E0D5C2] bg-[#FAF7F0] px-3.5 py-2.5 text-xs font-medium text-[#2C2A29] outline-none focus:border-[#E11D48] focus:bg-white"
            >
              {VOICE_TONES.map((vt) => (
                <option key={vt.id} value={vt.id}>
                  {vt.name} — {vt.blurb}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 5. Main Action Button */}
      <div className="flex flex-col items-center justify-between gap-4 border-t border-[#E6DCCB] pt-6 sm:flex-row">
        <div>
          <p className="font-['Fredoka',sans-serif] text-sm font-bold text-[#1F1D1B]">
            {duration}s Cartoon · {duration === 30 ? '3' : duration === 60 ? '4' : '6'} Scenes · {aspectRatio} · {currentPillar.name}
          </p>
          <p className="text-[11px] font-medium text-[#8A7E72]">
            Generates screenplay, character anchor prompts, visual storyboard, and speech narration.
          </p>
        </div>

        <button
          type="button"
          id="generate-cartoon-btn"
          disabled={isGenerating || !premise.trim()}
          onClick={onGenerate}
          className={cn(
            'flex items-center gap-2.5 rounded-2xl px-8 py-4 text-sm font-storybook font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 active:scale-95',
            isGenerating || !premise.trim()
              ? 'cursor-not-allowed bg-[#A49A8D] opacity-70'
              : 'bg-gradient-to-r from-[#E11D48] to-[#EAB308] hover:scale-105 hover:shadow-xl'
          )}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Directing {duration}s Cartoon...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 text-white" />
              <span>Animate {duration}s Cartoon Story</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SetupStep;

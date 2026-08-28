import React from 'react';
import { ArrowRight, Heart, Sparkles, UtensilsCrossed, Wand2, Play, Flame, Film, BookOpen, Star } from 'lucide-react';
import PalaceGuardSlot from '@/components/character/PalaceGuardSlot';

interface HeroProps {
  onSelectTemplate?: (premise: string) => void;
  leftGuardMediaUrl?: string;
  rightGuardMediaUrl?: string;
}

const TEMPLATE_PRESETS = [
  {
    icon: Heart,
    label: 'First Date in Rain',
    badge: 'Love & Romance',
    accent: '#E11D48',
    bg: '#FFE4E6',
    border: '#FECDD3',
    premise: 'Re-enact your first date with your wife at the little Italian bistro in the rain, LovAnimate it.'
  },
  {
    icon: UtensilsCrossed,
    label: 'Flaming Pasta',
    badge: 'Chef Specialty',
    accent: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
    premise: 'Your favorite specialty dish at your restaurant sizzling with secret herbs and spices, LovAnimate it.'
  },
  {
    icon: Sparkles,
    label: 'Vision of Faith',
    badge: 'Faith & Wonder',
    accent: '#4F46E5',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    premise: 'Your vision of faith: walking through life’s storms guided by steady light and gentle grace, LovAnimate it.'
  },
  {
    icon: Wand2,
    label: 'Superpup Max',
    badge: 'Best Friend',
    accent: '#059669',
    bg: '#D1FAE5',
    border: '#A7F3D0',
    premise: 'My best friend Max the golden retriever getting his own superpower cape to rescue lost tennis balls, LovAnimate it.'
  }
];

const SHOWCASE_TILES = [
  {
    title: 'First Date in the Rain',
    tag: 'Love & Memories',
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    duration: '01:00'
  },
  {
    title: 'Flaming Truffle Pasta',
    tag: 'Restaurant Special',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    duration: '00:30'
  },
  {
    title: 'Waves of Faith',
    tag: 'Vision of Faith',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    duration: '01:00'
  },
  {
    title: 'Max Secret Agent Pup',
    tag: 'Best Friend',
    img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    duration: '00:30'
  },
  {
    title: 'Sunday Morning Pancakes',
    tag: 'Family Story',
    img: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=80',
    duration: '01:00'
  }
];

const scrollTo = (href: string) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const Hero: React.FC<HeroProps> = ({ onSelectTemplate, leftGuardMediaUrl, rightGuardMediaUrl }) => {
  const handleTemplateClick = (premise: string) => {
    if (onSelectTemplate) {
      onSelectTemplate(premise);
    }
    scrollTo('#studio');
  };

  return (
    <section className="relative overflow-hidden bg-[#FAF7F0] pt-6 pb-10 sm:pt-10 sm:pb-14">
      {/* Background ambient whimsical lighting */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#FFE4E6]/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-[#FEF3C7]/60 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-[#FDFBF7] opacity-60 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        {/* Story Sanctuary Sanctuary Flanked with Palace Guard Slots */}
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          
          {/* LEFT PALACE GUARD ASSET SLOT */}
          <div className="hidden lg:flex flex-none w-44 items-center justify-center">
            <PalaceGuardSlot
              position="left"
              name="Sir Quills-a-Lot"
              roleTitle="The Inking Sentinel"
              badgeText="🛡️ Inking Sentry"
              dialogue="Welcome to the Story Sanctuary! Present your memory and I will guard its beauty!"
              mediaUrl={leftGuardMediaUrl}
            />
          </div>

          {/* MAIN HERO SANCTUARY CENTER */}
          <div className="flex-1 text-center max-w-3xl mx-auto">
            {/* Storybook Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8DEC9] bg-[#FFF8EE] px-4 py-1.5 text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-wider text-[#9E651D] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#EAB308] animate-star-twinkle" />
              <span>Story Sanctuary · Animate Any Idea or Memory</span>
            </div>

            <h1 className="mt-4 font-['Fredoka',sans-serif] text-4xl sm:text-6xl font-bold tracking-tight text-[#1F1D1B] leading-[1.12]">
              Turn Any Story Into <br className="hidden sm:inline" />
              <span className="text-[#E11D48]">Animated Cartoons</span>{' '}
              <span className="inline-block rounded-2xl bg-[#FEF3C7] px-3 py-0.5 text-[#92400E] border-2 border-[#FDE68A] shadow-xs">
                in 3 Clicks
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#6B6155] max-w-2xl mx-auto font-medium">
              A whimsical, instant animation studio to reach out to people you love, celebrate restaurant specialties, share visions of faith, and bring fairy tales to life.
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => scrollTo('#studio')}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#EAB308] px-8 py-3.5 text-sm font-['Fredoka',sans-serif] font-bold uppercase tracking-wider text-white shadow-lg transition hover:scale-105 hover:shadow-xl active:scale-95"
              >
                <Wand2 className="h-4 w-4" /> Start Studio in 3 Clicks
              </button>
              <button
                onClick={() => scrollTo('#samples')}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#DCD0BB] bg-white px-6 py-3.5 text-sm font-['Fredoka',sans-serif] font-semibold text-[#4A4237] shadow-sm transition hover:border-[#E11D48] hover:bg-[#FFFDF9] hover:scale-105"
              >
                <Play className="h-4 w-4 text-[#E11D48]" /> Watch Sample Stories
              </button>
            </div>

            {/* Collectible Premise Story Badges */}
            <div className="mt-8 pt-5 border-t border-[#EFE5D5]">
              <div className="flex items-center justify-center gap-1.5 text-xs font-['Fredoka',sans-serif] font-bold uppercase tracking-wider text-[#9E8E7D] mb-3">
                <BookOpen className="h-3.5 w-3.5 text-[#EAB308]" />
                <span>Pick a storybook premise to start:</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto">
                {TEMPLATE_PRESETS.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => handleTemplateClick(t.premise)}
                    className="group flex flex-col items-center justify-center rounded-2xl border-2 bg-white p-3 text-center shadow-xs transition hover:scale-105 hover:shadow-md active:scale-95"
                    style={{ borderColor: t.border }}
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:rotate-6"
                      style={{ backgroundColor: t.bg, color: t.accent }}
                    >
                      <t.icon className="h-4 w-4" />
                    </span>
                    <span className="mt-1.5 font-['Fredoka',sans-serif] text-xs font-bold text-[#2C2A29] line-clamp-1">
                      {t.label}
                    </span>
                    <span className="text-[10px] font-semibold text-[#8C8071]">
                      {t.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PALACE GUARD ASSET SLOT */}
          <div className="hidden lg:flex flex-none w-44 items-center justify-center">
            <PalaceGuardSlot
              position="right"
              name="Lady Chromata"
              roleTitle="The Color Paladin"
              badgeText="✨ Keeper of Colors"
              dialogue="With my magic palette, your cartoon colors and animations will shine in seconds!"
              mediaUrl={rightGuardMediaUrl}
            />
          </div>
        </div>

        {/* Mobile Palace Guards Bar (visible on small screens) */}
        <div className="mt-6 flex lg:hidden items-center justify-around rounded-3xl border border-[#E9DEC8] bg-[#FFFDF9] p-4 shadow-sm">
          <PalaceGuardSlot
            position="left"
            name="Sir Quills"
            roleTitle="Inking Sentry"
            mediaUrl={leftGuardMediaUrl}
          />
          <div className="h-16 w-px bg-[#EFE5D5]" />
          <PalaceGuardSlot
            position="right"
            name="Lady Chromata"
            roleTitle="Color Paladin"
            mediaUrl={rightGuardMediaUrl}
          />
        </div>

        {/* Bento Showcase Grid with Softened Whimsical Borders */}
        <div className="mt-8 relative rounded-3xl border-2 border-[#E9DEC8] bg-[#1F1D1B] p-4 sm:p-6 shadow-2xl overflow-hidden">
          {/* Top Banner Tag */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="rounded-2xl border-2 border-white/20 bg-black/85 backdrop-blur-md px-6 py-3 shadow-2xl text-center">
              <span className="font-['Fredoka',sans-serif] text-xl sm:text-2xl font-bold tracking-wide text-white flex items-center gap-2">
                <Star className="h-4 w-4 fill-[#EAB308] text-[#EAB308] animate-star-twinkle" />
                <span>Made with <span className="text-[#E11D48]">Lov</span><span className="text-[#EAB308]">Animate</span></span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 opacity-90 hover:opacity-100 transition duration-500">
            {SHOWCASE_TILES.map((tile) => (
              <div
                key={tile.title}
                onClick={() => scrollTo('#samples')}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#383431] bg-[#292624] aspect-[4/3] sm:aspect-[3/4] transition duration-300 hover:scale-[1.03] hover:border-[#EAB308]"
              >
                <img
                  src={tile.img}
                  alt={tile.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <span className="absolute top-2.5 left-2.5 rounded-full bg-black/65 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-['Fredoka',sans-serif] font-bold uppercase tracking-wider text-[#EAB308]">
                  {tile.tag}
                </span>

                <span className="absolute top-2.5 right-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white/90">
                  {tile.duration}
                </span>

                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs font-['Fredoka',sans-serif] font-bold text-white line-clamp-1 group-hover:text-[#EAB308] transition">
                    {tile.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;



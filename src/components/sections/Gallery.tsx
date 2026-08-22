import React, { useMemo, useState } from 'react';
import { CARD_TEMPLATES, OCCASIONS } from '@/data/cardConfig';
import { ArrowUpRight, Search } from 'lucide-react';

const scrollToStudio = () => {
  const el = document.querySelector('#studio');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const Gallery: React.FC = () => {
  const [occasion, setOccasion] = useState('All');
  const [query, setQuery] = useState('');

  const visible = useMemo(
    () =>
      CARD_TEMPLATES.filter(
        (t) =>
          (occasion === 'All' || t.occasion === occasion) &&
          (query.trim() === '' ||
            `${t.name} ${t.occasion} ${t.headline} ${t.defaultMessage}`.toLowerCase().includes(query.toLowerCase()))
      ),
    [occasion, query]
  );

  return (
    <section id="gallery" className="bg-[#FDFBF7] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A4794A]">Card styles</span>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-[#2C2A29] sm:text-4xl">
              Ten quiet, lovely templates for the moments worth marking.
            </h2>
          </div>
          <label className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b4a894]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search birthday, thank you…"
              className="w-full rounded-full border border-[#e0d5c2] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#c9a273]"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              onClick={() => setOccasion(o)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                occasion === o
                  ? 'bg-[#2C2A29] text-[#FDFBF7]'
                  : 'border border-[#e0d5c2] bg-white text-[#8b8177] hover:border-[#c9a273]'
              }`}
            >
              {o}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visible.map((t) => (
            <button
              key={t.id}
              onClick={scrollToStudio}
              className="group overflow-hidden rounded-2xl border border-[#e6dccb] bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={t.preview}
                  alt={t.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#8f6739]">
                  {t.occasion}
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-[#2C2A29]">{t.name}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#8b8177]">{t.defaultMessage}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#A4794A]">
                  Use this style <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
          {visible.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-[#ddd0bb] p-10 text-center text-sm text-[#8b8177]">
              No template matches that. Try another word.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Gallery;

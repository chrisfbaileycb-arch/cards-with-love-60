import React, { useMemo, useState } from 'react';
import { EXPORT_LAYOUTS, getLayout } from '@/data/cardConfig';
import { CardRow, deleteCard, formatCardDate, rowToDraft } from '@/lib/cardLibrary';
import { downloadDataUrl, renderLayoutPng } from '@/lib/cardExport';
import { CardDraft } from '@/lib/cardRender';
import { Recipient } from '@/components/studio/DeliveryStep';
import ScheduleCardDialog from '@/components/library/ScheduleCardDialog';
import {
  CalendarClock,
  Copy,
  Download,
  Image as ImageIcon,
  Library,
  Loader2,
  Search,
  Trash2
} from 'lucide-react';

type Props = {
  cards: CardRow[];
  loading: boolean;
  recipients: Recipient[];
  reload: () => void;
  onQueueChanged: () => void;
  onOpenInStudio: (draft: CardDraft) => void;
};

const CardLibrary: React.FC<Props> = ({ cards, loading, recipients, reload, onQueueChanged, onOpenInStudio }) => {
  const [query, setQuery] = useState('');
  const [occasion, setOccasion] = useState('All');
  const [busy, setBusy] = useState<string | null>(null);
  const [scheduleCard, setScheduleCard] = useState<CardRow | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const occasions = useMemo(
    () => ['All', ...Array.from(new Set(cards.map((c) => c.occasion).filter(Boolean)))],
    [cards]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      if (occasion !== 'All' && c.occasion !== occasion) return false;
      if (!q) return true;
      return [c.title, c.occasion, c.headline, c.message, c.signature]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [cards, query, occasion]);

  const duplicate = (card: CardRow) => {
    const draft = rowToDraft(card);
    onOpenInStudio({ ...draft, title: `${draft.title} (copy)` });
    setNote(`“${card.title}” is loaded in the studio as a fresh draft.`);
  };

  const reExport = async (card: CardRow, layoutId: string) => {
    setBusy(`${card.id}-${layoutId}`);
    setNote(null);
    try {
      const layout = getLayout(layoutId);
      const draft = rowToDraft(card);
      const png = await renderLayoutPng(draft, layoutId);
      const slug = (card.title || 'kindred').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
      downloadDataUrl(png, `${slug}-${layout.filename}.png`);
      setNote(`${layout.name} downloaded.`);
    } catch {
      setNote('Could not rebuild that size — try opening it in the studio.');
    } finally {
      setBusy(null);
    }
  };

  const downloadOriginal = (card: CardRow) => {
    if (card.image_url) {
      window.open(card.image_url, '_blank', 'noopener,noreferrer');
      return;
    }
    reExport(card, 'card');
  };

  const remove = async (card: CardRow) => {
    setBusy(`${card.id}-del`);
    try {
      await deleteCard(card.id);
      setNote(`“${card.title}” deleted.`);
      reload();
      onQueueChanged();
    } catch {
      setNote('Could not delete that card.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section id="library" className="bg-[#FDFBF7] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#A4794A]">
              <Library className="h-3.5 w-3.5" /> Card library
            </span>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-[#2C2A29] sm:text-4xl">
              Every card you have made, ready to use again.
            </h2>
            <p className="mt-3 text-sm text-[#7c7266]">
              Open one back up as a new draft, send it to someone else, or grab any of the four sizes again — the
              artwork, handwriting and colors are all stored with it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#b3a794]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your cards…"
                className="w-56 rounded-full border border-[#e0d5c2] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#c9a273]"
              />
            </div>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="rounded-full border border-[#e0d5c2] bg-white px-4 py-2 text-sm text-[#5c5248] outline-none focus:border-[#c9a273]"
            >
              {occasions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {note && (
          <p className="mt-4 inline-block rounded-full bg-[#f3e9d8] px-4 py-2 text-xs text-[#8f6739]">{note}</p>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {loading && <p className="text-sm text-[#8b8177]">Loading your library…</p>}
          {!loading && visible.length === 0 && (
            <p className="rounded-2xl border border-dashed border-[#ddd0bb] bg-white/70 p-8 text-sm text-[#8b8177]">
              {cards.length === 0
                ? 'No saved cards yet. Build one in the studio and hit “Save to my library”.'
                : 'No cards match that search.'}
            </p>
          )}

          {visible.map((card) => (
            <article
              key={card.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#e6dccb] bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex gap-4 p-4">
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.title}
                    className="h-28 w-[84px] flex-none rounded-lg border border-[#eee5d8] object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-[84px] flex-none items-center justify-center rounded-lg bg-[#f6f0e6] text-[#c1b6a4]">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-serif text-lg leading-snug text-[#2C2A29]">{card.title}</p>
                  <span className="mt-1 inline-block rounded-full bg-[#f3e9d8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8f6739]">
                    {card.occasion}
                  </span>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#8b8177]">{card.message}</p>
                  <p className="mt-2 text-[11px] text-[#a49a8d]">Created {formatCardDate(card.created_at)}</p>
                </div>
              </div>

              <div className="mt-auto border-t border-[#f2ebdf] p-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => duplicate(card)}
                    className="inline-flex items-center gap-1 rounded-full bg-[#A4794A] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#8f6739]"
                  >
                    <Copy className="h-3 w-3" /> Open as new draft
                  </button>
                  <button
                    onClick={() => setScheduleCard(card)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#d9cbb6] px-3 py-1.5 text-[11px] text-[#5c5248] transition hover:border-[#c9a273]"
                  >
                    <CalendarClock className="h-3 w-3" /> Send to someone else
                  </button>
                  <button
                    onClick={() => downloadOriginal(card)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#d9cbb6] px-3 py-1.5 text-[11px] text-[#5c5248] transition hover:border-[#c9a273]"
                  >
                    <Download className="h-3 w-3" /> PNG
                  </button>
                  <button
                    onClick={() => remove(card)}
                    disabled={busy === `${card.id}-del`}
                    aria-label={`Delete ${card.title}`}
                    className="inline-flex items-center gap-1 rounded-full border border-[#eddede] px-3 py-1.5 text-[11px] text-[#a05a5a] transition hover:bg-[#fdf3f3] disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>

                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#b3a794]">Re-export a size</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {EXPORT_LAYOUTS.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => reExport(card, l.id)}
                        disabled={busy === `${card.id}-${l.id}`}
                        title={`${l.width} × ${l.height}`}
                        className="inline-flex items-center gap-1 rounded-full border border-[#e0d5c2] bg-[#fdfbf7] px-2.5 py-1 text-[10px] text-[#5c5248] transition hover:border-[#c9a273] disabled:opacity-50"
                      >
                        {busy === `${card.id}-${l.id}` ? (
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        ) : (
                          <Download className="h-2.5 w-2.5" />
                        )}
                        {l.name.replace('Card PNG ', 'Card ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {scheduleCard && (
        <ScheduleCardDialog
          card={scheduleCard}
          recipients={recipients}
          onClose={() => setScheduleCard(null)}
          onScheduled={(msg) => {
            setNote(msg);
            onQueueChanged();
          }}
        />
      )}
    </section>
  );
};

export default CardLibrary;

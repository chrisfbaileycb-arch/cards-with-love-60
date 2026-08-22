import React from 'react';
import { CARD_TEMPLATES, HAND_FONTS, INK_COLORS, MESSAGE_IDEAS, getTemplate } from '@/data/cardConfig';
import { CardDraft } from '@/lib/cardRender';
import { Lightbulb, Type } from 'lucide-react';

type Props = {
  draft: CardDraft;
  update: (patch: Partial<CardDraft>) => void;
};

const MessageStep: React.FC<Props> = ({ draft, update }) => {
  const applyTemplate = (id: string) => {
    const t = getTemplate(id);
    update({
      templateId: t.id,
      fontId: t.fontId,
      inkColor: t.ink,
      headline: t.headline,
      message: t.defaultMessage
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-2xl text-[#2C2A29]">2. Write the card</h3>
        <p className="mt-1 text-sm text-[#7c7266]">
          Pick the occasion, choose your handwriting, and say the thing you always mean to say.
        </p>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Card style</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {CARD_TEMPLATES.map((t) => {
            const active = t.id === draft.templateId;
            return (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                className={`group rounded-xl border p-2 text-left transition-all duration-200 ${
                  active ? 'border-[#c9a273] bg-white shadow-md' : 'border-[#e6dccb] bg-[#fdfbf7] hover:border-[#d3bfa1]'
                }`}
              >
                <span
                  className="block h-10 w-full rounded-md border"
                  style={{ background: t.paper, borderColor: t.border }}
                />
                <span className="mt-2 block text-[11px] font-semibold text-[#2C2A29]">{t.name}</span>
                <span className="block text-[10px] uppercase tracking-wide text-[#a49a8d]">{t.occasion}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Card title (private)</span>
          <input
            value={draft.title}
            onChange={(e) => update({ title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#e0d5c2] bg-white px-3 py-2 text-sm text-[#2C2A29] outline-none focus:border-[#c9a273]"
            placeholder="Anniversary card for Sarah"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Greeting line</span>
          <input
            value={draft.headline}
            onChange={(e) => update({ headline: e.target.value })}
            maxLength={40}
            className="mt-1 w-full rounded-lg border border-[#e0d5c2] bg-white px-3 py-2 text-sm text-[#2C2A29] outline-none focus:border-[#c9a273]"
            placeholder="Happy Birthday!"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Your message</span>
        <textarea
          value={draft.message}
          onChange={(e) => update({ message: e.target.value })}
          rows={4}
          maxLength={280}
          className="mt-1 w-full rounded-lg border border-[#e0d5c2] bg-white px-3 py-2 text-sm leading-relaxed text-[#2C2A29] outline-none focus:border-[#c9a273]"
          placeholder="Write something they will keep..."
        />
        <span className="mt-1 block text-right text-[11px] text-[#a49a8d]">{draft.message.length}/280</span>
      </label>

      <div className="rounded-2xl border border-[#e6dccb] bg-[#fdfbf7] p-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">
          <Lightbulb className="h-3.5 w-3.5" /> Need words?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {MESSAGE_IDEAS.map((idea) => (
            <button
              key={idea}
              onClick={() => update({ message: idea })}
              className="rounded-full border border-[#e0d5c2] bg-white px-3 py-1.5 text-left text-[11px] text-[#5c5248] transition hover:border-[#c9a273]"
            >
              {idea.length > 46 ? `${idea.slice(0, 46)}…` : idea}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">
            <Type className="h-3.5 w-3.5" /> Handwriting
          </p>
          <div className="grid grid-cols-2 gap-2">
            {HAND_FONTS.map((f) => (
              <button
                key={f.id}
                onClick={() => update({ fontId: f.id })}
                style={{ fontFamily: f.family }}
                className={`rounded-lg border px-3 py-2 text-lg transition ${
                  draft.fontId === f.id
                    ? 'border-[#c9a273] bg-white text-[#2C2A29] shadow-sm'
                    : 'border-[#e6dccb] bg-[#fdfbf7] text-[#5c5248] hover:border-[#d3bfa1]'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Ink color</p>
          <div className="flex flex-wrap gap-2">
            {INK_COLORS.map((c) => (
              <button
                key={c}
                aria-label={`Ink ${c}`}
                onClick={() => update({ inkColor: c })}
                className={`h-9 w-9 rounded-full border-2 transition ${
                  draft.inkColor === c ? 'border-[#c9a273] scale-110' : 'border-white'
                }`}
                style={{ background: c, boxShadow: '0 0 0 1px #e0d5c2' }}
              />
            ))}
          </div>
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Sign off</span>
            <input
              value={draft.signature}
              onChange={(e) => update({ signature: e.target.value })}
              maxLength={40}
              className="mt-1 w-full rounded-lg border border-[#e0d5c2] bg-white px-3 py-2 text-sm text-[#2C2A29] outline-none focus:border-[#c9a273]"
              placeholder="Love always, Chris"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default MessageStep;

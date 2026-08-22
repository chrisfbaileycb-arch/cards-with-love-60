import React, { useMemo, useState } from 'react';
import { CardDraft } from '@/lib/cardRender';
import { composeCardBody, renderLayoutPng, sendCardFromMyEmail } from '@/lib/cardExport';
import { MERGE_TOKENS, applyTokens, firstNameOf } from '@/lib/personalize';
import { Recipient } from '@/components/studio/DeliveryStep';
import { supabase } from '@/lib/supabase';
import { CheckCheck, ChevronRight, Loader2, RotateCcw, Send, Users } from 'lucide-react';

type Props = {
  draft: CardDraft;
  recipients: Recipient[];
  footerNote?: string | null;
  onQueueChanged: () => void;
};

const UNTAGGED = 'untagged';

const BatchOutreach: React.FC<Props> = ({ draft, recipients, footerNote, onQueueChanged }) => {
  const [tags, setTags] = useState<string[]>([]);
  const [subject, setSubject] = useState('A quick note for you, {{name}}');
  const [message, setMessage] = useState(
    draft.message?.includes('{{') ? draft.message : `Hi {{name}} — ${draft.message || 'thinking of you today.'}`
  );
  const [queue, setQueue] = useState<Recipient[] | null>(null);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const tagList = useMemo(() => {
    const counts = new Map<string, number>();
    recipients.forEach((r) => {
      const key = (r.relationship || '').trim().toLowerCase() || UNTAGGED;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [recipients]);

  const group = useMemo(() => {
    if (!tags.length) return [];
    return recipients.filter((r) => tags.includes((r.relationship || '').trim().toLowerCase() || UNTAGGED));
  }, [recipients, tags]);

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const start = () => {
    if (!group.length) {
      setNote('Pick at least one group with people in it.');
      return;
    }
    setQueue(group);
    setIndex(0);
    setDone([]);
    setNote(`${group.length} personalized cards ready. Work through them one at a time.`);
  };

  const reset = () => {
    setQueue(null);
    setIndex(0);
    setDone([]);
    setNote(null);
  };

  const current = queue && index < queue.length ? queue[index] : null;

  const personalizedDraft = (person: Recipient): CardDraft => ({
    ...draft,
    headline: applyTokens(draft.headline, person),
    message: applyTokens(message, person),
    title: `${draft.title} — ${firstNameOf(person.name)}`
  });

  const sendCurrent = async () => {
    if (!current) return;
    setBusy(true);
    setNote(null);
    try {
      const personal = personalizedDraft(current);
      const png = await renderLayoutPng(personal, 'card');
      const finalSubject = applyTokens(subject, current) || 'A quick note for you';
      const outcome = await sendCardFromMyEmail({
        dataUrl: png,
        to: current.email,
        subject: finalSubject,
        body: composeCardBody(personal, footerNote),
        filename: `card-${firstNameOf(current.name).toLowerCase() || 'kindred'}.png`
      });

      // keep a personal record of the one-to-one send
      supabase
        .from('card_sends')
        .insert({
          recipient_name: current.name,
          recipient_email: current.email,
          subject: finalSubject,
          message: composeCardBody(personal, footerNote),
          send_at: new Date().toISOString(),
          status: 'sent',
          repeat_rule: 'once',
          delivered_at: new Date().toISOString()
        })
        .then(() => onQueueChanged());

      setDone((prev) => [...prev, current.id]);
      setNote(
        outcome === 'shared'
          ? `Handed ${firstNameOf(current.name)}'s card to your share sheet.`
          : `Draft for ${firstNameOf(current.name)} opened in your mail app — send it, then move to the next.`
      );
      setIndex((i) => i + 1);
    } catch {
      setNote('Could not build that card. Skip it or try again.');
    } finally {
      setBusy(false);
    }
  };

  const skip = () => {
    setNote(null);
    setIndex((i) => i + 1);
  };

  const total = queue?.length ?? 0;
  const progress = total ? Math.round((done.length / total) * 100) : 0;

  return (
    <section id="outreach" className="bg-[#F6F1E8] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-8 max-w-2xl">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#A4794A]">
            <Users className="h-3.5 w-3.5" /> Batch outreach
          </span>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-[#2C2A29] sm:text-4xl">
            Forty clients, one at a time — never a bulk blast.
          </h2>
          <p className="mt-3 text-sm text-[#7c7266]">
            Pick a group, write the note once with a <span className="font-mono text-[#5c5248]">{'{{name}}'}</span> token,
            and Kindred builds a separate card for every person. You still press send on each one, from your own inbox.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="rounded-3xl border border-[#e6dccb] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">1. Choose a group</p>
            {tagList.length === 0 ? (
              <p className="mt-2 text-sm text-[#8b8177]">
                Add people (or import a CSV) with a relationship like “client” and the groups appear here.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {tagList.map(([tag, count]) => {
                  const active = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs capitalize transition ${
                        active
                          ? 'border-[#A4794A] bg-[#A4794A] text-white'
                          : 'border-[#e0d5c2] bg-[#fdfbf7] text-[#5c5248] hover:border-[#c9a273]'
                      }`}
                    >
                      {tag} <span className="opacity-70">· {count}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">
              2. Write it once, with tokens
            </p>
            <div className="mt-3 space-y-3">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line"
                className="w-full rounded-lg border border-[#e0d5c2] px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Hi {{name}}, thanks for trusting me with your move this year."
                className="w-full rounded-lg border border-[#e0d5c2] px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#c9a273]"
              />
              <div className="flex flex-wrap gap-1.5">
                {MERGE_TOKENS.map((t) => (
                  <button
                    key={t.token}
                    onClick={() => setMessage((m) => `${m}${m.endsWith(' ') || !m ? '' : ' '}${t.token}`)}
                    className="rounded-full border border-[#e0d5c2] bg-[#fdfbf7] px-2.5 py-1 font-mono text-[10px] text-[#5c5248] transition hover:border-[#c9a273]"
                  >
                    {t.token}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={start}
                disabled={!group.length}
                className="inline-flex items-center gap-2 rounded-full bg-[#2C2A29] px-6 py-3 text-sm font-semibold text-[#FDFBF7] transition hover:bg-[#413d3a] disabled:opacity-50"
              >
                <Users className="h-4 w-4" />
                {group.length ? `Build ${group.length} personalized cards` : 'Pick a group first'}
              </button>
              {queue && (
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d9cbb6] px-5 py-3 text-sm text-[#5c5248] transition hover:border-[#c9a273]"
                >
                  <RotateCcw className="h-4 w-4" /> Start over
                </button>
              )}
            </div>
            {note && <p className="mt-3 text-xs text-[#5c5248]">{note}</p>}
          </div>

          <div className="rounded-3xl border border-[#e6dccb] bg-[#fdfbf7] p-6 shadow-sm lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">3. Work the list</p>

            {!queue && (
              <p className="mt-3 text-sm text-[#8b8177]">
                Nothing queued yet. Choose a group and build the cards — you will step through them here.
              </p>
            )}

            {queue && (
              <>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="font-serif text-2xl text-[#2C2A29]">
                    {Math.min(done.length + 1, total)} <span className="text-sm text-[#8b8177]">of {total}</span>
                  </span>
                  <span className="text-xs font-semibold text-[#8f6739]">{progress}% sent</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#eee5d8]">
                  <div className="h-full rounded-full bg-[#A4794A] transition-all" style={{ width: `${progress}%` }} />
                </div>

                {current ? (
                  <div className="mt-5 rounded-2xl border border-[#e6dccb] bg-white p-4">
                    <p className="text-sm font-semibold text-[#2C2A29]">{current.name}</p>
                    <p className="text-xs text-[#8b8177]">
                      {current.email}
                      {current.relationship ? ` · ${current.relationship}` : ''}
                    </p>
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#b3a794]">Subject</p>
                    <p className="text-xs text-[#5c5248]">{applyTokens(subject, current)}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-[#b3a794]">Their card says</p>
                    <p className="whitespace-pre-line text-xs leading-relaxed text-[#5c5248]">
                      {applyTokens(message, current)}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={sendCurrent}
                        disabled={busy}
                        className="inline-flex items-center gap-2 rounded-full bg-[#A4794A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8f6739] disabled:opacity-60"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {busy ? 'Building card…' : 'Send from my email'}
                      </button>
                      <button
                        onClick={skip}
                        className="inline-flex items-center gap-1 rounded-full border border-[#d9cbb6] px-4 py-2.5 text-sm text-[#5c5248] transition hover:border-[#c9a273]"
                      >
                        Skip <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-[#dbe7dc] bg-[#f1f7f0] p-5 text-sm text-[#3d6b46]">
                    <p className="flex items-center gap-2 font-semibold">
                      <CheckCheck className="h-4 w-4" /> That is the whole group.
                    </p>
                    <p className="mt-1 text-xs">
                      {done.length} sent from your own inbox. Every one of them got their own card.
                    </p>
                  </div>
                )}

                <ul className="mt-5 max-h-56 space-y-1 overflow-auto">
                  {queue.map((r, i) => (
                    <li
                      key={r.id}
                      className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs ${
                        done.includes(r.id)
                          ? 'bg-[#eef4ea] text-[#3d6b46]'
                          : i === index
                            ? 'bg-white text-[#2C2A29] shadow-sm'
                            : 'text-[#8b8177]'
                      }`}
                    >
                      <span className="truncate">{r.name}</span>
                      {done.includes(r.id) ? (
                        <CheckCheck className="h-3.5 w-3.5 flex-none" />
                      ) : i === index ? (
                        <span className="flex-none text-[10px] font-bold uppercase">now</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BatchOutreach;

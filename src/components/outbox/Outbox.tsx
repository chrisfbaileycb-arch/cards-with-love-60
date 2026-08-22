import React, { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { markSendComplete, snoozeSend } from '@/lib/senderSettings';
import { composeCardBody, sendCardFromMyEmail } from '@/lib/cardExport';
import { CalendarClock, CheckCheck, Clock, Loader2, Mail, Send, Trash2 } from 'lucide-react';

export type CardSend = {
  id: string;
  recipient_name: string;
  recipient_email: string;
  subject: string;
  message: string;
  image_url: string | null;
  send_at: string;
  status: string;
  repeat_rule: string;
  error: string | null;
  delivered_at: string | null;
  attempts: number | null;
  last_attempt_at: string | null;
};

type Props = {
  sends: CardSend[];
  loading: boolean;
  reload: () => void;
  footerNote?: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-[#f3e9d8] text-[#8f6739]',
  ready: 'bg-[#e7f0e4] text-[#3d6b46]',
  sent: 'bg-[#e6ecf5] text-[#39557d]',
  failed: 'bg-[#f9e6e6] text-[#8A3B44]',
  cancelled: 'bg-[#efeae2] text-[#8b8177]'
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Scheduled',
  ready: 'Ready to send',
  sent: 'Sent',
  failed: 'Needs attention',
  cancelled: 'Cancelled'
};

const FILTERS = ['due', 'upcoming', 'sent', 'all'] as const;

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

const isDue = (s: CardSend) => s.status !== 'sent' && new Date(s.send_at).getTime() <= Date.now();

const Outbox: React.FC<Props> = ({ sends, loading, reload, footerNote }) => {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('due');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      due: sends.filter(isDue).length,
      upcoming: sends.filter((s) => s.status !== 'sent' && !isDue(s)).length,
      sent: sends.filter((s) => s.status === 'sent').length
    }),
    [sends]
  );

  const visible = useMemo(() => {
    if (filter === 'all') return sends;
    if (filter === 'due') return sends.filter(isDue);
    if (filter === 'upcoming') return sends.filter((s) => s.status !== 'sent' && !isDue(s));
    return sends.filter((s) => s.status === 'sent');
  }, [sends, filter]);

  const dataUrlFromRemote = async (url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('read failed'));
      reader.readAsDataURL(blob);
    });
  };

  /** Opens the person's own mail app with the card attached / copied, then offers to mark it sent. */
  const sendNow = async (s: CardSend) => {
    setBusyId(s.id);
    setToast(null);
    try {
      const body = composeCardBody(
        { headline: '', message: s.message, signature: '' },
        s.image_url ? `Card image: ${s.image_url}` : footerNote
      );
      if (s.image_url) {
        const dataUrl = await dataUrlFromRemote(s.image_url);
        const outcome = await sendCardFromMyEmail({
          dataUrl,
          to: s.recipient_email,
          subject: s.subject,
          body: s.message,
          filename: 'kindred-card.png'
        });
        setToast(
          outcome === 'shared'
            ? 'Shared with the card attached — mark it sent when it goes out.'
            : 'Draft opened in your mail app with the card ready to paste or attach.'
        );
      } else {
        window.location.href = `mailto:${encodeURIComponent(s.recipient_email)}?subject=${encodeURIComponent(
          s.subject
        )}&body=${encodeURIComponent(body)}`;
        setToast('Draft opened in your mail app.');
      }
    } catch {
      setToast('Could not open a draft. Try downloading the card from the studio.');
    } finally {
      setBusyId(null);
    }
  };

  const markSent = async (id: string) => {
    await markSendComplete(id);
    reload();
  };

  const snooze = async (s: CardSend) => {
    await snoozeSend(s.id, s.send_at, 1);
    setToast(`Pushed to ${fmt(new Date(Math.max(new Date(s.send_at).getTime(), Date.now()) + 86_400_000).toISOString())}.`);
    reload();
  };

  const cancel = async (id: string) => {
    await supabase.from('card_sends').delete().eq('id', id);
    reload();
  };

  return (
    <section id="outbox" className="bg-[#F1EADF] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A4794A]">Your send calendar</span>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-[#2C2A29] sm:text-4xl">
              Everything you lined up, waiting for one tap.
            </h2>
            <p className="mt-3 text-sm text-[#7c7266]">
              Cards are prepared here with the note, the image and the address already filled in. When one is due, hit
              <span className="font-semibold text-[#5c5248]"> Send from my email</span> — it opens in your own mail app so
              it arrives as a personal note, never as bulk mail.
            </p>
          </div>
          {counts.due > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#2C2A29] px-4 py-2 text-xs font-semibold text-[#FDFBF7]">
              <Clock className="h-3.5 w-3.5" /> {counts.due} due now
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                filter === f
                  ? 'bg-[#2C2A29] text-[#FDFBF7]'
                  : 'border border-[#e0d5c2] bg-white text-[#8b8177] hover:border-[#c9a273]'
              }`}
            >
              {f}
              {f === 'due' && counts.due > 0 && ` · ${counts.due}`}
              {f === 'upcoming' && counts.upcoming > 0 && ` · ${counts.upcoming}`}
              {f === 'sent' && counts.sent > 0 && ` · ${counts.sent}`}
            </button>
          ))}
          {toast && <span className="ml-1 text-xs text-[#5c5248]">{toast}</span>}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading && <p className="text-sm text-[#8b8177]">Loading your calendar…</p>}
          {!loading && visible.length === 0 && (
            <p className="rounded-2xl border border-dashed border-[#ddd0bb] bg-white/60 p-8 text-sm text-[#8b8177]">
              Nothing here yet. Build a card in the studio and save it to your send calendar.
            </p>
          )}
          {visible.map((s) => (
            <article
              key={s.id}
              className="flex gap-4 rounded-2xl border border-[#e6dccb] bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              {s.image_url ? (
                <img
                  src={s.image_url}
                  alt="Scheduled card"
                  className="h-24 w-20 flex-none rounded-lg border border-[#eee5d8] object-cover"
                />
              ) : (
                <div className="flex h-24 w-20 flex-none items-center justify-center rounded-lg bg-[#f6f0e6] text-[#c1b6a4]">
                  <Mail className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-[#2C2A29]">{s.recipient_name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      isDue(s) ? STATUS_STYLES.ready : STATUS_STYLES[s.status] ?? STATUS_STYLES.cancelled
                    }`}
                  >
                    {isDue(s) ? STATUS_LABEL.ready : STATUS_LABEL[s.status] ?? s.status}
                  </span>
                </div>
                <p className="truncate text-xs text-[#8b8177]">{s.recipient_email}</p>
                <p className="mt-1 truncate text-xs font-medium text-[#5c5248]">{s.subject}</p>

                <p className="mt-2 flex items-center gap-1 text-[11px] text-[#a49a8d]">
                  <CalendarClock className="h-3 w-3" />
                  {s.status === 'sent' && s.delivered_at ? `Sent ${fmt(s.delivered_at)}` : fmt(s.send_at)}
                  {s.repeat_rule !== 'once' && ` · ${s.repeat_rule}`}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {s.status !== 'sent' && (
                    <button
                      onClick={() => sendNow(s)}
                      disabled={busyId === s.id}
                      className="inline-flex items-center gap-1 rounded-full bg-[#A4794A] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#8f6739] disabled:opacity-60"
                    >
                      {busyId === s.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Send className="h-3 w-3" />
                      )}
                      Send from my email
                    </button>
                  )}
                  {s.status !== 'sent' && (
                    <button
                      onClick={() => markSent(s.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#d9cbb6] px-3 py-1.5 text-[11px] text-[#5c5248] transition hover:border-[#c9a273]"
                    >
                      <CheckCheck className="h-3 w-3" /> Mark sent
                    </button>
                  )}
                  {s.status !== 'sent' && (
                    <button
                      onClick={() => snooze(s)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#d9cbb6] px-3 py-1.5 text-[11px] text-[#5c5248] transition hover:border-[#c9a273]"
                    >
                      <Clock className="h-3 w-3" /> +1 day
                    </button>
                  )}
                  <button
                    onClick={() => cancel(s.id)}
                    aria-label="Remove from calendar"
                    className="inline-flex items-center gap-1 rounded-full border border-[#eddede] px-3 py-1.5 text-[11px] text-[#a05a5a] transition hover:bg-[#fdf3f3]"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Outbox;

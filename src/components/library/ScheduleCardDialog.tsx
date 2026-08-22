import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { REPEAT_RULES } from '@/data/cardConfig';
import { CardRow } from '@/lib/cardLibrary';
import { Recipient } from '@/components/studio/DeliveryStep';
import { downloadSendReminder } from '@/lib/cardExport';
import DeliveryDatePicker from '@/components/studio/DeliveryDatePicker';
import { CalendarClock, Loader2, X } from 'lucide-react';

type Props = {
  card: CardRow;
  recipients: Recipient[];
  onClose: () => void;
  onScheduled: (msg: string) => void;
};

const defaultSendAt = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(8, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ScheduleCardDialog: React.FC<Props> = ({ card, recipients, onClose, onScheduled }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [subject, setSubject] = useState(card.headline || card.title || 'A little card, just for you');
  const [sendAt, setSendAt] = useState(defaultSendAt());
  const [repeatRule, setRepeatRule] = useState('once');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected.length) return setError('Pick at least one person.');
    if (!subject.trim()) return setError('Add a subject line.');
    setSaving(true);
    setError(null);
    try {
      const chosen = recipients.filter((r) => selected.includes(r.id));
      const body = [card.headline, card.message, card.signature].filter((s) => s && String(s).trim()).join('\n\n');
      const { error: err } = await supabase.from('card_sends').insert(
        chosen.map((r) => ({
          card_id: card.id,
          recipient_name: r.name,
          recipient_email: r.email,
          subject: subject.trim(),
          message: body,
          image_url: card.image_url,
          send_at: new Date(sendAt).toISOString(),
          status: 'scheduled',
          repeat_rule: repeatRule
        }))
      );
      if (err) throw new Error(err.message);
      downloadSendReminder({
        recipientNames: chosen.map((r) => r.name).join(', '),
        recipientEmails: chosen.map((r) => r.email).join(', '),
        subject: subject.trim(),
        sendAt: new Date(sendAt).toISOString(),
        repeatRule,
        appUrl: `${window.location.origin}${window.location.pathname}#outbox`
      });
      onScheduled(`Reminder saved for ${chosen.length} ${chosen.length === 1 ? 'person' : 'people'} and calendar event downloaded.`);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Could not schedule that card.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6">
      <form
        onSubmit={submit}
        className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-t-3xl bg-[#FDFBF7] p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {card.image_url && (
              <img
                src={card.image_url}
                alt={card.title}
                className="h-20 w-16 flex-none rounded-lg border border-[#eee5d8] object-cover"
              />
            )}
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#A4794A]">
                <CalendarClock className="h-3.5 w-3.5" /> Re-schedule this card
              </p>
              <h3 className="mt-1 font-serif text-xl text-[#2C2A29]">{card.title}</h3>
              <p className="text-xs text-[#8b8177]">{card.occasion}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-[#e0d5c2] p-2 text-[#5c5248] transition hover:border-[#c9a273]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Send it to</span>
          {recipients.length === 0 ? (
            <p className="mt-2 text-sm text-[#8b8177]">Add someone to your people list first.</p>
          ) : (
            <div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-auto">
              {recipients.map((r) => {
                const active = selected.includes(r.id);
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => toggle(r.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      active
                        ? 'border-[#A4794A] bg-[#A4794A] text-white'
                        : 'border-[#e0d5c2] bg-white text-[#5c5248] hover:border-[#c9a273]'
                    }`}
                  >
                    {r.name}
                    {r.relationship ? <span className="opacity-70"> · {r.relationship}</span> : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#dec9aa] bg-[#fffaf1] p-3 text-xs leading-relaxed text-[#675b4e] sm:col-span-3">
            This saves a reminder; Kindred will not send automatically. The downloaded calendar event brings you back
            to the Outbox, where you send the card through your own email.
          </div>
          <label className="block sm:col-span-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Subject line</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e0d5c2] bg-white px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
            />
          </label>
          <div className="sm:col-span-2">
            <DeliveryDatePicker
              id="library-schedule-send-at"
              label="Send date & time"
              value={sendAt}
              onChange={setSendAt}
            />
          </div>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Repeat</span>
            <select
              value={repeatRule}
              onChange={(e) => setRepeatRule(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e0d5c2] bg-white px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
            >
              {REPEAT_RULES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="mt-3 text-xs text-[#8A3B44]">{error}</p>}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[#2C2A29] px-6 py-3 text-sm font-semibold text-[#FDFBF7] transition hover:bg-[#413d3a] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save reminder & download .ics'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d9cbb6] px-5 py-3 text-sm text-[#5c5248] transition hover:border-[#c9a273]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleCardDialog;

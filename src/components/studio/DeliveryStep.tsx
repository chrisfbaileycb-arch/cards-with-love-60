import React, { useState } from 'react';
import { CRM_SUBSCRIBE_URL, EXPORT_LAYOUTS, REPEAT_RULES } from '@/data/cardConfig';
import { usePlan, goToPricing } from '@/lib/plan';
import UpgradeNudge from '@/components/pricing/UpgradeNudge';
import DeliveryDatePicker from './DeliveryDatePicker';
import { CalendarClock, Copy, Download, ExternalLink, Library, Loader2, Lock, Mail, Send, Share2 } from 'lucide-react';


export type Recipient = {
  id: string;
  name: string;
  email: string;
  relationship?: string | null;
};

type Props = {
  recipients: Recipient[];
  selectedIds: string[];
  toggleRecipient: (id: string) => void;
  onSchedule: (opts: { subject: string; sendAt: string; repeatRule: string }) => Promise<void>;
  onExport: (layoutId: string) => void;
  onCopy: () => void;
  onSendFromMyEmail: (subject: string) => void;
  onScheduleInGmail: (subject: string) => void;
  onSaveToLibrary: () => void;
  savingLibrary: boolean;
  exportingLayout: string | null;
  sending: boolean;
  scheduling: boolean;
  notify: (msg: string, tone?: 'ok' | 'error') => void;
};

const defaultSendAt = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(8, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const DeliveryStep: React.FC<Props> = ({
  recipients,
  selectedIds,
  toggleRecipient,
  onSchedule,
  onExport,
  onCopy,
  onSendFromMyEmail,
  onScheduleInGmail,
  onSaveToLibrary,
  savingLibrary,
  exportingLayout,
  sending,
  scheduling,
  notify
}) => {
  const { isPro, isLayoutLocked } = usePlan();

  const [subject, setSubject] = useState('A little card, just for you');
  const [sendAt, setSendAt] = useState(defaultSendAt());
  const [repeatRule, setRepeatRule] = useState('once');
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [savingQuick, setSavingQuick] = useState(false);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIds.length) {
      notify('Pick at least one person to send this card to.', 'error');
      return;
    }
    if (!subject.trim()) {
      notify('Give the email a subject line.', 'error');
      return;
    }
    if (new Date(sendAt).getTime() < Date.now() - 60_000) {
      notify('Choose a date and time in the future.', 'error');
      return;
    }
    await onSchedule({ subject: subject.trim(), sendAt: new Date(sendAt).toISOString(), repeatRule });
  };

  const quickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quickEmail)) {
      notify('That email address does not look right.', 'error');
      return;
    }
    setSavingQuick(true);
    try {
      await fetch(CRM_SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: quickEmail.trim(),
          name: quickName.trim() || undefined,
          phone: quickPhone.trim() || undefined,
          sms_opt_in: smsOptIn === true,
          source: 'card-delivery-quick-add',
          tags: ['card-recipient', 'kindred-cards']
        })
      });
      notify('Saved. They are on your card list now.');
      setQuickName('');
      setQuickEmail('');
      setQuickPhone('');
    } catch {
      notify('Could not save that contact. Try again.', 'error');
    } finally {
      setSavingQuick(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-2xl text-[#2C2A29]">3. Send it from your own email</h3>
        <p className="mt-1 text-sm text-[#7c7266]">
          No email API key required — Kindred does not automatically send email. The card goes out from your real
          address, or save it in the size you need for a post.
        </p>

      </div>

      <div className="rounded-2xl border border-[#e6dccb] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Send it now</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => onSendFromMyEmail(subject.trim() || 'A little card, just for you')}
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-full bg-[#A4794A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8f6739] disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            {sending ? 'Preparing the card…' : 'Send via my email'}
          </button>
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-2 rounded-full border border-[#d9cbb6] bg-white px-5 py-2.5 text-sm font-medium text-[#5c5248] transition hover:border-[#c9a273]"
          >
            <Copy className="h-4 w-4" /> Copy image
          </button>
          <button
            onClick={onSaveToLibrary}
            disabled={savingLibrary}
            className="inline-flex items-center gap-2 rounded-full border border-[#d9cbb6] bg-white px-5 py-2.5 text-sm font-medium text-[#5c5248] transition hover:border-[#c9a273] disabled:opacity-60"
          >
            {savingLibrary ? <Loader2 className="h-4 w-4 animate-spin" /> : <Library className="h-4 w-4" />}
            {savingLibrary ? 'Saving…' : 'Save to my library'}
          </button>
        </div>

        <p className="mt-2 text-[11px] leading-relaxed text-[#a49a8d]">
          On a phone this opens your share sheet with the PNG attached. On a desktop the image is copied to your
          clipboard and a pre-filled draft opens in your mail app — paste and hit send.
        </p>
      </div>

      <div className="rounded-2xl border border-[#e6dccb] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">
            Save it for a post or a print
          </p>
          {!isPro && <UpgradeNudge feature="social-exports" variant="inline" />}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {EXPORT_LAYOUTS.map((l) => {
            const locked = isLayoutLocked(l.id);
            return (
              <button
                key={l.id}
                onClick={() => (locked ? goToPricing() : onExport(l.id))}
                disabled={exportingLayout === l.id}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition disabled:opacity-60 ${
                  locked
                    ? 'border-dashed border-[#d9cbb6] bg-[#fdf9f1] hover:border-[#c9a273]'
                    : 'border-[#e0d5c2] bg-[#fdfbf7] hover:border-[#c9a273]'
                }`}
              >
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#f3e9d8] text-[#8f6739]">
                  {exportingLayout === l.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : locked ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#2C2A29]">{l.name}</span>
                  <span className="block text-[11px] leading-relaxed text-[#8b8177]">{l.blurb}</span>
                  <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-[#b3a794]">
                    {l.width} × {l.height}
                    {locked ? ' · Local Agent' : ''}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {!isPro && <UpgradeNudge feature="social-exports" className="mt-3" />}
      </div>


      <form onSubmit={handleSchedule} className="rounded-2xl border border-[#e6dccb] bg-[#fdfbf7] p-5">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">
          <CalendarClock className="h-3.5 w-3.5" /> Send later: choose one of two flows
        </p>

        <div className="mt-3 rounded-xl border border-[#dec9aa] bg-[#fffaf1] p-4 text-xs leading-relaxed text-[#675b4e]">
          <p className="font-semibold text-[#4f4438]">Kindred does not automatically send email.</p>
          <p className="mt-1">
            <strong>Gmail:</strong> open a prepared Gmail draft now, attach the downloaded PNG, then use Gmail’s arrow
            beside Send → <strong>Schedule send</strong> → choose your date and time.
          </p>
          <p className="mt-1">
            <strong>Reminder:</strong> save the card in your Kindred Send Calendar and download a calendar reminder. On
            that day, return to the Outbox and send it through your own email.
          </p>
        </div>

        <div className="mt-4">
          <span className="text-xs font-semibold text-[#5c5248]">Who is it for?</span>
          {recipients.length === 0 ? (
            <p className="mt-2 text-sm text-[#8b8177]">
              No one on your list yet — add someone below or in the People section.
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {recipients.map((r) => {
                const active = selectedIds.includes(r.id);
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => toggleRecipient(r.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      active
                        ? 'border-[#A4794A] bg-[#A4794A] text-white'
                        : 'border-[#e0d5c2] bg-white text-[#5c5248] hover:border-[#c9a273]'
                    }`}
                  >
                    {r.name} <span className="opacity-70">· {r.email}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block sm:col-span-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Subject line</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e0d5c2] bg-white px-3 py-2 text-sm text-[#2C2A29] outline-none focus:border-[#c9a273]"
            />
          </label>
          <div className="sm:col-span-2">
            <DeliveryDatePicker
              id="studio-delivery-send-at"
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
              className="mt-1 w-full rounded-lg border border-[#e0d5c2] bg-white px-3 py-2 text-sm text-[#2C2A29] outline-none focus:border-[#c9a273]"
            >
              {REPEAT_RULES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onScheduleInGmail(subject.trim() || 'A little card, just for you')}
            disabled={sending || !selectedIds.length}
            className="inline-flex items-center gap-2 rounded-full bg-[#A4794A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8f6739] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ExternalLink className="h-4 w-4" /> Schedule now in Gmail
          </button>
          <button
            type="submit"
            disabled={scheduling}
            className="inline-flex items-center gap-2 rounded-full bg-[#2C2A29] px-6 py-3 text-sm font-semibold text-[#FDFBF7] transition hover:bg-[#413d3a] disabled:opacity-60"
          >
            {scheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
            {scheduling ? 'Saving reminder…' : 'Save reminder & download .ics'}
          </button>
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-[#a49a8d]">
          <Mail className="mt-0.5 h-3 w-3 flex-none" />
          Gmail scheduling happens inside Gmail. The reminder flow creates a calendar event; it does not transmit the
          card automatically.
        </p>
      </form>

      <form onSubmit={quickAdd} className="rounded-2xl border border-[#e6dccb] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Quick add someone</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            placeholder="Name"
            className="rounded-lg border border-[#e0d5c2] px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
          />
          <input
            type="email"
            required
            value={quickEmail}
            onChange={(e) => setQuickEmail(e.target.value)}
            placeholder="Email address"
            className="rounded-lg border border-[#e0d5c2] px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
          />
          <input
            type="tel"
            value={quickPhone}
            onChange={(e) => setQuickPhone(e.target.value)}
            placeholder="Phone number (optional)"
            className="rounded-lg border border-[#e0d5c2] px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
          />
        </div>
        <label className="mt-3 flex items-start gap-2 text-[11px] text-[#7c7266]">
          <input
            type="checkbox"
            checked={smsOptIn}
            onChange={(e) => setSmsOptIn(e.target.checked)}
            className="mt-0.5 accent-[#A4794A]"
          />
          <span>Text me updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
        </label>
        <button
          type="submit"
          disabled={savingQuick}
          className="mt-3 rounded-full border border-[#d9cbb6] px-5 py-2 text-sm font-medium text-[#5c5248] transition hover:border-[#c9a273] disabled:opacity-60"
        >
          {savingQuick ? 'Saving…' : 'Save contact'}
        </button>
      </form>
    </div>
  );
};

export default DeliveryStep;

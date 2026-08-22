import React, { useEffect, useState } from 'react';
import { BRAND, CRM_SUBSCRIBE_URL } from '@/data/cardConfig';
import {
  EMAIL_RE,
  SenderSettings as SenderSettingsType,
  emptySettings,
  saveSenderSettings
} from '@/lib/senderSettings';
import { usePlan } from '@/lib/plan';
import UpgradeNudge from '@/components/pricing/UpgradeNudge';
import { AtSign, KeyRound, Loader2, MailCheck, Save, ShieldCheck } from 'lucide-react';

type Props = {
  settings: SenderSettingsType | null;
  reload: () => Promise<void> | void;
};


const HOW_IT_WORKS = [
  {
    icon: KeyRound,
    title: 'No email API key, ever',
    detail:
      'There is no email sending service in the middle. Nothing to sign up for, nothing to pay per email, no domain to verify. AI artwork generation is separate and may use plan credits.'
  },

  {
    icon: MailCheck,
    title: 'It comes from your real address',
    detail:
      'Cards open as a draft in Gmail, Outlook, Apple Mail or your phone share sheet — so it lands like a note from a person, not a campaign.'
  },
  {
    icon: ShieldCheck,
    title: 'Great for a small pipeline',
    detail:
      'Perfect for family, friends and a client list of a few dozen. Your name and signature below are stamped onto every card and note.'
  }
];

const SenderSettingsPanel: React.FC<Props> = ({ settings, reload }) => {
  const { isPro } = usePlan();
  const [form, setForm] = useState<SenderSettingsType>(settings ?? emptySettings());
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ msg: string; tone: 'ok' | 'error' } | null>(null);


  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const set = (patch: Partial<SenderSettingsType>) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.from_name.trim()) {
      setNote({ msg: 'Add the name you want cards to come from.', tone: 'error' });
      return;
    }
    if (!EMAIL_RE.test(form.from_email.trim())) {
      setNote({ msg: 'That email does not look like a valid address.', tone: 'error' });
      return;
    }
    if (form.reply_to && form.reply_to.trim() && !EMAIL_RE.test(form.reply_to.trim())) {
      setNote({ msg: 'That reply-to address does not look valid.', tone: 'error' });
      return;
    }

    setSaving(true);
    setNote(null);
    try {
      const saved = await saveSenderSettings(form);
      setForm(saved);

      await fetch(CRM_SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.from_email.trim(),
          name: form.from_name.trim() || undefined,
          phone: form.phone?.trim() || undefined,
          sms_opt_in: form.sms_opt_in === true,
          source: 'sender-settings',
          tags: ['sender', 'kindred-cards']
        })
      });

      await reload();
      setNote({ msg: 'Saved. Every card and note now signs off with this identity.', tone: 'ok' });
    } catch (err) {
      setNote({ msg: (err as Error).message || 'Could not save those settings.', tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="settings" className="bg-[#FDFBF7] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A4794A]">Your sending identity</span>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-[#2C2A29] sm:text-4xl">
            You are the sender. {BRAND.short} just makes the card.
          </h2>
          <p className="mt-3 text-sm text-[#7c7266]">
            Cards go out of your own mailbox — no provider key, no bulk-sending service. Tell us who you are and we will
            sign the note, fill the draft and address it for you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <form onSubmit={submit} className="rounded-3xl border border-[#e6dccb] bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">Your name</span>
                <input
                  value={form.from_name}
                  onChange={(e) => set({ from_name: e.target.value })}
                  placeholder="Chris & family"
                  className="mt-1 w-full rounded-lg border border-[#e0d5c2] px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">
                  Your email address
                </span>
                <input
                  type="email"
                  value={form.from_email}
                  onChange={(e) => set({ from_email: e.target.value })}
                  placeholder="you@gmail.com"
                  className="mt-1 w-full rounded-lg border border-[#e0d5c2] px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
                />
                <span className="mt-1 block text-[11px] text-[#a49a8d]">
                  Any address works — Gmail, Outlook, iCloud or your work domain.
                </span>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">
                  Reply-to (optional)
                </span>
                <input
                  type="email"
                  value={form.reply_to ?? ''}
                  onChange={(e) => set({ reply_to: e.target.value })}
                  placeholder="me@myoffice.com"
                  className="mt-1 w-full rounded-lg border border-[#e0d5c2] px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">
                  Phone number (optional)
                </span>
                <input
                  type="tel"
                  value={form.phone ?? ''}
                  onChange={(e) => set({ phone: e.target.value })}
                  placeholder="+1 555 123 4567"
                  className="mt-1 w-full rounded-lg border border-[#e0d5c2] px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">
                  Sign-off line added under every note
                </span>
                <input
                  value={form.footer_note ?? ''}
                  onChange={(e) => set({ footer_note: e.target.value })}
                  placeholder="Chris Bailey · Bailey Realty · 555-123-4567"
                  className="mt-1 w-full rounded-lg border border-[#e0d5c2] px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
                />
                <span className="mt-1 block text-[11px] text-[#a49a8d]">
                  Family? Keep it warm. Business outreach? Drop your title and number here.
                </span>
              </label>
              <div className="sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">
                    Branded footer on the card itself
                  </span>
                  {!isPro && <UpgradeNudge feature="branded-footer" variant="inline" />}
                </div>
                {isPro ? (
                  <div className="mt-2 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[11px] text-[#8b8177]">Agency logo URL</span>
                      <input
                        value={form.logo_url ?? ''}
                        onChange={(e) => set({ logo_url: e.target.value })}
                        placeholder="https://myagency.com/logo.png"
                        className="mt-1 w-full rounded-lg border border-[#e0d5c2] px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] text-[#8b8177]">Call-to-action link</span>
                      <input
                        value={form.cta_link ?? ''}
                        onChange={(e) => set({ cta_link: e.target.value })}
                        placeholder="baileyrealty.com/free-home-value"
                        className="mt-1 w-full rounded-lg border border-[#e0d5c2] px-3 py-2 text-sm outline-none focus:border-[#c9a273]"
                      />
                    </label>
                    <p className="text-[11px] leading-relaxed text-[#a49a8d] sm:col-span-2">
                      Your sign-off, logo and link are stamped into the bottom of every card and every social export.
                    </p>
                  </div>
                ) : (
                  <UpgradeNudge feature="branded-footer" className="mt-2" />
                )}
              </div>
            </div>


            <label className="mt-4 flex items-start gap-2 text-[11px] text-[#7c7266]">
              <input
                type="checkbox"
                checked={form.sms_opt_in}
                onChange={(e) => set({ sms_opt_in: e.target.checked })}
                className="mt-0.5 accent-[#A4794A]"
              />
              <span>Text me updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
            </label>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#2C2A29] px-6 py-3 text-sm font-semibold text-[#FDFBF7] transition hover:bg-[#413d3a] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save my identity'}
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f0e4] px-3 py-1.5 text-[11px] font-semibold text-[#3d6b46]">
                <KeyRound className="h-3 w-3" /> No email API key required
              </span>

            </div>

            {note && (
              <p className={`mt-3 text-xs ${note.tone === 'error' ? 'text-[#8A3B44]' : 'text-[#3d6b46]'}`} role="status">
                {note.msg}
              </p>
            )}
          </form>

          <div className="space-y-3">
            {HOW_IT_WORKS.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="flex items-start gap-3 rounded-xl border border-[#e6dccb] bg-white p-4">
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#f3e9d8] text-[#8f6739]">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c5248]">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#8b8177]">{detail}</p>
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-[#e6dccb] bg-[#fdfbf7] p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5c5248]">
                <AtSign className="h-3.5 w-3.5 text-[#A4794A]" /> Keep it personal
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#8b8177]">
                Send in small handfuls — five or ten at a time — and put each person's name in the note. That is what
                makes a real-estate follow-up or a birthday card feel like it came from you, because it did.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SenderSettingsPanel;

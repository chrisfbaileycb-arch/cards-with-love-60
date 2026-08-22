import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CRM_SUBSCRIBE_URL } from '@/data/cardConfig';
import { Recipient } from '@/components/studio/DeliveryStep';
import CsvImport from '@/components/people/CsvImport';
import UpgradeNudge from '@/components/pricing/UpgradeNudge';
import { CakeSlice, Home, KeyRound, Loader2, Trash2, UserPlus } from 'lucide-react';

type Person = Recipient & {
  birthday?: string | null;
  notes?: string | null;
  closing_date?: string | null;
  home_purchase_date?: string | null;
};

type Props = {
  recipients: Person[];
  reload: () => void;
  /** How many people this plan can save. */
  limit: number;
  isPro: boolean;
};

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const shortDate = (v?: string | null) =>
  v ? new Date(`${v}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;

const PeopleList: React.FC<Props> = ({ recipients, reload, limit, isPro }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    birthday: '',
    closing: '',
    purchased: ''
  });
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const atLimit = recipients.length >= limit;
  const remaining = Math.max(0, limit - recipients.length);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (atLimit) {
      setMessage(`Your plan saves ${limit} people. Upgrade to Local Agent for 50 slots.`);
      return;
    }
    if (!form.name.trim()) return setMessage('Please add a name.');
    if (!emailOk(form.email)) return setMessage('That email address does not look right.');

    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('card_recipients').insert({
        name: form.name.trim(),
        email: form.email.trim(),
        relationship: form.relationship.trim() || null,
        birthday: form.birthday || null,
        closing_date: isPro ? form.closing || null : null,
        home_purchase_date: isPro ? form.purchased || null : null
      });
      if (error) throw new Error(error.message);

      await fetch(CRM_SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          name: form.name.trim(),
          phone: form.phone.trim() || undefined,
          sms_opt_in: smsOptIn === true,
          source: 'people-list',
          tags: ['card-recipient', 'kindred-cards', form.relationship.trim() || 'family'].filter(Boolean)
        })
      });

      setForm({ name: '', email: '', phone: '', relationship: '', birthday: '', closing: '', purchased: '' });
      setMessage(`${form.name.trim()} is on your list.`);
      reload();
    } catch (err) {
      setMessage((err as Error).message || 'Could not save that person.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await supabase.from('card_recipients').delete().eq('id', id);
    reload();
  };

  const field = 'w-full rounded-lg border border-[#e0d5c2] px-3 py-2 text-sm outline-none focus:border-[#c9a273]';

  return (
    <section id="people" className="bg-[#FDFBF7] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A4794A]">Your people</span>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-[#2C2A29] sm:text-4xl">
              {isPro ? 'Your local CRM. Fifty people, all the key dates.' : 'A short list. The people who actually matter.'}
            </h2>
            <p className="mt-3 text-sm text-[#7c7266]">
              {isPro
                ? 'Birthdays, closing anniversaries and home purchase dates live right here, so the right card goes out on the right day.'
                : 'This is not a mailing list — it is your wife, your kids, your mom, a couple of favorite clients. Save their birthday and the studio will remind you.'}
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              atLimit ? 'bg-[#fdf3f3] text-[#8A3B44]' : 'bg-[#f3e9d8] text-[#8f6739]'
            }`}
          >
            {recipients.length} of {limit} saved
            {!atLimit && remaining <= 2 ? ` · ${remaining} left` : ''}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div>
            <form onSubmit={submit} className="rounded-3xl border border-[#e6dccb] bg-white p-6 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#2C2A29]">
                <UserPlus className="h-4 w-4 text-[#A4794A]" /> Add someone
              </p>
              <div className="mt-4 space-y-3">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Name"
                  className={field}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email address"
                  className={field}
                />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone number (optional)"
                  className={field}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.relationship}
                    onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                    placeholder="Wife, Mom, Client…"
                    className={field}
                  />
                  <input
                    type="date"
                    value={form.birthday}
                    onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                    className={`${field} text-[#5c5248]`}
                  />
                </div>

                {isPro ? (
                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#eee5d8] bg-[#fdfbf7] p-3">
                    <label className="block">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a9084]">
                        Closing date
                      </span>
                      <input
                        type="date"
                        value={form.closing}
                        onChange={(e) => setForm({ ...form, closing: e.target.value })}
                        className={`${field} mt-1 text-[#5c5248]`}
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a9084]">
                        Home purchased
                      </span>
                      <input
                        type="date"
                        value={form.purchased}
                        onChange={(e) => setForm({ ...form, purchased: e.target.value })}
                        className={`${field} mt-1 text-[#5c5248]`}
                      />
                    </label>
                  </div>
                ) : (
                  <UpgradeNudge feature="expanded-crm" />
                )}

                <label className="flex items-start gap-2 text-[11px] text-[#7c7266]">
                  <input
                    type="checkbox"
                    checked={smsOptIn}
                    onChange={(e) => setSmsOptIn(e.target.checked)}
                    className="mt-0.5 accent-[#A4794A]"
                  />
                  <span>Text me updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={saving || atLimit}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2C2A29] px-5 py-3 text-sm font-semibold text-[#FDFBF7] transition hover:bg-[#413d3a] disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {atLimit ? `Plan limit of ${limit} reached` : saving ? 'Saving…' : 'Add to my list'}
              </button>
              {message && <p className="mt-3 text-xs text-[#7c7266]">{message}</p>}
            </form>
            {atLimit && !isPro && <UpgradeNudge feature="expanded-crm" className="mt-4" />}
          </div>

          <div className="rounded-3xl border border-[#e6dccb] bg-white p-2 shadow-sm">
            {recipients.length === 0 ? (
              <p className="p-8 text-center text-sm text-[#8b8177]">
                Nobody here yet. Add the first person and their card queue appears below.
              </p>
            ) : (
              <ul className="divide-y divide-[#f0e8da]">
                {recipients.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e9d8] font-serif text-sm text-[#8f6739]">
                        {r.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#2C2A29]">{r.name}</p>
                        <p className="text-xs text-[#8b8177]">
                          {r.email}
                          {r.relationship ? ` · ${r.relationship}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.birthday && (
                        <span className="hidden items-center gap-1 rounded-full bg-[#fdf4e8] px-3 py-1 text-[11px] text-[#8f6739] sm:inline-flex">
                          <CakeSlice className="h-3 w-3" />
                          {shortDate(r.birthday)}
                        </span>
                      )}
                      {isPro && r.closing_date && (
                        <span className="hidden items-center gap-1 rounded-full bg-[#e7f0e4] px-3 py-1 text-[11px] text-[#3d6b46] sm:inline-flex">
                          <KeyRound className="h-3 w-3" />
                          {shortDate(r.closing_date)}
                        </span>
                      )}
                      {isPro && r.home_purchase_date && (
                        <span className="hidden items-center gap-1 rounded-full bg-[#eef2f7] px-3 py-1 text-[11px] text-[#2E4657] sm:inline-flex">
                          <Home className="h-3 w-3" />
                          {shortDate(r.home_purchase_date)}
                        </span>
                      )}
                      <button
                        onClick={() => remove(r.id)}
                        aria-label={`Remove ${r.name}`}
                        className="rounded-full border border-[#eddede] p-2 text-[#a05a5a] transition hover:bg-[#fdf3f3]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-8">
          <CsvImport
            existingEmails={recipients.map((r) => r.email)}
            reload={reload}
            isPro={isPro}
            slotsLeft={remaining}
          />
        </div>
      </div>
    </section>
  );
};

export default PeopleList;

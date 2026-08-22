import React, { useCallback, useEffect, useRef, useState } from 'react';
import PhotoStep from './PhotoStep';
import MessageStep from './MessageStep';
import DeliveryStep, { Recipient } from './DeliveryStep';
import CardPreview from './CardPreview';
import { CardBrand, CardDraft, canvasToPng, copyCanvasToClipboard } from '@/lib/cardRender';
import {
  composeCardBody,
  downloadDataUrl,
  downloadSendReminder,
  openCardInGmail,
  renderLayoutPng,
  sendCardFromMyEmail
} from '@/lib/cardExport';
import { saveCardToLibrary } from '@/lib/cardLibrary';
import { getLayout } from '@/data/cardConfig';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, CircleAlert } from 'lucide-react';

type Props = {
  recipients: Recipient[];
  draft: CardDraft;
  setDraft: React.Dispatch<React.SetStateAction<CardDraft>>;
  onQueueChanged: () => void;
  onRecipientsChanged: () => void;
  onLibraryChanged: () => void;
  footerNote?: string | null;
  /** Local Agent branding — null on the free plan. */
  brand?: CardBrand | null;
};

const STEPS = ['Photo', 'Message', 'Delivery'];

const CardStudio: React.FC<Props> = ({
  recipients,
  draft,
  setDraft,
  onQueueChanged,
  onRecipientsChanged,
  onLibraryChanged,
  footerNote,
  brand
}) => {

  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scheduling, setScheduling] = useState(false);
  const [savingLibrary, setSavingLibrary] = useState(false);
  const [exportingLayout, setExportingLayout] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'error' } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const notify = useCallback((msg: string, tone: 'ok' | 'error' = 'ok') => {
    setToast({ msg, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5200);
    return () => clearTimeout(t);
  }, [toast]);

  const update = useCallback(
    (patch: Partial<CardDraft>) => {
      setDraft((prev) => ({ ...prev, ...patch }));
    },
    [setDraft]
  );

  const toggleRecipient = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const slug = () =>
    draft.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'kindred';


  const handleExport = async (layoutId: string) => {
    setExportingLayout(layoutId);
    try {
      const layout = getLayout(layoutId);
      const png = await renderLayoutPng(draft, layoutId, brand);
      downloadDataUrl(png, `${slug()}-${layout.filename}.png`);
      notify(`${layout.name} saved to your downloads — ready to post or attach.`);
    } catch {
      notify('Could not build that size. Try again.', 'error');
    } finally {
      setExportingLayout(null);
    }
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    const ok = await copyCanvasToClipboard(canvasRef.current);
    notify(
      ok
        ? 'Card image copied. Paste it straight into an email or post.'
        : 'Your browser blocked copying — use a download instead.',
      ok ? 'ok' : 'error'
    );
  };

  const handleSendFromMyEmail = async (subject: string) => {
    const chosen = recipients.filter((r) => selectedIds.includes(r.id));
    setSending(true);
    try {
      const png = await renderLayoutPng(draft, 'card', brand);

      const outcome = await sendCardFromMyEmail({
        dataUrl: png,
        to: chosen.map((r) => r.email).join(','),
        subject,
        body: composeCardBody(draft, footerNote),
        filename: `${slug()}-card.png`
      });
      if (outcome === 'shared') notify('Handed to your share sheet with the card attached.');
      else if (outcome === 'mail-with-copy')
        notify('Draft opened in your mail app — the card is on your clipboard, just paste it in.');
      else notify('Draft opened in your mail app — the card PNG is in your downloads, attach it and send.');
    } catch {
      notify('Could not prepare that send. Try the download instead.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleScheduleInGmail = async (subject: string) => {
    const chosen = recipients.filter((r) => selectedIds.includes(r.id));
    if (!chosen.length) return notify('Pick at least one person first.', 'error');
    setSending(true);
    try {
      const png = await renderLayoutPng(draft, 'card', brand);
      openCardInGmail({
        dataUrl: png,
        to: chosen.map((r) => r.email).join(','),
        subject,
        body: composeCardBody(draft, footerNote),
        filename: `${slug()}-card.png`
      });
      notify('PNG downloaded and Gmail opened. Attach it, then choose Gmail’s Schedule send.');
    } catch {
      notify('Could not prepare the Gmail draft. Try the regular download instead.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!canvasRef.current) return;
    setSavingLibrary(true);
    try {
      await saveCardToLibrary({ draft, renderedPng: canvasToPng(canvasRef.current) });
      notify('Saved to your card library — you can reopen or resend it any time.');
      onLibraryChanged();
    } catch (err) {
      notify((err as Error).message || 'Could not save that card.', 'error');
    } finally {
      setSavingLibrary(false);
    }
  };

  const handleSchedule = async ({
    subject,
    sendAt,
    repeatRule
  }: {
    subject: string;
    sendAt: string;
    repeatRule: string;
  }) => {
    if (!canvasRef.current) return;
    setScheduling(true);
    try {
      const { id: cardId, imageUrl } = await saveCardToLibrary({
        draft,
        renderedPng: canvasToPng(canvasRef.current)
      });

      const chosen = recipients.filter((r) => selectedIds.includes(r.id));
      const rows = chosen.map((r) => ({
        card_id: cardId,
        recipient_name: r.name,
        recipient_email: r.email,
        subject,
        message: composeCardBody(draft, footerNote),
        image_url: imageUrl,
        send_at: sendAt,
        status: 'scheduled',
        repeat_rule: repeatRule
      }));

      const { error: sendErr } = await supabase.from('card_sends').insert(rows);
      if (sendErr) throw new Error(sendErr.message);

      downloadSendReminder({
        recipientNames: chosen.map((r) => r.name).join(', '),
        recipientEmails: chosen.map((r) => r.email).join(', '),
        subject,
        sendAt,
        repeatRule,
        appUrl: `${window.location.origin}${window.location.pathname}#outbox`
      });

      notify(`Reminder saved for ${chosen.length} ${chosen.length === 1 ? 'person' : 'people'} and calendar event downloaded.`);
      onQueueChanged();
      onRecipientsChanged();
      onLibraryChanged();
    } catch (err) {
      notify((err as Error).message || 'Could not save that card.', 'error');
    } finally {
      setScheduling(false);
    }
  };


  return (
    <section id="studio" className="relative bg-[#F6F1E8] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A4794A]">The card studio</span>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-[#2C2A29] sm:text-4xl">
            Build the card once. Send it from your own inbox.
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-3xl border border-[#e6dccb] bg-white/80 p-5 shadow-[0_24px_60px_-40px_rgba(70,55,35,0.6)] sm:p-8">
            <div className="mb-6 flex flex-wrap gap-2">
              {STEPS.map((label, i) => (
                <button
                  key={label}
                  onClick={() => setStep(i)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                    step === i
                      ? 'bg-[#2C2A29] text-[#FDFBF7]'
                      : 'border border-[#e0d5c2] bg-[#fdfbf7] text-[#8b8177] hover:border-[#c9a273]'
                  }`}
                >
                  {i + 1}. {label}
                </button>
              ))}
            </div>

            {step === 0 && <PhotoStep draft={draft} update={update} notify={notify} />}
            {step === 1 && <MessageStep draft={draft} update={update} />}
            {step === 2 && (
              <DeliveryStep
                recipients={recipients}
                selectedIds={selectedIds}
                toggleRecipient={toggleRecipient}
                onSchedule={handleSchedule}
                onExport={handleExport}
                onCopy={handleCopy}
                onSendFromMyEmail={handleSendFromMyEmail}
                onScheduleInGmail={handleScheduleInGmail}
                onSaveToLibrary={handleSaveToLibrary}
                savingLibrary={savingLibrary}
                exportingLayout={exportingLayout}
                sending={sending}
                scheduling={scheduling}
                notify={notify}
              />
            )}


            <div className="mt-8 flex items-center justify-between border-t border-[#eee5d8] pt-5">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-full border border-[#e0d5c2] px-5 py-2 text-sm text-[#5c5248] transition hover:border-[#c9a273] disabled:opacity-40"
              >
                Back
              </button>
              <button
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={step === STEPS.length - 1}
                className="rounded-full bg-[#A4794A] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8f6739] disabled:opacity-40"
              >
                Next step
              </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <CardPreview draft={draft} canvasRef={canvasRef} brand={brand} />
            <p className="mt-4 text-center text-xs text-[#9a9084]">
              Live preview · 900 × 1200 static PNG{brand ? ' · branded footer on' : ''} · also exports 1:1, 9:16 and 16:9
            </p>
          </div>

        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4">
          <div
            className={`flex items-center gap-3 rounded-full px-5 py-3 text-sm shadow-lg ${
              toast.tone === 'ok' ? 'bg-[#2C2A29] text-[#FDFBF7]' : 'bg-[#8A3B44] text-white'
            }`}
          >
            {toast.tone === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
            {toast.msg}
          </div>
        </div>
      )}
    </section>
  );
};

export default CardStudio;

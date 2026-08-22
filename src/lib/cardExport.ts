import { getLayout, getTemplate } from '@/data/cardConfig';
import { CardBrand, CardDraft, canvasToPng, ensureFontsReady, renderCard } from '@/lib/cardRender';

/** Turns a data URL into a Blob so we can share, copy or upload it. */
export const dataUrlToBlob = (dataUrl: string) => {
  const [meta, b64] = dataUrl.split(',');
  const mime = /:(.*?);/.exec(meta)?.[1] ?? 'image/png';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};

/**
 * Renders the draft at any of the shared EXPORT_LAYOUTS sizes.
 * The card itself is always drawn by renderCard (one engine, one look) and then
 * matted onto the requested canvas so social sizes never crop the handwriting.
 * `brand` is only passed on the Local Agent plan (signature, logo, CTA link).
 */
export async function renderLayoutPng(
  draft: CardDraft,
  layoutId: string,
  brand?: CardBrand | null
): Promise<string> {
  await ensureFontsReady();
  const layout = getLayout(layoutId);
  const template = getTemplate(draft.templateId);

  const cardCanvas = document.createElement('canvas');
  await renderCard(cardCanvas, draft, brand);
  if (layout.id === 'card') return canvasToPng(cardCanvas);


  const out = document.createElement('canvas');
  out.width = layout.width;
  out.height = layout.height;
  const ctx = out.getContext('2d');
  if (!ctx) return canvasToPng(cardCanvas);

  // soft paper backdrop so the post reads as one piece of stationery
  const grad = ctx.createLinearGradient(0, 0, layout.width, layout.height);
  grad.addColorStop(0, template.paper);
  grad.addColorStop(1, template.mat);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, layout.width, layout.height);
  ctx.fillStyle = template.border;
  ctx.globalAlpha = 0.16;
  ctx.fillRect(0, layout.height - 14, layout.width, 14);
  ctx.globalAlpha = 1;

  const pad = Math.min(layout.width, layout.height) * layout.pad;
  const boxW = layout.width - pad * 2;
  const boxH = layout.height - pad * 2;
  const ratio = Math.min(boxW / cardCanvas.width, boxH / cardCanvas.height);
  const drawW = cardCanvas.width * ratio;
  const drawH = cardCanvas.height * ratio;
  const x = (layout.width - drawW) / 2;
  const y = (layout.height - drawH) / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(60, 45, 25, 0.28)';
  ctx.shadowBlur = Math.round(pad * 0.7);
  ctx.shadowOffsetY = Math.round(pad * 0.18);
  ctx.drawImage(cardCanvas, x, y, drawW, drawH);
  ctx.restore();

  return out.toDataURL('image/png');
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export async function copyDataUrlToClipboard(dataUrl: string) {
  try {
    const Ctor = window.ClipboardItem;
    if (!Ctor || !navigator.clipboard?.write) return false;
    await navigator.clipboard.write([new Ctor({ 'image/png': dataUrlToBlob(dataUrl) })]);
    return true;
  } catch {
    return false;
  }
}

export type SendOutcome = 'shared' | 'mail-with-copy' | 'mail-only';

type ShareNavigator = Navigator & {
  canShare?: (data?: ShareData) => boolean;
  share?: (data?: ShareData) => Promise<void>;
};

const escapeIcs = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

const icsUtc = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

/** Opens a prepared Gmail draft after downloading the PNG for attachment. Gmail owns the future send. */
export function openCardInGmail(opts: {
  dataUrl: string;
  to: string;
  subject: string;
  body: string;
  filename?: string;
}) {
  const { dataUrl, to, subject, body, filename = 'kindred-card.png' } = opts;
  downloadDataUrl(dataUrl, filename);
  const instructions = `${body}\n\nAttach the Kindred Card PNG that just downloaded. To send later in Gmail, use the arrow beside Send, choose Schedule send, then pick the date and time.`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(instructions)}`;
  window.open(gmailUrl, '_blank', 'noopener,noreferrer');
}

/** Downloads a standards-based calendar reminder; it reminds the user to send, it never sends email itself. */
export function downloadSendReminder(opts: {
  recipientNames: string;
  recipientEmails: string;
  subject: string;
  sendAt: string;
  appUrl?: string;
  repeatRule?: string;
}) {
  const start = new Date(opts.sendAt);
  const end = new Date(start.getTime() + 15 * 60_000);
  const recurrence: Record<string, string> = {
    weekly: 'RRULE:FREQ=WEEKLY',
    monthly: 'RRULE:FREQ=MONTHLY',
    yearly: 'RRULE:FREQ=YEARLY'
  };
  const description = [
    `Send the prepared Kindred Card to ${opts.recipientNames || opts.recipientEmails}.`,
    `Recipient: ${opts.recipientEmails}`,
    'Open Kindred Cards, find the card in your Send Calendar, and choose Send from my email.',
    opts.appUrl || window.location.href
  ].join('\n');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kindred Cards//Send Reminder//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}@kindred.cards`,
    `DTSTAMP:${icsUtc(new Date())}`,
    `DTSTART:${icsUtc(start)}`,
    `DTEND:${icsUtc(end)}`,
    `SUMMARY:${escapeIcs(`Send Kindred Card: ${opts.subject}`)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    recurrence[opts.repeatRule || 'once'] || '',
    'BEGIN:VALARM',
    'TRIGGER:-PT10M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Your Kindred Card is ready to send',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean);
  const blob = new Blob([`${lines.join('\r\n')}\r\n`], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'kindred-card-reminder.ics';
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Zero-API delivery: hand the PNG to whatever the person already uses.
 * 1. Native share sheet with the file attached (phones, iPad, Safari, Edge).
 * 2. Otherwise copy the PNG to the clipboard and open a pre-filled mailto: draft
 *    in their own mail app, so the card is sent from their real address.
 */
export async function sendCardFromMyEmail(opts: {
  dataUrl: string;
  to: string;
  subject: string;
  body: string;
  filename?: string;
}): Promise<SendOutcome> {
  const { dataUrl, to, subject, body, filename = 'kindred-card.png' } = opts;
  const blob = dataUrlToBlob(dataUrl);

  try {
    const file = new File([blob], filename, { type: 'image/png' });
    const nav = navigator as ShareNavigator;
    if (nav.canShare?.({ files: [file] }) && nav.share) {
      await nav.share({ files: [file], title: subject, text: `${body}\n\n${to ? `To: ${to}` : ''}`.trim() });
      return 'shared';
    }
  } catch {
    /* user dismissed the share sheet, or files are unsupported — fall through */
  }

  const copied = await copyDataUrlToClipboard(dataUrl);
  downloadDataUrl(dataUrl, filename);
  const mailBody = `${body}\n\n${
    copied
      ? '(The card image is on your clipboard — paste it right here before sending.)'
      : '(The card PNG just downloaded — attach it before sending.)'
  }`;
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(mailBody)}`;
  return copied ? 'mail-with-copy' : 'mail-only';
}

/** The plain-text note that travels with the card. */
export const composeCardBody = (draft: { headline: string; message: string; signature: string }, footer?: string | null) =>
  [draft.headline, draft.message, draft.signature, footer].filter((s) => s && String(s).trim()).join('\n\n');

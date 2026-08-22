import { BRAND, getFont, getStyle, getTemplate } from '@/data/cardConfig';
import { supabase } from '@/lib/supabase';


export type CardDraft = {
  title: string;
  templateId: string;
  styleId: string;
  fontId: string;
  inkColor: string;
  headline: string;
  message: string;
  signature: string;
  artwork: string | null; // data URL or remote URL
  artScale: number; // 0.6 - 1.2
  artOffsetY: number; // -60 .. 60 px in card space
  useAiArt: boolean;
};

export const CARD_W = 900;
export const CARD_H = 1200;

export const defaultDraft = (): CardDraft => {
  const t = getTemplate('classic-cream');
  return {
    title: 'A card for someone I love',
    templateId: t.id,
    styleId: 'carnival-sketch',
    fontId: t.fontId,
    inkColor: t.ink,
    headline: t.headline,
    message: t.defaultMessage,
    signature: 'Love always,',
    artwork: null,
    artScale: 1,
    artOffsetY: 0,
    useAiArt: false
  };
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:')) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });

const wrapLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  const out: string[] = [];
  text.split('\n').forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      out.push('');
      return;
    }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const test = `${line} ${words[i]}`;
      if (ctx.measureText(test).width > maxWidth) {
        out.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    out.push(line);
  });
  return out;
};

/** Paper grain so the card reads like real card stock rather than flat pixels. */
const drawGrain = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * CARD_W;
    const y = Math.random() * CARD_H;
    ctx.fillStyle = Math.random() > 0.5 ? '#000000' : '#ffffff';
    ctx.fillRect(x, y, 1.4, 1.4);
  }
  ctx.restore();
};

export async function ensureFontsReady() {
  const docFonts = typeof document !== 'undefined' ? (document as unknown as { fonts?: { load: (f: string) => Promise<unknown>; ready: Promise<unknown> } }).fonts : undefined;
  if (!docFonts) return;
  const families = [
    '400 48px "Caveat"',
    '400 48px "Gochi Hand"',
    '400 48px "Architects Daughter"',
    '400 48px "Dancing Script"',
    '400 48px "Great Vibes"',
    'italic 400 48px "Playfair Display"'
  ];
  try {
    await Promise.all(families.map((f) => docFonts.load(f)));
    await docFonts.ready;
  } catch {
    /* fonts are non-critical */
  }
}

/** Local Agent branding stamped under the card: signature line, agency logo and a CTA link. */
export type CardBrand = {
  footerNote?: string | null;
  logoUrl?: string | null;
  ctaLink?: string | null;
};

const hasBrand = (brand?: CardBrand | null) =>
  !!(brand && ((brand.footerNote ?? '').trim() || (brand.logoUrl ?? '').trim() || (brand.ctaLink ?? '').trim()));

export async function renderCard(canvas: HTMLCanvasElement, draft: CardDraft, brand?: CardBrand | null) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const template = getTemplate(draft.templateId);
  const font = getFont(draft.fontId);
  const style = getStyle(draft.styleId);

  canvas.width = CARD_W;
  canvas.height = CARD_H;

  // card stock
  ctx.fillStyle = template.paper;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  drawGrain(ctx);

  // outer keyline
  ctx.strokeStyle = template.border;
  ctx.lineWidth = 6;
  ctx.strokeRect(34, 34, CARD_W - 68, CARD_H - 68);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(52, 52, CARD_W - 104, CARD_H - 104);

  // art window
  const frameX = 96;
  const frameY = 118;
  const frameW = CARD_W - 192;
  const frameH = 620;
  ctx.fillStyle = template.mat;
  ctx.fillRect(frameX, frameY, frameW, frameH);

  if (draft.artwork) {
    try {
      const img = await loadImage(draft.artwork);
      ctx.save();
      ctx.beginPath();
      ctx.rect(frameX + 8, frameY + 8, frameW - 16, frameH - 16);
      ctx.clip();
      if (!draft.useAiArt) ctx.filter = style.cssFilter;

      const boxW = frameW - 16;
      const boxH = frameH - 16;
      const ratio = Math.max(boxW / img.width, boxH / img.height) * draft.artScale;
      const drawW = img.width * ratio;
      const drawH = img.height * ratio;
      ctx.drawImage(
        img,
        frameX + 8 + (boxW - drawW) / 2,
        frameY + 8 + (boxH - drawH) / 2 + draft.artOffsetY,
        drawW,
        drawH
      );
      ctx.restore();
    } catch {
      /* keep the empty mat if the art fails */
    }
  } else {
    ctx.fillStyle = '#EFE7DA';
    ctx.font = '400 34px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('your photo goes here', CARD_W / 2, frameY + frameH / 2);
  }

  ctx.strokeStyle = template.border;
  ctx.lineWidth = 3;
  ctx.strokeRect(frameX, frameY, frameW, frameH);

  // headline
  ctx.textAlign = 'center';
  ctx.fillStyle = draft.inkColor;
  const headlineSize = Math.round(64 * font.scale);
  ctx.font = `400 ${headlineSize}px ${font.family}`;
  if (draft.headline.trim()) ctx.fillText(draft.headline.trim(), CARD_W / 2, frameY + frameH + 92);

  // message
  const bodySize = Math.round(44 * font.scale);
  ctx.font = `400 ${bodySize}px ${font.family}`;
  const lines = wrapLines(ctx, draft.message, CARD_W - 240);
  let y = frameY + frameH + 170;
  const lineHeight = bodySize * 1.42;
  lines.slice(0, 6).forEach((line) => {
    ctx.fillText(line, CARD_W / 2, y);
    y += lineHeight;
  });

  const branded = hasBrand(brand);

  // signature
  if (draft.signature.trim()) {
    ctx.font = `400 ${Math.round(40 * font.scale)}px ${font.family}`;
    ctx.textAlign = 'right';
    ctx.fillText(draft.signature.trim(), CARD_W - 130, CARD_H - (branded ? 172 : 118));
  }

  if (branded) {
    // branded footer band: agency logo, signature line and CTA link
    const bandH = 104;
    const bandY = CARD_H - 52 - bandH;
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = template.mat;
    ctx.fillRect(56, bandY, CARD_W - 112, bandH);
    ctx.restore();
    ctx.strokeStyle = template.border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, bandY);
    ctx.lineTo(CARD_W - 80, bandY);
    ctx.stroke();

    let textLeft = 92;
    if (brand?.logoUrl && brand.logoUrl.trim()) {
      try {
        const logo = await loadImage(brand.logoUrl.trim());
        const scale = Math.min(62 / logo.height, 210 / logo.width);
        const lw = logo.width * scale;
        const lh = logo.height * scale;
        ctx.drawImage(logo, textLeft, bandY + (bandH - lh) / 2, lw, lh);
        textLeft += lw + 22;
      } catch {
        /* logo is optional */
      }
    }

    ctx.textAlign = 'left';
    const note = (brand?.footerNote ?? '').trim();
    const cta = (brand?.ctaLink ?? '').trim();
    let ty = bandY + (cta && note ? 44 : 60);
    if (note) {
      ctx.fillStyle = draft.inkColor;
      ctx.font = '600 24px "Inter", sans-serif';
      ctx.fillText(note.slice(0, 58), textLeft, ty);
      ty += 34;
    }
    if (cta) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.font = '400 22px "Inter", sans-serif';
      ctx.fillText(cta.replace(/^https?:\/\//, '').slice(0, 58), textLeft, ty);
    }
  } else {
    // tiny embossed footer
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.font = '400 20px "Inter", sans-serif';
    ctx.fillText(BRAND.footerLine, CARD_W / 2, CARD_H - 62);
  }
}


export const canvasToPng = (canvas: HTMLCanvasElement) => canvas.toDataURL('image/png');

export function downloadCanvas(canvas: HTMLCanvasElement, filename = 'kindred-card.png') {
  const link = document.createElement('a');
  link.href = canvasToPng(canvas);
  link.download = filename;
  link.click();
}

const dataUrlToBlob = (dataUrl: string) => {
  const [meta, b64] = dataUrl.split(',');
  const mime = /:(.*?);/.exec(meta)?.[1] ?? 'image/png';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};

/** Uploads the finished card to public storage so it can be emailed inline. */
export async function uploadCardImage(dataUrl: string): Promise<string | null> {
  try {
    const blob = dataUrlToBlob(dataUrl);
    const path = `cards/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const { error } = await supabase.storage.from('cards').upload(path, blob, {
      contentType: 'image/png',
      upsert: true
    });
    if (error) return null;
    const { data } = supabase.storage.from('cards').getPublicUrl(path);
    return data?.publicUrl ?? null;
  } catch {
    return null;
  }
}

export async function copyCanvasToClipboard(canvas: HTMLCanvasElement) {
  try {
    const blob = dataUrlToBlob(canvasToPng(canvas));
    const win = window as unknown as { ClipboardItem?: new (items: Record<string, Blob>) => unknown };
    const Ctor = win.ClipboardItem;
    const nav = navigator as unknown as { clipboard?: { write?: (data: unknown[]) => Promise<void> } };
    if (!Ctor || !nav.clipboard?.write) return false;
    await nav.clipboard.write([new Ctor({ 'image/png': blob })]);
    return true;

  } catch {
    return false;
  }
}

export const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.readAsDataURL(file);
  });

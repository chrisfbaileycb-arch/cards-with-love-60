// Single source of truth for reading/writing rows in the `cards` table and
// converting them back into a studio draft. Used by the studio (save),
// the card library (list / duplicate / delete) and batch outreach.

import { supabase } from '@/lib/supabase';
import { CardDraft, defaultDraft, uploadCardImage } from '@/lib/cardRender';

export type CardRow = {
  id: string;
  title: string;
  occasion: string;
  template_id: string;
  filter_id: string;
  font_id: string;
  text_color: string;
  headline: string | null;
  message: string;
  signature: string | null;
  image_url: string | null;
  artwork_url: string | null;
  art_scale: number | string | null;
  art_offset_y: number | null;
  created_at: string;
};

export const CARD_COLUMNS =
  'id,title,occasion,template_id,filter_id,font_id,text_color,headline,message,signature,image_url,artwork_url,art_scale,art_offset_y,created_at';

export async function fetchCards(limit = 60): Promise<CardRow[]> {
  const { data } = await supabase
    .from('cards')
    .select(CARD_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data as CardRow[]) ?? [];
}

/** Rebuilds a full studio draft from a saved card row. */
export function rowToDraft(row: CardRow): CardDraft {
  const base = defaultDraft();
  return {
    ...base,
    title: row.title || base.title,
    templateId: row.template_id || base.templateId,
    styleId: row.filter_id || base.styleId,
    fontId: row.font_id || base.fontId,
    inkColor: row.text_color || base.inkColor,
    headline: row.headline || '',
    message: row.message || '',
    signature: row.signature || '',
    artwork: row.artwork_url || null,
    artScale: Number(row.art_scale ?? 1) || 1,
    artOffsetY: Number(row.art_offset_y ?? 0) || 0,
    // artwork restored from storage is already stylized-free; keep the filter on
    useAiArt: base.useAiArt
  };
}

/**
 * Saves the current draft as a library card. The rendered PNG is stored as the
 * thumbnail; the original photo is uploaded too so the card can be re-opened
 * and re-exported at any size later.
 */
export async function saveCardToLibrary(opts: {
  draft: CardDraft;
  renderedPng: string;
  senderName?: string | null;
  senderEmail?: string | null;
}): Promise<{ id: string; imageUrl: string | null }> {
  const { draft, renderedPng, senderName, senderEmail } = opts;
  const imageUrl = await uploadCardImage(renderedPng);

  let artworkUrl: string | null = draft.artwork ?? null;
  if (artworkUrl && artworkUrl.startsWith('data:')) {
    artworkUrl = await uploadCardImage(artworkUrl);
  }

  const { data, error } = await supabase
    .from('cards')
    .insert({
      title: draft.title || 'Untitled card',
      occasion: draft.headline || 'just-because',
      template_id: draft.templateId,
      filter_id: draft.styleId,
      message: draft.message,
      signature: draft.signature,
      font_id: draft.fontId,
      text_color: draft.inkColor,
      headline: draft.headline || '',
      image_url: imageUrl,
      artwork_url: artworkUrl,
      art_scale: draft.artScale,
      art_offset_y: Math.round(draft.artOffsetY),
      sender_name: senderName || null,
      sender_email: senderEmail || null
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return { id: (data as { id: string }).id, imageUrl };
}

export async function deleteCard(id: string) {
  const { error } = await supabase.from('cards').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export const formatCardDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

import { supabase } from '@/lib/supabase';
import { BRAND } from '@/data/cardConfig';

export type SenderSettings = {
  id?: string;
  from_name: string;
  from_email: string;
  reply_to: string | null;
  phone: string | null;
  sms_opt_in: boolean;
  footer_note: string | null;
  /** Local Agent branding */
  logo_url: string | null;
  cta_link: string | null;
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emptySettings = (): SenderSettings => ({
  from_name: '',
  from_email: '',
  reply_to: null,
  phone: null,
  sms_opt_in: true,
  footer_note: `Sent with love, straight from my inbox. — ${BRAND.short}`,
  logo_url: null,
  cta_link: null
});

const COLUMNS = 'id,from_name,from_email,reply_to,phone,sms_opt_in,footer_note,logo_url,cta_link';

export async function loadSenderSettings(): Promise<SenderSettings | null> {
  const { data } = await supabase
    .from('card_settings')
    .select(COLUMNS)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1);
  const row = (data as SenderSettings[] | null)?.[0];
  return row ?? null;
}

export async function saveSenderSettings(settings: SenderSettings): Promise<SenderSettings> {
  const payload = {
    from_name: settings.from_name.trim() || BRAND.short,
    from_email: settings.from_email.trim(),
    reply_to: settings.reply_to?.trim() || null,
    phone: settings.phone?.trim() || null,
    sms_opt_in: settings.sms_opt_in,
    footer_note: settings.footer_note?.trim() || null,
    logo_url: settings.logo_url?.trim() || null,
    cta_link: settings.cta_link?.trim() || null,
    is_active: true,
    updated_at: new Date().toISOString()
  };


  if (settings.id) {
    const { data, error } = await supabase
      .from('card_settings')
      .update(payload)
      .eq('id', settings.id)
      .select(COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return data as SenderSettings;
  }

  const { data, error } = await supabase.from('card_settings').insert(payload).select(COLUMNS).single();
  if (error) throw new Error(error.message);
  return data as SenderSettings;
}

/** Marks a queued send as sent by hand (the person just sent it from their own mail app). */
export async function markSendComplete(sendId: string) {
  const { error } = await supabase
    .from('card_sends')
    .update({ status: 'sent', delivered_at: new Date().toISOString(), error: null })
    .eq('id', sendId);
  if (error) throw new Error(error.message);
}

/** Pushes a queued send out by a number of days (snooze). */
export async function snoozeSend(sendId: string, currentSendAt: string, days = 1) {
  const base = new Date(currentSendAt);
  const next = new Date(Math.max(base.getTime(), Date.now()));
  next.setDate(next.getDate() + days);
  const { error } = await supabase
    .from('card_sends')
    .update({ send_at: next.toISOString(), status: 'scheduled' })
    .eq('id', sendId);
  if (error) throw new Error(error.message);
}

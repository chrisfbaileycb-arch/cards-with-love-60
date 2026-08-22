// AI credit state. The numbers here are DISPLAY ONLY — every limit is enforced
// server-side by the generate-caricature edge function and SECURITY DEFINER
// database functions. Editing anything in the browser cannot grant a credit.
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const AI_CONSENT_VERSION = 'ai-photo-v1';

export const AI_PHOTO_DISCLOSURE =
  'Creating an AI caricature sends this photo securely to our AI generation service. It is used to create your artwork and is not published by Kindred Cards.';

export type AiSummary = {
  authenticated: boolean;
  plan?: string;
  included_remaining?: number;
  included_credits?: number;
  purchased_credits?: number;
  total_remaining?: number;
  period_start?: string;
  period_end?: string;
  has_photo_consent?: boolean;
};

export async function fetchAiSummary(): Promise<AiSummary> {
  const { data, error } = await supabase.rpc('ai_account_summary');
  if (error) return { authenticated: false };
  return (data as AiSummary) ?? { authenticated: false };
}

export async function recordPhotoConsent(userId: string) {
  const { error } = await supabase
    .from('ai_photo_consent')
    .insert({ user_id: userId, consent_version: AI_CONSENT_VERSION });
  // A duplicate simply means consent was already recorded for this version.
  if (error && !`${error.message}`.toLowerCase().includes('duplicate')) throw new Error(error.message);
}

/** Reactive AI balance for the signed-in user. */
export function useAiCredits(userId: string | null) {
  const [summary, setSummary] = useState<AiSummary>({ authenticated: false });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setSummary({ authenticated: false });
      return;
    }
    setLoading(true);
    try {
      setSummary(await fetchAiSummary());
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { summary, loading, refresh, setSummary };
}

export const creditLabel = (n: number | undefined) => {
  const v = Math.max(n ?? 0, 0);
  return `${v} AI drawing${v === 1 ? '' : 's'} remaining`;
};

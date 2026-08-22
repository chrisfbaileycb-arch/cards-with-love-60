import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SiteHeader from '@/components/sections/SiteHeader';
import Hero from '@/components/sections/Hero';
import CardStudio from '@/components/studio/CardStudio';
import Gallery from '@/components/sections/Gallery';
import HowItWorks from '@/components/sections/HowItWorks';
import Faq from '@/components/sections/Faq';
import PeopleList from '@/components/people/PeopleList';
import CardLibrary from '@/components/library/CardLibrary';
import BatchOutreach from '@/components/batch/BatchOutreach';
import Outbox, { CardSend } from '@/components/outbox/Outbox';
import SenderSettingsPanel from '@/components/settings/SenderSettings';
import Pricing from '@/components/pricing/Pricing';
import SiteFooter from '@/components/sections/SiteFooter';
import { SenderSettings, loadSenderSettings } from '@/lib/senderSettings';
import { CardBrand, CardDraft, defaultDraft } from '@/lib/cardRender';
import { CardRow, fetchCards } from '@/lib/cardLibrary';
import { usePlan } from '@/lib/plan';
import { supabase } from '@/lib/supabase';

type PersonRow = {
  id: string;
  name: string;
  email: string;
  relationship?: string | null;
  birthday?: string | null;
  notes?: string | null;
  closing_date?: string | null;
  home_purchase_date?: string | null;
};

const SEND_COLUMNS =
  'id,recipient_name,recipient_email,subject,message,image_url,send_at,status,repeat_rule,error,delivered_at,attempts,last_attempt_at';

const AppLayout: React.FC = () => {
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [sends, setSends] = useState<CardSend[]>([]);
  const [loadingSends, setLoadingSends] = useState(true);
  const [settings, setSettings] = useState<SenderSettings | null>(null);
  const [cards, setCards] = useState<CardRow[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const { isPro, limit } = usePlan();
  // the studio draft lives here so the library and batch outreach share it
  const [draft, setDraft] = useState<CardDraft>(defaultDraft());

  const loadPeople = useCallback(async () => {
    const { data } = await supabase
      .from('card_recipients')
      .select('id,name,email,relationship,birthday,notes,closing_date,home_purchase_date')
      .order('created_at', { ascending: true });
    setPeople((data as PersonRow[]) ?? []);
  }, []);


  const loadSends = useCallback(async () => {
    setLoadingSends(true);
    const { data } = await supabase
      .from('card_sends')
      .select(SEND_COLUMNS)
      .order('send_at', { ascending: true })
      .limit(60);
    setSends((data as CardSend[]) ?? []);
    setLoadingSends(false);
  }, []);

  const loadCards = useCallback(async () => {
    setLoadingCards(true);
    setCards(await fetchCards());
    setLoadingCards(false);
  }, []);

  const loadSettings = useCallback(async () => {
    const saved = await loadSenderSettings();
    setSettings(saved);
  }, []);

  useEffect(() => {
    loadPeople();
    loadSends();
    loadCards();
    loadSettings();
  }, [loadPeople, loadSends, loadCards, loadSettings]);

  /** Library → studio: load a saved card back in as a fresh draft. */
  const openInStudio = useCallback((next: CardDraft) => {
    setDraft(next);
    const el = document.querySelector('#studio');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /** Branded footer only exists on the Local Agent plan. */
  const brand = useMemo<CardBrand | null>(() => {
    if (!isPro || !settings) return null;
    const b: CardBrand = {
      footerNote: settings.footer_note,
      logoUrl: settings.logo_url,
      ctaLink: settings.cta_link
    };
    return b.footerNote || b.logoUrl || b.ctaLink ? b : null;
  }, [isPro, settings]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#2C2A29]">
      <SiteHeader />
      <main>
        <Hero />
        <CardStudio
          recipients={people}
          draft={draft}
          setDraft={setDraft}
          onQueueChanged={loadSends}
          onRecipientsChanged={loadPeople}
          onLibraryChanged={loadCards}
          footerNote={settings?.footer_note ?? null}
          brand={brand}
        />
        <CardLibrary
          cards={cards}
          loading={loadingCards}
          recipients={people}
          reload={loadCards}
          onQueueChanged={loadSends}
          onOpenInStudio={openInStudio}
        />
        <Gallery />
        <HowItWorks />
        <PeopleList recipients={people} reload={loadPeople} limit={limit} isPro={isPro} />
        <BatchOutreach
          draft={draft}
          recipients={people}
          footerNote={settings?.footer_note ?? null}
          onQueueChanged={loadSends}
        />
        <Pricing />
        <SenderSettingsPanel settings={settings} reload={loadSettings} />
        <Outbox
          sends={sends}
          loading={loadingSends}
          reload={loadSends}
          footerNote={settings?.footer_note ?? null}
        />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
};

export default AppLayout;

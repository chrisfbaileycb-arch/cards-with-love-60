// Single source of truth for pricing, plan limits, AI credit quantities and Stripe ids.
//
// Kindred has TWO separate cost models and they must never be conflated:
//   1. AI artwork generation runs on a backend AI service and has a real provider cost,
//      so it is metered with plan credits that are enforced SERVER-SIDE.
//   2. Email delivery uses the customer's own email application, so PNG downloads,
//      mailto/Gmail handoffs, calendar reminders and the Outbox have no per-message cost
//      and stay unmetered.
//
// EVERY number below is PROVISIONAL and administrator-configurable. The authoritative
// copy also lives in the `app_pricing_config` database row (id: 'kindred-provisional-v1')
// so an administrator can edit it without a code change.

export type PlanId = 'free' | 'pro';
export type BillingCycle = 'monthly' | 'annual';

export const PRICING_IS_PROVISIONAL = true;

export const CONTACT_LIMITS: Record<PlanId, number> = {
  free: 5,
  pro: 50
};

/** AI generation credits. Enforced by the database + edge function, not the browser. */
export const AI_CREDITS = {
  free: { signupBonus: 3, monthlyIncluded: 1 },
  pro: { signupBonus: 40, monthlyIncluded: 40 }
} as const;

/** Optional top-up pack. Purchased credits are consumed AFTER monthly included credits. */
export const AI_CREDIT_PACK = {
  price: 4.99,
  credits: 20,
  note: 'Purchased credits stay available while the account is active.'
};

/**
 * Stripe identifiers are NOT configured yet. These are clearly labelled placeholders —
 * do not treat them as live ids. An administrator must create the products/prices in
 * Stripe and replace these values (and the matching app_pricing_config row).
 */
export const STRIPE_PLACEHOLDERS = {
  localAgentMonthly: 'REPLACE_ME_STRIPE_PRICE_LOCAL_AGENT_MONTHLY',
  localAgentAnnual: 'REPLACE_ME_STRIPE_PRICE_LOCAL_AGENT_ANNUAL',
  aiCreditPack20: 'REPLACE_ME_STRIPE_PRICE_AI_CREDIT_PACK_20'
};

/** Export layout ids that require the Pro / Local Agent plan. */
export const PRO_LAYOUT_IDS = ['square', 'story', 'wide'];

/** Feature flags used across the app. */
export type FeatureKey = 'social-exports' | 'branded-footer' | 'expanded-crm' | 'batch-outreach' | 'csv-import';

export const PRO_FEATURES: FeatureKey[] = [
  'social-exports',
  'branded-footer',
  'expanded-crm',
  'batch-outreach',
  'csv-import'
];

export type PlanDef = {
  id: PlanId;
  name: string;
  audience: string;
  monthly: number;
  annual: number;
  blurb: string;
  cta: string;
  highlight?: boolean;
  savingsNote?: string;
  features: { label: string; detail?: string; pro?: boolean }[];
};

export const PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Personal',
    audience: 'For family, friends and the people you actually call',
    monthly: 0,
    annual: 0,
    blurb: 'Everything you need to draw someone you love and send it from your own inbox.',
    cta: 'Use Personal — free forever',
    features: [
      {
        label: `${AI_CREDITS.free.signupBonus} AI caricature generations to start`,
        detail: `Then ${AI_CREDITS.free.monthlyIncluded} included AI generation each month. AI artwork generation may use plan credits.`
      },
      {
        label: 'Full photo-to-caricature studio',
        detail: 'Carnival Sketch, Soft Watercolor, Vintage Ink and every other style — filters are never metered.'
      },
      { label: 'Unlimited high-res PNG downloads', detail: '900 × 1200 keepsake card, every time, no cap.' },
      {
        label: 'Sent through your own email',
        detail: 'Native share sheet, mailto draft or Gmail compose — no email API key required.'
      },
      {
        label: 'Schedule using Gmail, or save a reminder',
        detail: 'Gmail’s own Schedule Send owns the timing, or download a calendar reminder back to your Outbox.'
      },
      {
        label: `Save up to ${CONTACT_LIMITS.free} family members or friends`,
        detail: 'Birthdays kept on your list so the studio can remind you.'
      },
      { label: 'Card library & send calendar', detail: 'Reopen any card you have made and schedule the next one.' }
    ]
  },
  {
    id: 'pro',
    name: 'Local Agent',
    audience: 'For agents, brokers and small local businesses',
    monthly: 9.99,
    annual: 79,
    highlight: true,
    savingsNote: 'Two months free on annual',
    blurb: 'Work a real pipeline of 40–50 people, then reuse the same card as organic social and local ad creative.',
    cta: 'Go Local Agent',
    features: [
      { label: 'Everything in Personal' },
      {
        label: `${AI_CREDITS.pro.monthlyIncluded} included AI generations per billing month`,
        detail: `Need more? An optional AI credit pack adds ${AI_CREDIT_PACK.credits} generations for $${AI_CREDIT_PACK.price}.`,
        pro: true
      },
      {
        label: `Expanded local CRM — up to ${CONTACT_LIMITS.pro} contacts`,
        detail: 'Birthdays, closing anniversaries and home purchase dates on every profile.',
        pro: true
      },
      {
        label: 'Social & ad exporters — 1:1 and 9:16',
        detail: 'One-click Facebook / Instagram square, TikTok & Reels vertical, plus a 16:9 banner.',
        pro: true
      },
      {
        label: 'Branded footers on every export',
        detail: 'Your signature line, agency logo and a CTA link overlaid on the card.',
        pro: true
      },
      {
        label: 'One-at-a-time personalized client workflow',
        detail: 'One personalized card per client with {{name}} merge — never a blast.',
        pro: true
      },
      { label: 'CSV pipeline import', detail: 'Bring your whole sphere in from a spreadsheet in one go.', pro: true }
    ]
  }
];

export const getPlanDef = (id: PlanId) => PLANS.find((p) => p.id === id) ?? PLANS[0];

export const priceLabel = (plan: PlanDef, cycle: BillingCycle) => {
  if (plan.monthly === 0) return { amount: '$0', per: 'forever' };
  return cycle === 'annual'
    ? { amount: `$${plan.annual}`, per: '/ year' }
    : { amount: `$${plan.monthly.toFixed(2)}`, per: '/ month' };
};

/** Friendly copy shown whenever a Pro-only control is used on the free plan. */
export const LOCKED_COPY: Record<FeatureKey, { title: string; detail: string }> = {
  'social-exports': {
    title: 'Social & ad sizes are a Local Agent feature',
    detail:
      'Square (1:1) and vertical (9:16) exports turn your caricature into an organic post or a local ad creative. The full card PNG stays free and uncapped.'
  },
  'branded-footer': {
    title: 'Branded footers are a Local Agent feature',
    detail: 'Add your signature, agency logo and a CTA link to every card you export.'
  },
  'expanded-crm': {
    title: `Personal saves ${CONTACT_LIMITS.free} people`,
    detail: `Local Agent expands your local CRM to ${CONTACT_LIMITS.pro} contacts with closing anniversaries and home purchase dates.`
  },
  'batch-outreach': {
    title: 'Batch outreach is a Local Agent feature',
    detail: 'Merge each client’s first name into one personalized card at a time and work your pipeline in a sitting.'
  },
  'csv-import': {
    title: 'CSV import is a Local Agent feature',
    detail: 'Bring 40 contacts in from a spreadsheet instead of typing them one by one.'
  }
};

export const PRICING_FAQ = [
  {
    q: 'Why is there no per-email delivery cost?',
    a: 'Kindred does not automatically send email. Finished cards are handed to your own mail app, so there is no email sending service and no per-message delivery charge. No email API key required.'
  },
  {
    q: 'Why are AI drawings limited?',
    a: `Drawing a caricature runs on a real AI generation service that costs money per image, so it is metered with credits. Personal starts with ${AI_CREDITS.free.signupBonus} generations and includes ${AI_CREDITS.free.monthlyIncluded} per month; Local Agent includes ${AI_CREDITS.pro.monthlyIncluded} per billing month. An optional pack adds ${AI_CREDIT_PACK.credits} generations for $${AI_CREDIT_PACK.price}. Included credits are used before purchased ones.`
  },
  {
    q: 'What happens when my AI credits run out?',
    a: 'Only new AI drawings pause. Original-photo cards, style filters, artwork you already generated, editing, PNG downloads, sharing, Gmail scheduling, calendar reminders, your library and the Outbox all keep working.'
  },
  {
    q: 'What happens to my people if I cancel?',
    a: `Nothing is deleted. You keep viewing everyone on your list — you just go back to saving ${CONTACT_LIMITS.free} at a time and the 1:1 / 9:16 exporters lock.`
  }
];

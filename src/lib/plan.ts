// Client-side plan state. Kindred has no server billing hooks — the plan is stored
// locally (like the rest of the personal CRM) and every gate reads from here.
import { useCallback, useEffect, useState } from 'react';
import { BillingCycle, CONTACT_LIMITS, FeatureKey, PRO_FEATURES, PRO_LAYOUT_IDS, PlanId } from '@/data/plans';

const KEY = 'kindred.plan.v1';
const EVENT = 'kindred-plan-change';

export type PlanState = {
  id: PlanId;
  cycle: BillingCycle;
  activatedAt: string | null;
};

const fallback = (): PlanState => ({ id: 'free', cycle: 'monthly', activatedAt: null });

export function readPlan(): PlanState {
  if (typeof window === 'undefined') return fallback();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fallback();
    const parsed = JSON.parse(raw) as Partial<PlanState>;
    return {
      id: parsed.id === 'pro' ? 'pro' : 'free',
      cycle: parsed.cycle === 'annual' ? 'annual' : 'monthly',
      activatedAt: parsed.activatedAt ?? null
    };
  } catch {
    return fallback();
  }
}

export function writePlan(next: PlanState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private browsing — plan just resets next visit */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export const contactLimit = (isPro: boolean) => (isPro ? CONTACT_LIMITS.pro : CONTACT_LIMITS.free);
export const layoutLocked = (layoutId: string, isPro: boolean) => !isPro && PRO_LAYOUT_IDS.includes(layoutId);
export const featureLocked = (feature: FeatureKey, isPro: boolean) => !isPro && PRO_FEATURES.includes(feature);

/** Reactive plan hook — every component stays in sync through a window event. */
export function usePlan() {
  const [state, setState] = useState<PlanState>(() => readPlan());

  useEffect(() => {
    const sync = () => setState(readPlan());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const activate = useCallback((cycle: BillingCycle) => {
    writePlan({ id: 'pro', cycle, activatedAt: new Date().toISOString() });
  }, []);

  const downgrade = useCallback(() => {
    writePlan({ id: 'free', cycle: 'monthly', activatedAt: null });
  }, []);

  const isPro = state.id === 'pro';

  return {
    plan: state,
    isPro,
    limit: contactLimit(isPro),
    activate,
    downgrade,
    isLayoutLocked: (layoutId: string) => layoutLocked(layoutId, isPro),
    isFeatureLocked: (feature: FeatureKey) => featureLocked(feature, isPro)
  };
}

/** Scrolls to the pricing block — used by every locked control. */
export const goToPricing = () => {
  const el = document.querySelector('#pricing');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

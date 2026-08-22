// Shared merge-token helpers used by batch outreach and the studio preview.
// One place decides what {{name}} means so the card, subject and note always agree.

export const MERGE_TOKENS = [
  { token: '{{name}}', label: 'First name', hint: 'Dana' },
  { token: '{{fullname}}', label: 'Full name', hint: 'Dana Whitfield' },
  { token: '{{relationship}}', label: 'Relationship tag', hint: 'client' }
] as const;

export const firstNameOf = (full: string) => (full || '').trim().split(/\s+/)[0] || '';

export type MergeSubject = {
  name: string;
  email?: string;
  relationship?: string | null;
};

/** Replaces every supported merge token in a string for one person. */
export function applyTokens(text: string, person: MergeSubject): string {
  if (!text) return '';
  return text
    .replace(/\{\{\s*name\s*\}\}/gi, firstNameOf(person.name))
    .replace(/\{\{\s*fullname\s*\}\}/gi, (person.name || '').trim())
    .replace(/\{\{\s*first\s*\}\}/gi, firstNameOf(person.name))
    .replace(/\{\{\s*relationship\s*\}\}/gi, (person.relationship || '').trim());
}

export const hasTokens = (text: string) => /\{\{\s*\w+\s*\}\}/.test(text || '');

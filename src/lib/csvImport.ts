// Browser-side CSV parsing + validation for the People importer.
// Single source of truth for the expected columns and the sample template.

export const CSV_COLUMNS = ['name', 'email', 'relationship', 'birthday'] as const;

export const CSV_TEMPLATE = `name,email,relationship,birthday
Dana Whitfield,dana@example.com,client,1984-04-12
Marcus Reed,marcus.reed@example.com,client,1979-11-02
Aunt Jo,jo@example.com,family,1951-06-30
Priya Raman,priya@example.com,past client,1990-01-18
`;

export type ParsedRow = {
  /** stable row key for the preview table */
  key: string;
  line: number;
  name: string;
  email: string;
  relationship: string;
  birthday: string;
  /** blocking problems — row cannot be imported */
  errors: string[];
  /** non-blocking notes (already on your list, birthday ignored, …) */
  warnings: string[];
  duplicate: boolean;
};

export const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** Splits one CSV line, honoring double-quoted fields and escaped quotes. */
const splitLine = (line: string): string[] => {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
};

/** Accepts YYYY-MM-DD, MM/DD/YYYY or MM/DD and normalizes to a date string. */
const normalizeBirthday = (raw: string): { value: string; warning?: string } => {
  const v = raw.trim();
  if (!v) return { value: '' };
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return { value: v };
  const us = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/.exec(v);
  if (us) {
    const year = us[3] ? (us[3].length === 2 ? `19${us[3]}` : us[3]) : '1900';
    const mm = us[1].padStart(2, '0');
    const dd = us[2].padStart(2, '0');
    return { value: `${year}-${mm}-${dd}` };
  }
  const parsed = new Date(v);
  if (!Number.isNaN(parsed.getTime())) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return { value: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}` };
  }
  return { value: '', warning: 'Birthday not understood — imported without it.' };
};

/**
 * Parses a name,email,relationship,birthday CSV.
 * Header row is optional and column order is detected from it when present.
 */
export function parseRecipientsCsv(text: string, existingEmails: string[]): ParsedRow[] {
  const clean = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const lines = clean.split('\n').filter((l) => l.trim().length > 0);
  if (!lines.length) return [];

  const existing = new Set(existingEmails.map((e) => e.trim().toLowerCase()));
  const seen = new Set<string>();

  let order: number[] = [0, 1, 2, 3];
  let start = 0;
  const first = splitLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));
  const looksLikeHeader = first.includes('email') || first.includes('emailaddress');
  if (looksLikeHeader) {
    const idx = (names: string[]) => first.findIndex((h) => names.includes(h));
    order = [
      idx(['name', 'fullname', 'firstname', 'contact']),
      idx(['email', 'emailaddress', 'mail']),
      idx(['relationship', 'relation', 'tag', 'group', 'type']),
      idx(['birthday', 'birthdate', 'dob', 'bday'])
    ];
    start = 1;
  }

  const rows: ParsedRow[] = [];
  for (let i = start; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    const pick = (slot: number) => (order[slot] >= 0 ? cells[order[slot]] ?? '' : '');
    const name = pick(0);
    const email = pick(1).toLowerCase();
    const relationship = pick(2);
    const bday = normalizeBirthday(pick(3));

    const errors: string[] = [];
    const warnings: string[] = [];
    if (!email) errors.push('Missing email address.');
    else if (!emailOk(email)) errors.push('That email address is not valid.');
    if (!name) warnings.push('No name — the email will be used instead.');
    if (bday.warning) warnings.push(bday.warning);

    const duplicate = !!email && (existing.has(email) || seen.has(email));
    if (email && seen.has(email)) warnings.push('Repeated inside this file.');
    else if (duplicate) warnings.push('Already on your people list.');
    if (email) seen.add(email);

    rows.push({
      key: `${i}-${email || 'blank'}`,
      line: i + 1,
      name: name || email,
      email,
      relationship,
      birthday: bday.value,
      errors,
      warnings,
      duplicate
    });
  }
  return rows;
}

export function downloadCsvTemplate(filename = 'kindred-people-template.csv') {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

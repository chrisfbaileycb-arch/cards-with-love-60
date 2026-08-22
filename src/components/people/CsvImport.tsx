import React, { useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CRM_SUBSCRIBE_URL } from '@/data/cardConfig';
import { ParsedRow, downloadCsvTemplate, parseRecipientsCsv } from '@/lib/csvImport';
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X
} from 'lucide-react';

type Props = {
  existingEmails: string[];
  reload: () => void;
  /** Local Agent unlocks CSV import; free plan can still import up to its slots. */
  isPro?: boolean;
  /** How many contact slots are left on this plan. */
  slotsLeft?: number;
};

const CsvImport: React.FC<Props> = ({ existingEmails, reload, isPro = false, slotsLeft = 5 }) => {

  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [chosen, setChosen] = useState<Record<string, boolean>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ msg: string; tone: 'ok' | 'error' } | null>(null);
  const [smsOptIn, setSmsOptIn] = useState(true);

  const stats = useMemo(() => {
    const valid = rows.filter((r) => r.errors.length === 0);
    return {
      total: rows.length,
      invalid: rows.filter((r) => r.errors.length > 0).length,
      duplicates: rows.filter((r) => r.duplicate).length,
      selected: valid.filter((r) => chosen[r.key]).length
    };
  }, [rows, chosen]);

  const handleFile = async (file: File) => {
    setResult(null);
    setFileName(file.name);
    const text = await file.text();
    const parsed = parseRecipientsCsv(text, existingEmails);
    setRows(parsed);
    // default: everything valid and not already on the list
    const next: Record<string, boolean> = {};
    parsed.forEach((r) => {
      next[r.key] = r.errors.length === 0 && !r.duplicate;
    });
    setChosen(next);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const toggle = (row: ParsedRow) => {
    if (row.errors.length) return;
    setChosen((prev) => ({ ...prev, [row.key]: !prev[row.key] }));
  };

  const setAll = (value: boolean) => {
    const next: Record<string, boolean> = {};
    rows.forEach((r) => {
      next[r.key] = value && r.errors.length === 0;
    });
    setChosen(next);
  };

  const clear = () => {
    setRows([]);
    setChosen({});
    setFileName(null);
    setResult(null);
  };

  const runImport = async () => {
    const accepted = rows.filter((r) => r.errors.length === 0 && chosen[r.key]);
    if (!accepted.length) {
      setResult({ msg: 'Pick at least one row to import.', tone: 'error' });
      return;
    }
    if (accepted.length > slotsLeft) {
      setResult({
        msg: isPro
          ? `You have ${slotsLeft} contact ${slotsLeft === 1 ? 'slot' : 'slots'} left on Local Agent. Deselect a few rows.`
          : `Personal saves 5 people (${slotsLeft} ${slotsLeft === 1 ? 'slot' : 'slots'} left). Upgrade to Local Agent for 50, or deselect some rows.`,
        tone: 'error'
      });
      return;
    }
    setImporting(true);
    setResult(null);
    try {

      const { error } = await supabase.from('card_recipients').insert(
        accepted.map((r) => ({
          name: r.name,
          email: r.email,
          relationship: r.relationship || null,
          birthday: r.birthday || null
        }))
      );
      if (error) throw new Error(error.message);

      // Every imported person also goes to the CRM contact list.
      await Promise.all(
        accepted.map((r) =>
          fetch(CRM_SUBSCRIBE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: r.email,
              name: r.name || undefined,
              sms_opt_in: smsOptIn === true,
              source: 'people-csv-import',
              tags: ['card-recipient', 'kindred-cards', 'csv-import', r.relationship || 'unsorted'].filter(Boolean)
            })
          }).catch(() => null)
        )
      );

      setResult({
        msg: `Imported ${accepted.length} ${accepted.length === 1 ? 'person' : 'people'} and added them to your contacts.`,
        tone: 'ok'
      });
      setRows([]);
      setChosen({});
      setFileName(null);
      reload();
    } catch (err) {
      setResult({ msg: (err as Error).message || 'Could not import that file.', tone: 'error' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#e6dccb] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#2C2A29]">
            <FileSpreadsheet className="h-4 w-4 text-[#A4794A]" /> Import a list from CSV
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#8b8177]">
            Four columns: <span className="font-medium text-[#5c5248]">name, email, relationship, birthday</span>. Nothing
            is saved until you review the preview below.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => downloadCsvTemplate()}
            className="inline-flex items-center gap-2 rounded-full border border-[#d9cbb6] px-4 py-2 text-xs font-medium text-[#5c5248] transition hover:border-[#c9a273]"
          >
            <Download className="h-3.5 w-3.5" /> Sample template
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-[#2C2A29] px-4 py-2 text-xs font-semibold text-[#FDFBF7] transition hover:bg-[#413d3a]"
          >
            <Upload className="h-3.5 w-3.5" /> Choose CSV file
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onPick} className="hidden" />
        </div>
      </div>

      {result && (
        <p
          className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${
            result.tone === 'ok' ? 'bg-[#eef4ea] text-[#3d6b46]' : 'bg-[#fdf3f3] text-[#8A3B44]'
          }`}
        >
          {result.tone === 'ok' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}
          {result.msg}
        </p>
      )}

      {rows.length > 0 && (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e8da] pb-3">
            <div className="text-xs text-[#5c5248]">
              <span className="font-semibold">{fileName}</span> · {stats.total} rows ·{' '}
              <span className="text-[#3d6b46]">{stats.selected} selected</span>
              {stats.invalid > 0 && <span className="text-[#8A3B44]"> · {stats.invalid} invalid</span>}
              {stats.duplicates > 0 && <span className="text-[#8f6739]"> · {stats.duplicates} already on your list</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAll(true)}
                className="rounded-full border border-[#e0d5c2] px-3 py-1.5 text-[11px] text-[#5c5248] transition hover:border-[#c9a273]"
              >
                Select all valid
              </button>
              <button
                onClick={() => setAll(false)}
                className="rounded-full border border-[#e0d5c2] px-3 py-1.5 text-[11px] text-[#5c5248] transition hover:border-[#c9a273]"
              >
                Deselect all
              </button>
              <button
                onClick={clear}
                aria-label="Discard this file"
                className="rounded-full border border-[#eddede] p-1.5 text-[#a05a5a] transition hover:bg-[#fdf3f3]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white text-[10px] uppercase tracking-wide text-[#a49a8d]">
                <tr>
                  <th className="w-10 py-2">Use</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="hidden py-2 sm:table-cell">Relationship</th>
                  <th className="hidden py-2 sm:table-cell">Birthday</th>
                  <th className="py-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4ede1]">
                {rows.map((r) => {
                  const bad = r.errors.length > 0;
                  return (
                    <tr
                      key={r.key}
                      className={
                        bad ? 'bg-[#fdf5f5]' : r.duplicate ? 'bg-[#fdf8ef]' : chosen[r.key] ? '' : 'opacity-55'
                      }
                    >
                      <td className="py-2 align-top">
                        <input
                          type="checkbox"
                          disabled={bad}
                          checked={!!chosen[r.key]}
                          onChange={() => toggle(r)}
                          aria-label={`Import ${r.email || `row ${r.line}`}`}
                          className="accent-[#A4794A]"
                        />
                      </td>
                      <td className="py-2 align-top font-medium text-[#2C2A29]">{r.name || '—'}</td>
                      <td className="py-2 align-top text-[#5c5248]">{r.email || '—'}</td>
                      <td className="hidden py-2 align-top text-[#8b8177] sm:table-cell">{r.relationship || '—'}</td>
                      <td className="hidden py-2 align-top text-[#8b8177] sm:table-cell">{r.birthday || '—'}</td>
                      <td className="py-2 align-top">
                        {bad && (
                          <span className="inline-flex items-start gap-1 text-[11px] text-[#8A3B44]">
                            <CircleAlert className="mt-0.5 h-3 w-3 flex-none" />
                            {r.errors.join(' ')}
                          </span>
                        )}
                        {!bad && r.warnings.length > 0 && (
                          <span className="inline-flex items-start gap-1 text-[11px] text-[#8f6739]">
                            <AlertTriangle className="mt-0.5 h-3 w-3 flex-none" />
                            {r.warnings.join(' ')}
                          </span>
                        )}
                        {!bad && r.warnings.length === 0 && <span className="text-[11px] text-[#a49a8d]">Looks good</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <label className="mt-4 flex items-start gap-2 text-[11px] text-[#7c7266]">
            <input
              type="checkbox"
              checked={smsOptIn}
              onChange={(e) => setSmsOptIn(e.target.checked)}
              className="mt-0.5 accent-[#A4794A]"
            />
            <span>Text me updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
          </label>

          <button
            onClick={runImport}
            disabled={importing || stats.selected === 0}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#A4794A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8f6739] disabled:opacity-50"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? 'Importing…' : `Import ${stats.selected} ${stats.selected === 1 ? 'person' : 'people'}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default CsvImport;

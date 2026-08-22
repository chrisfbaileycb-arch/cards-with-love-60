import React, { useMemo, useState } from 'react';
import { format, isBefore, startOfToday, addDays, nextSaturday, nextMonday, isToday, isTomorrow, differenceInCalendarDays } from 'date-fns';
import { Calendar as CalendarIcon, Clock, CalendarClock, Check, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

type Props = {
  value: string; // ISO or YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  label?: string;
};

// Formats a date object to YYYY-MM-DDTHH:mm
function toInputFormat(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const DeliveryDatePicker: React.FC<Props> = ({
  value,
  onChange,
  className,
  id = 'delivery-date-picker',
  label = 'Send date & time'
}) => {
  const [open, setOpen] = useState(false);

  // Parse current value or fallback to tomorrow 8:00 AM
  const parsedDate = useMemo(() => {
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) {
        const fallback = new Date();
        fallback.setDate(fallback.getDate() + 1);
        fallback.setHours(8, 0, 0, 0);
        return fallback;
      }
      return d;
    } catch {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 1);
      fallback.setHours(8, 0, 0, 0);
      return fallback;
    }
  }, [value]);

  const today = useMemo(() => startOfToday(), []);

  // Time components
  const hours24 = parsedDate.getHours();
  const minutes = parsedDate.getMinutes();
  const isPM = hours24 >= 12;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  // Relative label
  const relativeBadge = useMemo(() => {
    if (isToday(parsedDate)) return 'Today';
    if (isTomorrow(parsedDate)) return 'Tomorrow';
    const diff = differenceInCalendarDays(parsedDate, today);
    if (diff > 0 && diff <= 14) return `In ${diff} days`;
    if (diff < 0) return 'Past date';
    return null;
  }, [parsedDate, today]);

  const updateDateOnly = (newDay: Date | undefined) => {
    if (!newDay) return;
    const next = new Date(newDay);
    next.setHours(parsedDate.getHours(), parsedDate.getMinutes(), 0, 0);
    onChange(toInputFormat(next));
  };

  const updateTime = (newHours24: number, newMinutes: number) => {
    const next = new Date(parsedDate);
    next.setHours(newHours24, newMinutes, 0, 0);
    onChange(toInputFormat(next));
  };

  const handleHourChange = (new12Hour: number) => {
    let new24 = new12Hour % 12;
    if (isPM) new24 += 12;
    updateTime(new24, minutes);
  };

  const handlePeriodChange = (pm: boolean) => {
    let new24 = hours12 % 12;
    if (pm) new24 += 12;
    updateTime(new24, minutes);
  };

  const handleMinuteChange = (newMin: number) => {
    updateTime(hours24, newMin);
  };

  // Quick preset handlers
  const applyPreset = (daysAhead: number, targetHour = 8, targetMin = 0) => {
    const target = addDays(today, daysAhead);
    target.setHours(targetHour, targetMin, 0, 0);
    onChange(toInputFormat(target));
  };

  const applyNextWeekend = () => {
    const target = nextSaturday(today);
    target.setHours(9, 0, 0, 0);
    onChange(toInputFormat(target));
  };

  const applyNextMonday = () => {
    const target = nextMonday(today);
    target.setHours(9, 0, 0, 0);
    onChange(toInputFormat(target));
  };

  const TIME_PRESETS = [
    { label: '8:00 AM', h: 8, m: 0 },
    { label: '10:00 AM', h: 10, m: 0 },
    { label: '12:00 PM', h: 12, m: 0 },
    { label: '2:00 PM', h: 14, m: 0 },
    { label: '6:00 PM', h: 18, m: 0 },
    { label: '8:00 PM', h: 20, m: 0 },
  ];

  const isPast = parsedDate.getTime() < Date.now() - 60_000;

  return (
    <div className={cn('space-y-1.5', className)} id={`${id}-container`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9084]">
          {label}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            aria-label="Select delivery date and time"
            className={cn(
              'group relative flex w-full items-center justify-between gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c9a273]',
              isPast
                ? 'border-[#f2c1c1] bg-[#fffafa] text-[#8A3B44]'
                : 'border-[#e0d5c2] hover:border-[#c9a273] text-[#2C2A29]'
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[#f8f3eb] text-[#8f6739] group-hover:bg-[#f2e7d5] transition-colors">
                <CalendarClock className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#2C2A29]">
                  {format(parsedDate, 'EEE, MMM d, yyyy')}
                  <span className="font-normal text-[#7c7266]"> at </span>
                  <span className="font-semibold text-[#8f6739]">{format(parsedDate, 'h:mm a')}</span>
                </p>
                {isPast && (
                  <p className="text-[11px] font-medium text-[#c04d4d]">
                    Please select a future date & time
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-none items-center gap-1.5">
              {relativeBadge && (
                <span className="rounded-full bg-[#f3e9d8] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8f6739]">
                  {relativeBadge}
                </span>
              )}
              <CalendarIcon className="h-4 w-4 text-[#a49a8d] group-hover:text-[#8f6739] transition-colors" />
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="z-50 w-auto max-w-[95vw] rounded-2xl border border-[#e6dccb] bg-[#FDFBF7] p-4 shadow-xl sm:p-5"
          id={`${id}-popover`}
        >
          <div className="space-y-4">
            {/* Quick shortcuts header */}
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9a9084]">
                <Sparkles className="h-3 w-3 text-[#A4794A]" /> Quick Presets
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset(1, 8, 0)}
                  className="rounded-full border border-[#e0d5c2] bg-white px-2.5 py-1 text-xs text-[#5c5248] transition hover:border-[#A4794A] hover:bg-[#faf6ef]"
                >
                  Tomorrow 8 AM
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(1, 14, 0)}
                  className="rounded-full border border-[#e0d5c2] bg-white px-2.5 py-1 text-xs text-[#5c5248] transition hover:border-[#A4794A] hover:bg-[#faf6ef]"
                >
                  Tomorrow 2 PM
                </button>
                <button
                  type="button"
                  onClick={applyNextWeekend}
                  className="rounded-full border border-[#e0d5c2] bg-white px-2.5 py-1 text-xs text-[#5c5248] transition hover:border-[#A4794A] hover:bg-[#faf6ef]"
                >
                  This Weekend (Sat 9 AM)
                </button>
                <button
                  type="button"
                  onClick={applyNextMonday}
                  className="rounded-full border border-[#e0d5c2] bg-white px-2.5 py-1 text-xs text-[#5c5248] transition hover:border-[#A4794A] hover:bg-[#faf6ef]"
                >
                  Next Mon (9 AM)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(7, 9, 0)}
                  className="rounded-full border border-[#e0d5c2] bg-white px-2.5 py-1 text-xs text-[#5c5248] transition hover:border-[#A4794A] hover:bg-[#faf6ef]"
                >
                  In 1 Week
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[auto_220px]">
              {/* Calendar picker */}
              <div className="rounded-xl border border-[#e0d5c2] bg-white p-1">
                <Calendar
                  mode="single"
                  selected={parsedDate}
                  onSelect={updateDateOnly}
                  disabled={(date) => isBefore(date, today)}
                  initialFocus
                  className="p-2"
                  classNames={{
                    day_selected:
                      'bg-[#A4794A] text-white hover:bg-[#8f6739] hover:text-white focus:bg-[#A4794A] focus:text-white rounded-md font-semibold',
                    day_today: 'border border-[#A4794A] text-[#A4794A] font-bold rounded-md',
                  }}
                />
              </div>

              {/* Time controls & quick times */}
              <div className="flex flex-col justify-between space-y-4 rounded-xl border border-[#e0d5c2] bg-white p-3.5">
                <div>
                  <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9a9084]">
                    <Clock className="h-3 w-3 text-[#A4794A]" /> Delivery Time
                  </p>

                  {/* Hour, Minute, AM/PM Pickers */}
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-[#e6dccb] bg-[#fdfbf7] p-2">
                    {/* Hour Select */}
                    <div className="flex flex-col items-center">
                      <select
                        aria-label="Hour"
                        value={hours12}
                        onChange={(e) => handleHourChange(Number(e.target.value))}
                        className="rounded-md border border-[#e0d5c2] bg-white px-1.5 py-1 text-center text-sm font-semibold text-[#2C2A29] outline-none focus:border-[#A4794A]"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <option key={h} value={h}>
                            {String(h).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <span className="mt-0.5 text-[9px] uppercase tracking-wider text-[#9a9084]">Hour</span>
                    </div>

                    <span className="pb-3 text-base font-bold text-[#8b8177]">:</span>

                    {/* Minute Select */}
                    <div className="flex flex-col items-center">
                      <select
                        aria-label="Minute"
                        value={minutes}
                        onChange={(e) => handleMinuteChange(Number(e.target.value))}
                        className="rounded-md border border-[#e0d5c2] bg-white px-1.5 py-1 text-center text-sm font-semibold text-[#2C2A29] outline-none focus:border-[#A4794A]"
                      >
                        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                          <option key={m} value={m}>
                            {String(m).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <span className="mt-0.5 text-[9px] uppercase tracking-wider text-[#9a9084]">Min</span>
                    </div>

                    {/* AM / PM Toggle */}
                    <div className="flex flex-col items-center">
                      <div className="flex rounded-md border border-[#e0d5c2] bg-white p-0.5">
                        <button
                          type="button"
                          onClick={() => handlePeriodChange(false)}
                          className={cn(
                            'rounded px-2 py-0.5 text-xs font-semibold transition',
                            !isPM ? 'bg-[#A4794A] text-white' : 'text-[#7c7266] hover:text-[#2C2A29]'
                          )}
                        >
                          AM
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePeriodChange(true)}
                          className={cn(
                            'rounded px-2 py-0.5 text-xs font-semibold transition',
                            isPM ? 'bg-[#A4794A] text-white' : 'text-[#7c7266] hover:text-[#2C2A29]'
                          )}
                        >
                          PM
                        </button>
                      </div>
                      <span className="mt-0.5 text-[9px] uppercase tracking-wider text-[#9a9084]">Period</span>
                    </div>
                  </div>

                  {/* Preset Time Buttons */}
                  <div className="mt-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a9084]">Common times</span>
                    <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                      {TIME_PRESETS.map((t) => {
                        const isSelected = hours24 === t.h && minutes === t.m;
                        return (
                          <button
                            key={t.label}
                            type="button"
                            onClick={() => updateTime(t.h, t.m)}
                            className={cn(
                              'flex items-center justify-between rounded-md border px-2 py-1 text-[11px] transition',
                              isSelected
                                ? 'border-[#A4794A] bg-[#f8f3eb] font-semibold text-[#8f6739]'
                                : 'border-[#e0d5c2] bg-white text-[#5c5248] hover:border-[#c9a273]'
                            )}
                          >
                            <span>{t.label}</span>
                            {isSelected && <Check className="h-3 w-3 text-[#A4794A]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Confirm button */}
                <button
                  type="button"
                  id={`${id}-confirm-btn`}
                  onClick={() => setOpen(false)}
                  className="w-full rounded-lg bg-[#2C2A29] py-2 text-center text-xs font-semibold text-[#FDFBF7] transition hover:bg-[#413d3a]"
                >
                  Confirm Date &amp; Time
                </button>
              </div>
            </div>

            {/* Bottom summary bar */}
            <div className="flex items-center justify-between border-t border-[#eee5d8] pt-3 text-xs text-[#7c7266]">
              <span className="flex items-center gap-1.5 font-medium text-[#2C2A29]">
                <CalendarClock className="h-3.5 w-3.5 text-[#A4794A]" />
                Scheduled for: {format(parsedDate, 'EEEE, MMMM d, yyyy')} at {format(parsedDate, 'h:mm a')}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-semibold text-[#A4794A] hover:underline"
              >
                Done
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DeliveryDatePicker;

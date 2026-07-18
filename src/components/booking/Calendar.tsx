'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarIcon } from '@/components/icons/TattooIcons';

type BusinessHour = {
  id: number;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function Calendar({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/availability');
        const data = await res.json();
        if (!cancelled) {
          if (Array.isArray(data?.businessHours)) setBusinessHours(data.businessHours);
          if (Array.isArray(data?.blockedDates)) setBlockedDates(data.blockedDates);
        }
      } catch {
        // keep permissive defaults (nothing closed) on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isUnavailable = (dateStr: string, dateObj: Date) => {
    if (blockedDates.includes(dateStr)) return true;
    const dow = dateObj.getDay();
    const rule = businessHours.find((h) => h.day_of_week === dow);
    return !!rule?.is_closed;
  };

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  const changeMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewYear(y);
    setViewMonth(m);
  };

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="glass-panel rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <button type="button" onClick={() => changeMonth(-1)} data-cursor-hover className="text-white/50 hover:text-gold-light px-2">‹</button>
        <p className="font-display text-lg flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gold-light" aria-hidden />
          {MONTH_NAMES[viewMonth]} {viewYear}
        </p>
        <button type="button" onClick={() => changeMonth(1)} data-cursor-hover className="text-white/50 hover:text-gold-light px-2">›</button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-[10px] uppercase tracking-wide text-white/40 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          if (d === null) return <span key={`empty-${i}`} />;
          const dateStr = toDateStr(viewYear, viewMonth, d);
          const dateObj = new Date(viewYear, viewMonth, d);
          const isPast = dateObj < startOfToday;
          const fullyBooked = isUnavailable(dateStr, dateObj);
          const isSelected = selected === dateStr;
          const disabled = isPast || fullyBooked;
          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(dateStr)}
              data-cursor-hover
              className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-all
                ${disabled ? 'text-white/15 cursor-not-allowed line-through' : 'text-white/80 hover:bg-gold/20 hover:text-gold-light'}
                ${isSelected ? 'bg-gold text-ink-black' : ''}
              `}
              title={fullyBooked ? 'Fully booked' : undefined}
            >
              {d}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-5 text-[11px] text-white/40">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white/15 inline-block" /> Fully booked / past</span>
      </div>
    </div>
  );
}

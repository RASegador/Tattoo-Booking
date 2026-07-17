'use client';

import { useCallback, useEffect, useState } from 'react';

type DayHours = {
  id?: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
};

type BlockedDate = {
  id: string;
  date: string;
  reason: string;
  created_at: string;
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminSchedulePage() {
  const [hours, setHours] = useState<DayHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [blockError, setBlockError] = useState('');

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/schedule', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setHours(data.hours || []);
      setBlockedDates(data.blockedDates || []);
    } catch {
      setError('Could not load schedule.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const updateRow = (day: number, patch: Partial<DayHours>) => {
    setHours((prev) => prev.map((h) => (h.day_of_week === day ? { ...h, ...patch } : h)));
  };

  const handleSaveHours = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hours: hours.map((h) => ({
            day_of_week: h.day_of_week,
            open_time: h.open_time,
            close_time: h.close_time,
            is_closed: h.is_closed,
          })),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setHours(data.hours || hours);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Could not save business hours.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockError('');
    if (!newDate) {
      setBlockError('Pick a date.');
      return;
    }
    try {
      const res = await fetch('/api/admin/blocked-dates', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, reason: newReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBlockError(data.error || 'Could not add blocked date.');
        return;
      }
      setBlockedDates((prev) => [...prev, data.blockedDate]);
      setNewDate('');
      setNewReason('');
    } catch {
      setBlockError('Network error.');
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blocked-dates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
      setBlockedDates((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setBlockError('Could not delete blocked date.');
    }
  };

  const sortedHours = [...hours].sort((a, b) => a.day_of_week - b.day_of_week);

  return (
    <section className="relative pb-10">
      <div className="mb-10">
        <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Studio Admin</p>
        <h1 className="font-display text-4xl md:text-5xl">
          Schedule <span className="text-gradient-gold">Management</span>
        </h1>
      </div>

      {error && (
        <div className="glass-panel rounded-xl p-6 border border-crimson/30 text-crimson-light text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel rounded-xl p-16 text-center border border-white/10">
          <p className="text-white/40 text-sm uppercase tracking-wide">Loading schedule...</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="glass-panel rounded-xl p-6 border border-white/10">
            <h2 className="font-display text-xl mb-6">
              Business <span className="text-gradient-gold">Hours</span>
            </h2>
            <div className="space-y-3">
              {sortedHours.map((h) => (
                <div
                  key={h.day_of_week}
                  className="grid grid-cols-2 md:grid-cols-[140px_1fr_1fr_auto] gap-3 items-center border border-white/10 rounded-lg p-3"
                >
                  <p className="text-sm font-display">{DAY_NAMES[h.day_of_week]}</p>
                  <input
                    type="text"
                    value={h.open_time}
                    disabled={h.is_closed}
                    onChange={(e) => updateRow(h.day_of_week, { open_time: e.target.value })}
                    placeholder="09:00"
                    className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none transition-colors disabled:opacity-30"
                  />
                  <input
                    type="text"
                    value={h.close_time}
                    disabled={h.is_closed}
                    onChange={(e) => updateRow(h.day_of_week, { close_time: e.target.value })}
                    placeholder="18:00"
                    className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none transition-colors disabled:opacity-30"
                  />
                  <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/50 cursor-pointer" data-cursor-hover>
                    <input
                      type="checkbox"
                      checked={h.is_closed}
                      onChange={(e) => updateRow(h.day_of_week, { is_closed: e.target.checked })}
                    />
                    Closed
                  </label>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={handleSaveHours}
                disabled={saving}
                data-cursor-hover
                className="px-6 py-3 bg-crimson hover:bg-crimson-light disabled:opacity-50 text-sm uppercase tracking-wide transition-colors rounded-lg"
              >
                {saving ? 'Saving...' : 'Save Hours'}
              </button>
              {saved && <span className="text-cyan text-xs uppercase tracking-wide">Saved</span>}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6 border border-white/10">
            <h2 className="font-display text-xl mb-6">
              Blocked <span className="text-gradient-gold">Dates</span>
            </h2>

            <form onSubmit={handleAddBlockedDate} className="flex flex-wrap gap-3 mb-6">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none transition-colors"
              />
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Reason (optional)"
                className="flex-1 min-w-[200px] bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none transition-colors"
              />
              <button
                type="submit"
                data-cursor-hover
                className="px-5 py-2.5 border border-gold text-gold text-xs uppercase tracking-wide hover:bg-gold hover:text-ink-black transition-all rounded-lg"
              >
                Add
              </button>
            </form>

            {blockError && <p className="text-crimson-light text-xs mb-4">{blockError}</p>}

            {blockedDates.length === 0 ? (
              <p className="text-white/40 text-sm">No blocked dates.</p>
            ) : (
              <div className="space-y-2">
                {blockedDates.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-3 border border-white/10 rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="text-sm">{d.date}</p>
                      {d.reason && <p className="text-xs text-white/40">{d.reason}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteBlockedDate(d.id)}
                      data-cursor-hover
                      className="px-3 py-1.5 text-xs uppercase border border-white/15 hover:border-crimson hover:text-crimson rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

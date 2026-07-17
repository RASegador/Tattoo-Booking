'use client';

import { useCallback, useEffect, useState } from 'react';

type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled';

type Booking = {
  id: string;
  booking_code: string;
  style: string;
  size: string;
  placement: string;
  reference_image_names: string[];
  description: string;
  date: string;
  time: string;
  full_name: string;
  mobile: string;
  email: string;
  notes: string;
  status: BookingStatus;
  admin_notes: string | null;
  estimated_duration: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_TABS: Array<BookingStatus | 'All'> = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'];

const STATUS_COLORS: Record<BookingStatus, string> = {
  Pending: 'text-gold border-gold/40 bg-gold/10',
  Confirmed: 'text-cyan border-cyan/40 bg-cyan/10',
  Completed: 'text-white/70 border-white/30 bg-white/10',
  Cancelled: 'text-crimson border-crimson/40 bg-crimson/10',
  Rescheduled: 'text-white border-white/40 bg-white/10',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'All'>('All');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [adminNotesDraft, setAdminNotesDraft] = useState<Record<string, string>>({});
  const [rescheduleDraft, setRescheduleDraft] = useState<Record<string, { date: string; time: string }>>({});
  const [rejectNoteDraft, setRejectNoteDraft] = useState<Record<string, string>>({});

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (query.trim()) params.set('q', query.trim());
      const res = await fetch(`/api/admin/bookings?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      setError('Could not load bookings.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, query]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const patchBooking = async (id: string, body: Record<string, unknown>) => {
    setRowError((e) => ({ ...e, [id]: '' }));
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setRowError((e) => ({ ...e, [id]: data.error || 'Update failed.' }));
        return false;
      }
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...data.booking } : b)));
      return true;
    } catch {
      setRowError((e) => ({ ...e, [id]: 'Network error.' }));
      return false;
    }
  };

  const handleConfirm = (id: string) => patchBooking(id, { status: 'Confirmed' });
  const handleComplete = (id: string) => patchBooking(id, { status: 'Completed' });

  const handleReject = async (id: string) => {
    const note = rejectNoteDraft[id];
    const ok = await patchBooking(id, { status: 'Cancelled', ...(note ? { admin_notes: note } : {}) });
    if (ok) setRejectNoteDraft((d) => ({ ...d, [id]: '' }));
  };

  const handleReschedule = async (id: string) => {
    const draft = rescheduleDraft[id];
    if (!draft || !draft.date || !draft.time) {
      setRowError((e) => ({ ...e, [id]: 'Pick a new date and time first.' }));
      return;
    }
    await patchBooking(id, { date: draft.date, time: draft.time, status: 'Rescheduled' });
  };

  const handleSaveNotes = async (id: string) => {
    const notes = adminNotesDraft[id];
    if (notes === undefined) return;
    await patchBooking(id, { admin_notes: notes });
  };

  return (
    <section className="relative pb-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Studio Admin</p>
          <h1 className="font-display text-4xl md:text-5xl">
            Booking <span className="text-gradient-gold">Requests</span>
          </h1>
        </div>
        <a
          href="/api/admin/bookings/export"
          download
          data-cursor-hover
          className="px-5 py-2.5 border border-gold text-gold text-xs uppercase tracking-wide hover:bg-gold hover:text-ink-black transition-all rounded-lg"
        >
          Export CSV
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            data-cursor-hover
            className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wide border transition-colors ${
              statusFilter === s
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-white/15 text-white/60 hover:border-white/40'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchBookings();
        }}
        className="mb-8 flex gap-2 max-w-md"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, code, mobile..."
          className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-sm focus:border-gold focus:outline-none transition-colors"
        />
        <button
          type="submit"
          data-cursor-hover
          className="px-4 py-2.5 border border-white/15 text-xs uppercase tracking-wide rounded-lg hover:border-gold hover:text-gold transition-colors"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="glass-panel rounded-xl p-6 border border-crimson/30 text-crimson-light text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel rounded-xl p-16 text-center border border-white/10">
          <p className="text-white/40 text-sm uppercase tracking-wide">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel rounded-xl p-16 text-center border border-white/10">
          <p className="text-white/50">No bookings match this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const expanded = expandedId === b.id;
            return (
              <div key={b.id} className="glass-panel rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : b.id)}
                  data-cursor-hover
                  className="w-full text-left p-6 grid md:grid-cols-[1fr_auto] gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-gold">{b.booking_code}</span>
                      <span className={`text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_COLORS[b.status]}`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="font-display text-lg">{b.full_name} — {b.style}</p>
                    <p className="text-sm text-white/50 mt-1">
                      {b.placement} · {b.size} · {b.date} at {b.time}
                    </p>
                    <p className="text-xs text-white/40 mt-2">{b.mobile}{b.email ? ` · ${b.email}` : ''}</p>
                  </div>
                  <div className="flex items-center text-white/30 text-xs uppercase tracking-wide">
                    {expanded ? 'Collapse' : 'Details'}
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-white/10 p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Description / Idea</p>
                        <p className="text-sm text-white/70">{b.description || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Reference Images</p>
                        {b.reference_image_names && b.reference_image_names.length > 0 ? (
                          <ul className="text-sm text-white/70 space-y-0.5">
                            {b.reference_image_names.map((name, i) => (
                              <li key={i}>{name}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-white/40">None provided</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Client Notes</p>
                        <p className="text-sm text-white/70">{b.notes || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Estimated Duration</p>
                        <p className="text-sm text-white/70">{b.estimated_duration || '—'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Admin Notes</p>
                      <textarea
                        defaultValue={b.admin_notes || ''}
                        onChange={(e) => setAdminNotesDraft((d) => ({ ...d, [b.id]: e.target.value }))}
                        onBlur={() => handleSaveNotes(b.id)}
                        rows={2}
                        className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
                        placeholder="Internal notes..."
                      />
                    </div>

                    {rowError[b.id] && <p className="text-crimson-light text-xs">{rowError[b.id]}</p>}

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleConfirm(b.id)}
                        data-cursor-hover
                        className="px-3 py-2 text-xs uppercase border border-white/15 hover:border-cyan hover:text-cyan rounded-lg transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleComplete(b.id)}
                        data-cursor-hover
                        className="px-3 py-2 text-xs uppercase border border-white/15 hover:border-white/50 rounded-lg transition-colors"
                      >
                        Complete
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border border-white/10 rounded-lg p-4">
                        <p className="text-xs uppercase tracking-wide text-white/40 mb-3">Reschedule</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <input
                            type="date"
                            value={rescheduleDraft[b.id]?.date || ''}
                            onChange={(e) =>
                              setRescheduleDraft((d) => ({
                                ...d,
                                [b.id]: { date: e.target.value, time: d[b.id]?.time || '' },
                              }))
                            }
                            className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none transition-colors"
                          />
                          <input
                            type="time"
                            value={rescheduleDraft[b.id]?.time || ''}
                            onChange={(e) =>
                              setRescheduleDraft((d) => ({
                                ...d,
                                [b.id]: { date: d[b.id]?.date || '', time: e.target.value },
                              }))
                            }
                            className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none transition-colors"
                          />
                        </div>
                        <button
                          onClick={() => handleReschedule(b.id)}
                          data-cursor-hover
                          className="px-3 py-2 text-xs uppercase border border-white/15 hover:border-gold hover:text-gold rounded-lg transition-colors"
                        >
                          Save Reschedule
                        </button>
                      </div>

                      <div className="border border-white/10 rounded-lg p-4">
                        <p className="text-xs uppercase tracking-wide text-white/40 mb-3">Reject</p>
                        <input
                          type="text"
                          value={rejectNoteDraft[b.id] || ''}
                          onChange={(e) => setRejectNoteDraft((d) => ({ ...d, [b.id]: e.target.value }))}
                          placeholder="Optional reason..."
                          className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none transition-colors mb-3"
                        />
                        <button
                          onClick={() => handleReject(b.id)}
                          data-cursor-hover
                          className="px-3 py-2 text-xs uppercase border border-white/15 hover:border-crimson hover:text-crimson rounded-lg transition-colors"
                        >
                          Reject / Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

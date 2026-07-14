'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Booking, BookingStatus, getBookings, updateBookingStatus } from '@/lib/bookings';

const STATUS_COLORS: Record<BookingStatus, string> = {
  Pending: 'text-gold border-gold/40 bg-gold/10',
  Confirmed: 'text-cyan border-cyan/40 bg-cyan/10',
  Completed: 'text-white/70 border-white/30 bg-white/10',
  Cancelled: 'text-crimson border-crimson/40 bg-crimson/10',
  Rescheduled: 'text-white border-white/40 bg-white/10',
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setBookings(getBookings());
    setMounted(true);
  }, []);

  const refresh = () => setBookings(getBookings());

  const setStatus = (id: string, status: BookingStatus) => {
    updateBookingStatus(id, status);
    refresh();
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'Pending').length,
    confirmed: bookings.filter((b) => b.status === 'Confirmed').length,
    completed: bookings.filter((b) => b.status === 'Completed').length,
  };

  return (
    <section className="relative min-h-screen pt-40 pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Studio Admin</p>
          <h1 className="font-display text-4xl md:text-5xl">
            Booking <span className="text-gradient-gold">Requests</span>
          </h1>
          <p className="text-white/50 mt-4 max-w-2xl text-sm">
            This demo view reads booking requests stored in this browser. Connect a database
            (Supabase/Firebase) to persist bookings across devices and power a full admin dashboard.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Bookings', value: stats.total },
            { label: 'Pending', value: stats.pending },
            { label: 'Confirmed', value: stats.confirmed },
            { label: 'Completed', value: stats.completed },
          ].map((s) => (
            <div key={s.label} className="glass-panel rounded-xl p-5 border border-white/10">
              <p className="font-display text-3xl text-gradient-gold">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wide text-white/40 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {!mounted ? null : bookings.length === 0 ? (
          <div className="glass-panel rounded-xl p-16 text-center border border-white/10">
            <p className="text-white/50">No bookings yet. Submit a request from the booking page to see it appear here.</p>
            <a href="/booking" className="inline-block mt-6 px-6 py-3 bg-crimson hover:bg-crimson-light text-sm uppercase tracking-wide transition-colors" data-cursor-hover>
              Book Now
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="glass-panel rounded-xl p-6 border border-white/10 grid md:grid-cols-[1fr_auto] gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="font-mono text-xs text-gold">{b.id}</span>
                    <span className={`text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_COLORS[b.status]}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="font-display text-lg">{b.fullName} — {b.style}</p>
                  <p className="text-sm text-white/50 mt-1">
                    {b.placement} · {b.size} · {b.date} at {b.time}
                  </p>
                  <p className="text-xs text-white/40 mt-2">{b.mobile}{b.email ? ` · ${b.email}` : ''}</p>
                </div>
                <div className="flex flex-wrap items-start gap-2 md:justify-end">
                  <button onClick={() => setStatus(b.id, 'Confirmed')} data-cursor-hover className="px-3 py-2 text-xs uppercase border border-white/15 hover:border-cyan hover:text-cyan rounded-lg transition-colors">Confirm</button>
                  <button onClick={() => setStatus(b.id, 'Completed')} data-cursor-hover className="px-3 py-2 text-xs uppercase border border-white/15 hover:border-white/50 rounded-lg transition-colors">Complete</button>
                  <button onClick={() => setStatus(b.id, 'Rescheduled')} data-cursor-hover className="px-3 py-2 text-xs uppercase border border-white/15 hover:border-gold hover:text-gold rounded-lg transition-colors">Reschedule</button>
                  <button onClick={() => setStatus(b.id, 'Cancelled')} data-cursor-hover className="px-3 py-2 text-xs uppercase border border-white/15 hover:border-crimson hover:text-crimson rounded-lg transition-colors">Cancel</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

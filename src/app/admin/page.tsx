'use client';

import { useEffect, useState } from 'react';

type StatusCounts = {
  Pending: number;
  Confirmed: number;
  Completed: number;
  Cancelled: number;
  Rescheduled: number;
};

type TodayBooking = {
  id: string;
  booking_code: string;
  style: string;
  size: string;
  placement: string;
  date: string;
  time: string;
  full_name: string;
  mobile: string;
  status: string;
};

type ActivityEntry = {
  id: string;
  admin_email: string;
  action: string;
  details: string;
  created_at: string;
};

type DashboardData = {
  totalBookings: number;
  statusCounts: StatusCounts;
  bookingsNext7Days: number;
  totalArtworks: number;
  totalTestimonials: number;
  approvedTestimonials: number;
  recentActivity: ActivityEntry[];
  todayBookings: TodayBooking[];
};

const STATUS_COLORS: Record<string, string> = {
  Pending: 'text-gold border-gold/40 bg-gold/10',
  Confirmed: 'text-cyan border-cyan/40 bg-cyan/10',
  Completed: 'text-white/70 border-white/30 bg-white/10',
  Cancelled: 'text-crimson border-crimson/40 bg-crimson/10',
  Rescheduled: 'text-white border-white/40 bg-white/10',
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load dashboard');
        return res.json();
      })
      .then((json: DashboardData) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load dashboard data.');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = data
    ? [
        { label: 'Total Bookings', value: data.totalBookings },
        { label: 'Pending', value: data.statusCounts?.Pending ?? 0 },
        { label: 'Confirmed', value: data.statusCounts?.Confirmed ?? 0 },
        { label: 'This Week', value: data.bookingsNext7Days },
        { label: 'Gallery Items', value: data.totalArtworks },
        { label: 'Testimonials', value: `${data.approvedTestimonials}/${data.totalTestimonials}` },
      ]
    : [];

  return (
    <section className="relative pb-10">
      <div className="mb-10">
        <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Studio Admin</p>
        <h1 className="font-display text-4xl md:text-5xl">
          Dashboard <span className="text-gradient-gold">Overview</span>
        </h1>
      </div>

      {error && (
        <div className="glass-panel rounded-xl p-6 border border-crimson/30 text-crimson-light text-sm mb-8">
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel rounded-xl p-16 text-center border border-white/10">
          <p className="text-white/40 text-sm uppercase tracking-wide">Loading dashboard...</p>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {stats.map((s) => (
              <div key={s.label} className="glass-panel rounded-xl p-5 border border-white/10">
                <p className="font-display text-3xl text-gradient-gold">{s.value}</p>
                <p className="text-[10px] uppercase tracking-wide text-white/40 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="font-display text-xl mb-4">
                Today&apos;s <span className="text-gradient-gold">Appointments</span>
              </h2>
              {data.todayBookings.length === 0 ? (
                <div className="glass-panel rounded-xl p-8 text-center border border-white/10">
                  <p className="text-white/40 text-sm">No appointments scheduled today.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.todayBookings.map((b) => (
                    <div key={b.id} className="glass-panel rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <span className="font-mono text-xs text-gold">{b.booking_code}</span>
                        <span
                          className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                            STATUS_COLORS[b.status] || 'text-white/60 border-white/30 bg-white/10'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <p className="font-display text-base">{b.full_name} — {b.style}</p>
                      <p className="text-xs text-white/50 mt-1">
                        {b.placement} · {b.size} · {b.time}
                      </p>
                      <p className="text-xs text-white/40 mt-1">{b.mobile}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-display text-xl mb-4">
                Recent <span className="text-gradient-gold">Activity</span>
              </h2>
              {data.recentActivity.length === 0 ? (
                <div className="glass-panel rounded-xl p-8 text-center border border-white/10">
                  <p className="text-white/40 text-sm">No recent activity.</p>
                </div>
              ) : (
                <div className="glass-panel rounded-xl border border-white/10 divide-y divide-white/5">
                  {data.recentActivity.map((a) => (
                    <div key={a.id} className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-white/80">{a.action}</span>
                        <span className="text-[10px] text-white/30">
                          {new Date(a.created_at).toLocaleString()}
                        </span>
                      </div>
                      {a.details && <p className="text-xs text-white/40 mt-1">{a.details}</p>}
                      <p className="text-[10px] text-white/30 mt-1">{a.admin_email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

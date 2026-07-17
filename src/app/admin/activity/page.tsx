'use client';

import { useEffect, useState } from 'react';

type ActivityEntry = {
  id: string;
  admin_email: string;
  action: string;
  details: string;
  created_at: string;
};

export default function AdminActivityPage() {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/activity?limit=50', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((data: { activity: ActivityEntry[] }) => {
        if (!cancelled) {
          setActivity(data.activity || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load activity log.');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative pb-10">
      <div className="mb-10">
        <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Studio Admin</p>
        <h1 className="font-display text-4xl md:text-5xl">
          Activity <span className="text-gradient-gold">Log</span>
        </h1>
      </div>

      {error && (
        <div className="glass-panel rounded-xl p-6 border border-crimson/30 text-crimson-light text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel rounded-xl p-16 text-center border border-white/10">
          <p className="text-white/40 text-sm uppercase tracking-wide">Loading activity...</p>
        </div>
      ) : activity.length === 0 ? (
        <div className="glass-panel rounded-xl p-16 text-center border border-white/10">
          <p className="text-white/50">No activity recorded yet.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
          <div className="hidden md:grid grid-cols-[180px_1fr_1fr_180px] gap-4 px-6 py-3 text-[10px] uppercase tracking-wide text-white/40">
            <span>Timestamp</span>
            <span>Admin</span>
            <span>Action</span>
            <span>Details</span>
          </div>
          {activity.map((a) => (
            <div key={a.id} className="grid md:grid-cols-[180px_1fr_1fr_180px] gap-2 md:gap-4 px-6 py-4 text-sm">
              <span className="text-white/40 text-xs">{new Date(a.created_at).toLocaleString()}</span>
              <span className="text-white/70">{a.admin_email}</span>
              <span className="text-gold">{a.action}</span>
              <span className="text-white/50 text-xs">{a.details}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/setup', { credentials: 'include' })
      .then((res) => res.json())
      .then((data: { needsSetup: boolean }) => {
        if (cancelled) return;
        if (!data.needsSetup) {
          router.replace('/admin/login');
          return;
        }
        setChecking(false);
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to complete setup.');
        setSubmitting(false);
        return;
      }
      router.push('/admin');
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <p className="text-white/40 text-sm uppercase tracking-wide">Loading...</p>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-24">
      <div className="glass-panel rounded-2xl p-8 md:p-10 border border-white/10 w-full max-w-md">
        <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-3">First-Time Setup</p>
        <h1 className="font-display text-3xl mb-8">
          Create <span className="text-gradient-gold">Admin Account</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
              placeholder="admin@studio.com"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
              placeholder="Repeat password"
            />
          </div>

          {error && <p className="text-crimson-light text-xs">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            data-cursor-hover
            className="w-full px-6 py-3 bg-crimson hover:bg-crimson-light disabled:opacity-50 text-sm uppercase tracking-wide transition-colors rounded-lg"
          >
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </section>
  );
}

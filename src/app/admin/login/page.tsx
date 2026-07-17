'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid email or password');
        setSubmitting(false);
        return;
      }
      router.push('/admin');
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-24">
      <div className="glass-panel rounded-2xl p-8 md:p-10 border border-white/10 w-full max-w-md">
        <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-3">Studio Admin</p>
        <h1 className="font-display text-3xl mb-8">
          Welcome <span className="text-gradient-gold">Back</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-crimson-light text-xs">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            data-cursor-hover
            className="w-full px-6 py-3 bg-crimson hover:bg-crimson-light disabled:opacity-50 text-sm uppercase tracking-wide transition-colors rounded-lg"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-white/30 text-xs mt-6 text-center">
          First time here?{' '}
          <Link href="/admin/setup" className="text-gold/70 hover:text-gold transition-colors" data-cursor-hover>
            Set up an admin account
          </Link>
        </p>
      </div>
    </section>
  );
}

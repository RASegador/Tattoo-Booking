'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
  };

  return (
    <section id="contact" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Get In Touch</p>
          <h2 className="font-display text-4xl md:text-5xl mb-8">
            Visit The <span className="text-gradient-gold">Studio</span>
          </h2>

          <div className="space-y-5 mb-10 text-sm text-white/70">
            <p><span className="text-white/40 uppercase tracking-wide text-xs block mb-1">Address</span>
              128 Ashford Lane, Arts District, Manila, PH</p>
            <p><span className="text-white/40 uppercase tracking-wide text-xs block mb-1">Phone</span>
              +63 917 000 1234</p>
            <p><span className="text-white/40 uppercase tracking-wide text-xs block mb-1">Email</span>
              hello@obsidianink.studio</p>
            <p><span className="text-white/40 uppercase tracking-wide text-xs block mb-1">Business Hours</span>
              Tue – Sun, 11:00 AM – 8:00 PM · Closed Mondays</p>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10 h-64">
            <iframe
              title="Studio location map"
              className="w-full h-full grayscale contrast-125 invert-[0.92]"
              src="https://www.google.com/maps?q=Manila,Philippines&output=embed"
              loading="lazy"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="glass-panel rounded-2xl p-8 border border-white/10"
        >
          {sent ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <p className="text-5xl mb-4">✦</p>
              <p className="font-display text-xl mb-2">Message Sent</p>
              <p className="text-white/50 text-sm">We&rsquo;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Name</label>
                <input required className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Email</label>
                <input required type="email" className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Message</label>
                <textarea required rows={5} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold outline-none transition-colors resize-none" />
              </div>
              <button
                type="submit"
                disabled={loading}
                data-cursor-hover
                className="w-full py-4 bg-crimson hover:bg-crimson-light transition-colors text-sm tracking-[0.2em] uppercase disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

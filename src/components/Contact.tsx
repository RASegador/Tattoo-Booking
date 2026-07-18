'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, EmailIcon, LocationIcon, PhoneIcon, StarIcon } from '@/components/icons/TattooIcons';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('San Vicente, Camarines Norte, Philippines');
  const [phone, setPhone] = useState('0994 147 5924');
  const [email, setEmail] = useState('ralph.segador03@gmail.com');
  const [hours, setHours] = useState('Tue – Sun, 11:00 AM – 8:00 PM · Closed Mondays');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/content');
        const data = await res.json();
        if (!cancelled && data?.contact) {
          const contact = data.contact;
          if (contact.address) setAddress(contact.address);
          if (contact.phone) setPhone(contact.phone);
          if (contact.email) setEmail(contact.email);
          if (contact.hours) setHours(contact.hours);
        }
      } catch {
        // keep hardcoded defaults on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
            <p className="flex items-start gap-3">
              <LocationIcon className="w-5 h-5 text-gold-light shrink-0 mt-0.5" aria-hidden />
              <span><span className="text-white/40 uppercase tracking-wide text-xs block mb-1">Address</span>{address}</span>
            </p>
            <p className="flex items-start gap-3">
              <PhoneIcon className="w-5 h-5 text-gold-light shrink-0 mt-0.5" aria-hidden />
              <span><span className="text-white/40 uppercase tracking-wide text-xs block mb-1">Phone</span>{phone}</span>
            </p>
            <p className="flex items-start gap-3">
              <EmailIcon className="w-5 h-5 text-gold-light shrink-0 mt-0.5" aria-hidden />
              <span><span className="text-white/40 uppercase tracking-wide text-xs block mb-1">Email</span>{email}</span>
            </p>
            <p className="flex items-start gap-3">
              <ClockIcon className="w-5 h-5 text-gold-light shrink-0 mt-0.5" aria-hidden />
              <span><span className="text-white/40 uppercase tracking-wide text-xs block mb-1">Business Hours</span>{hours}</span>
            </p>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10 h-64">
            <iframe
              title="Studio location map"
              className="w-full h-full grayscale contrast-125 invert-[0.92]"
              src="https://www.google.com/maps?q=San+Vicente,+Camarines+Norte,+Philippines&output=embed"
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
              <StarIcon filled className="w-12 h-12 text-gold-light mb-4 drop-shadow-[0_0_16px_rgba(201,162,75,0.6)]" aria-hidden />
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
                className="btn-pulse-border glow-hover-red w-full py-4 bg-gold hover:bg-gold-light text-ink-black transition-colors text-sm tracking-[0.2em] uppercase disabled:opacity-60 shadow-glow-red"
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

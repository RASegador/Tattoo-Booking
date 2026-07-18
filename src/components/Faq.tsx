'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { faqs as fallbackFaqs } from '@/lib/data';

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const [faqs, setFaqs] = useState(fallbackFaqs);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/content');
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.faq) && data.faq.length > 0) {
          setFaqs(data.faq);
        }
      } catch {
        // keep fallback faqs on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="faq" className="relative py-32 px-6">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Good to Know</p>
          <h2 className="font-display text-4xl md:text-5xl">
            Frequently Asked <span className="text-gradient-gold">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass-panel rounded-xl overflow-hidden border border-white/10 hover:border-crimson/30 transition-colors duration-300"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                data-cursor-hover
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-white font-medium">{f.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-gold text-2xl leading-none"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-sm text-white/60 leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

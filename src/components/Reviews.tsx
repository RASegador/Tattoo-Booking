'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { reviews } from '@/lib/data';

export default function Reviews() {
  return (
    <section id="reviews" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Client Stories</p>
          <h2 className="font-display text-4xl md:text-5xl">
            Voices From <span className="text-gradient-gold">The Chair</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-gold/40 transition-colors"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={`https://picsum.photos/seed/${r.tattooSeed}/600/400`}
                  alt={`Tattoo for ${r.name}`}
                  fill
                  className="object-cover grayscale contrast-125"
                  sizes="33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gold/40">
                    <Image
                      src={`https://i.pravatar.cc/80?u=${r.avatarSeed}`}
                      alt={r.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-white flex items-center gap-1.5">
                      {r.name}
                      {r.verified && <span className="text-cyan text-xs" title="Verified client">✓</span>}
                    </p>
                    <p className="text-xs text-white/40">{r.date}</p>
                  </div>
                </div>
                <div className="text-gold text-sm mb-3">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p className="text-sm text-white/60 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

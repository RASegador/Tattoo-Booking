'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { reviews as fallbackReviews } from '@/lib/data';
import { ShieldIcon, StarIcon } from '@/components/icons/TattooIcons';

type DisplayReview = {
  id: string | number;
  name: string;
  avatarUrl: string;
  rating: number;
  tattooImage: string;
  text: string;
  date: string;
  verified: boolean;
};

function isDataUrl(src: string) {
  return src.startsWith('data:');
}

export default function Reviews() {
  const [reviews, setReviews] = useState<DisplayReview[]>(
    fallbackReviews.map((r) => ({
      id: r.id,
      name: r.name,
      avatarUrl: `https://i.pravatar.cc/80?u=${r.avatarSeed}`,
      rating: r.rating,
      tattooImage: `https://picsum.photos/seed/${r.tattooSeed}/600/400`,
      text: r.text,
      date: r.date,
      verified: r.verified,
    }))
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/testimonials');
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.testimonials) && data.testimonials.length > 0) {
          setReviews(
            data.testimonials.map((t: any) => ({
              id: t.id,
              name: t.name,
              avatarUrl: t.avatar_url,
              rating: t.rating,
              tattooImage: t.tattoo_image,
              text: t.review_text,
              date: t.review_date,
              verified: t.verified,
            }))
          );
        }
      } catch {
        // keep fallback reviews on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
              className="card-hover-red glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-gold-light/40 transition-colors"
            >
              <div className="relative h-40 w-full">
                {isDataUrl(r.tattooImage) ? (
                  <img
                    src={r.tattooImage}
                    alt={`Tattoo for ${r.name}`}
                    className="absolute inset-0 w-full h-full object-cover grayscale contrast-125"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                ) : (
                  <Image
                    src={r.tattooImage}
                    alt={`Tattoo for ${r.name}`}
                    fill
                    className="object-cover grayscale contrast-125"
                    sizes="33vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gold/40">
                    {isDataUrl(r.avatarUrl) ? (
                      <img
                        src={r.avatarUrl}
                        alt={r.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    ) : (
                      <Image
                        src={r.avatarUrl}
                        alt={r.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white flex items-center gap-1.5">
                      {r.name}
                      {r.verified && (
                        <span className="text-cyan" title="Verified client">
                          <ShieldIcon className="w-3.5 h-3.5" aria-hidden />
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-white/40">{r.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-gold mb-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <StarIcon key={idx} filled={idx < r.rating} className="w-4 h-4" aria-hidden />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

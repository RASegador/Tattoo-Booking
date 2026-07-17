'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Artist = {
  id: number;
  slug: string;
  name: string;
  bio: string;
  photo_data: string;
  specialties: string[];
  years_experience: number | null;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  available: boolean;
  availability_note: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

function isDataUrl(src: string) {
  return src.startsWith('data:');
}

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/artists');
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.artists)) {
          setArtists(data.artists);
        }
      } catch {
        // keep empty on failure
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && artists.length === 0) return null;

  return (
    <section id="artists" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Our Artists</p>
          <h2 className="font-display text-4xl md:text-5xl">
            Meet The <span className="text-gradient-gold">Hands Behind The Ink</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto mt-5">
            Every artist at Obsidian Ink brings a distinct style and specialty — choose the one whose
            work speaks to your vision when you book.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="glass-panel rounded-xl p-6 text-center"
            >
              <div className="relative w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border border-white/10">
                {a.photo_data ? (
                  isDataUrl(a.photo_data) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.photo_data} alt={a.name} className="w-full h-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.photo_data} alt={a.name} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center text-2xl">🎨</div>
                )}
              </div>
              <p className="font-display text-xl">{a.name}</p>
              {a.years_experience ? (
                <p className="text-xs text-white/40 mt-1">{a.years_experience}+ years experience</p>
              ) : null}
              {a.specialties?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {a.specialties.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 text-[10px] tracking-[0.1em] uppercase border border-white/15 text-white/60 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {a.bio && <p className="text-sm text-white/60 leading-relaxed mt-4 line-clamp-3">{a.bio}</p>}
              <p
                className={`text-xs mt-4 uppercase tracking-wide ${
                  a.available ? 'text-gold' : 'text-white/40'
                }`}
              >
                {a.available ? (a.availability_note || 'Currently accepting bookings') : 'Fully booked'}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            href="/booking"
            data-cursor-hover
            className="inline-block px-9 py-4 border border-gold text-gold text-sm tracking-[0.2em] uppercase hover:bg-gold hover:text-ink-black transition-colors duration-300"
          >
            Book With An Artist
          </Link>
        </div>
      </div>
    </section>
  );
}

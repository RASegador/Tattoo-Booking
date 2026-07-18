'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ArtistProfileModal, { type ModalArtist } from '@/components/artists/ArtistProfileModal';

type Artist = ModalArtist;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
            <motion.button
              key={a.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              data-cursor-hover
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ y: -8 }}
              className="group relative glass-panel rounded-xl overflow-hidden text-left border border-white/10 hover:border-gold/40 transition-colors duration-300 flex flex-col"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                {a.photo_data ? (
                  <Image
                    src={a.photo_data}
                    alt={a.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center text-4xl">🎨</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                {a.featured && (
                  <span className="absolute top-3 left-3 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] rounded-full border border-gold text-gold bg-black/50 backdrop-blur-sm">
                    ★ Featured Artist
                  </span>
                )}

                <span
                  className={`absolute top-3 right-3 px-2.5 py-1 text-[9px] uppercase tracking-wide rounded-full border backdrop-blur-sm ${
                    a.available
                      ? 'text-gold border-gold/40 bg-black/40'
                      : 'text-white/50 border-white/20 bg-black/40'
                  }`}
                >
                  {a.available ? 'Available' : 'Fully Booked'}
                </span>

                <div className="absolute bottom-0 inset-x-0 p-5">
                  <p className="font-display text-xl">{a.name}</p>
                  {a.years_experience ? (
                    <p className="text-xs text-white/60 mt-0.5">{a.years_experience}+ years experience</p>
                  ) : null}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                {a.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {a.specialties.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 text-[10px] tracking-[0.1em] uppercase border border-white/15 text-white/60 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {a.bio && <p className="text-sm text-white/50 leading-relaxed line-clamp-2 mb-4">{a.bio}</p>}
                <span className="mt-auto inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-gold group-hover:gap-3 transition-all">
                  View Profile <span aria-hidden>→</span>
                </span>
              </div>
            </motion.button>
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

      {activeIndex !== null && (
        <ArtistProfileModal
          artists={artists}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={(next) => setActiveIndex(next)}
        />
      )}
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { GalleryArtwork } from '@/components/portfolio/GalleryModal';
import { ShieldIcon, StarIcon } from '@/components/icons/TattooIcons';

type Artist = {
  id: number;
  slug: string;
  name: string;
  bio: string;
  photo_data: string;
  specialties: string[];
  years_experience: number | null;
  available: boolean;
  availability_note: string;
  featured?: boolean;
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function FeaturedArtist() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [works, setWorks] = useState<GalleryArtwork[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/artists');
        const data = await res.json();
        const featured = Array.isArray(data?.artists)
          ? data.artists.find((a: Artist) => a.featured) || data.artists[0]
          : null;
        if (!cancelled && featured) {
          setArtist(featured);
          try {
            const portfolioRes = await fetch(`/api/public/artist-portfolio/${featured.id}`);
            const portfolioData = await portfolioRes.json();
            if (!cancelled && Array.isArray(portfolioData?.artworks)) {
              setWorks(portfolioData.artworks.slice(0, 4));
            }
          } catch {
            // ignore
          }
        }
      } catch {
        // keep empty on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!artist) return null;

  return (
    <section id="featured-artist" className="relative py-32 px-6 overflow-hidden">
      <div className="ink-splatter-layer">
        <div className="blob w-[420px] h-[420px] -top-20 right-0" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Lead Tattoo Artist</p>
          <h2 className="font-display text-4xl md:text-5xl">
            Meet Our <span className="text-gradient-gold">Featured Artist</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-14 items-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden grain">
              <Image
                src={artist.photo_data}
                alt={artist.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-black via-transparent to-transparent" />
              <span className="absolute top-5 left-5 flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-[0.15em] rounded-full border border-gold text-gold bg-black/50 backdrop-blur-sm">
                <StarIcon filled className="w-3.5 h-3.5" aria-hidden /> Featured Artist
              </span>
              <span className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-[0.15em] rounded-full border border-gold-light/60 text-gold-light bg-black/50 backdrop-blur-sm shadow-glow-red">
                <ShieldIcon className="w-3.5 h-3.5" aria-hidden /> Verified
              </span>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <h3 className="font-display text-3xl md:text-4xl mb-4">{artist.name}</h3>
            {artist.years_experience ? (
              <p className="text-xs tracking-[0.2em] uppercase text-white/40 mb-6">
                {artist.years_experience}+ Years Experience · Lead Tattoo Artist
              </p>
            ) : null}
            <p className="text-white/60 leading-relaxed mb-6">{artist.bio}</p>

            {artist.specialties?.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-8">
                {artist.specialties.map((s) => (
                  <span
                    key={s}
                    className="px-4 py-2 text-xs tracking-[0.15em] uppercase border border-white/15 text-white/70 rounded-full hover:border-gold hover:text-gold transition-colors"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {works.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-10">
                {works.map((w) => (
                  <div key={w.id} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image src={w.image_data} alt={w.title} fill sizes="150px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/booking"
              data-cursor-hover
              className="btn-pulse-border glow-hover-red inline-block px-9 py-4 bg-gold hover:bg-gold-light text-ink-black text-sm tracking-[0.2em] uppercase transition-colors duration-300 rounded-lg shadow-glow-red"
            >
              Book With {artist.name.split(' ')[0]} {artist.name.split(' ')[1] || ''}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

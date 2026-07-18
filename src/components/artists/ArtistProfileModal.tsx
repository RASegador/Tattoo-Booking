'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { formatPHPRange } from '@/lib/currency';
import type { GalleryArtwork } from '@/components/portfolio/GalleryModal';
import { StarIcon } from '@/components/icons/TattooIcons';

export type ModalArtist = {
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
  featured?: boolean;
};

const SWIPE_THRESHOLD = 80;

export default function ArtistProfileModal({
  artists,
  activeIndex,
  onClose,
  onNavigate,
}: {
  artists: ModalArtist[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const artist = artists[activeIndex];
  const [portfolio, setPortfolio] = useState<GalleryArtwork[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  const goPrev = () => onNavigate((activeIndex - 1 + artists.length) % artists.length);
  const goNext = () => onNavigate((activeIndex + 1) % artists.length);

  useEffect(() => {
    if (!artist) return;
    let cancelled = false;
    setLoadingPortfolio(true);
    (async () => {
      try {
        const res = await fetch(`/api/public/artist-portfolio/${artist.id}`);
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.artworks)) {
          setPortfolio(data.artworks);
        }
      } catch {
        if (!cancelled) setPortfolio([]);
      } finally {
        if (!cancelled) setLoadingPortfolio(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [artist]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, artists.length]);

  if (!artist) return null;

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      goPrev();
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      goNext();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        onClick={onClose}
      >
        <motion.div
          key={artist.id}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto glass-panel rounded-2xl border border-white/10 bg-ink-charcoal touch-pan-y"
        >
          <button
            onClick={onClose}
            data-cursor-hover
            aria-label="Close artist profile"
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full border border-white/20 bg-black/40 flex items-center justify-center text-white/70 hover:text-gold hover:border-gold transition-colors"
          >
            ✕
          </button>

          {artists.length > 1 && (
            <>
              <button
                onClick={goPrev}
                data-cursor-hover
                aria-label="Previous artist"
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-white/20 bg-black/40 items-center justify-center text-white/70 hover:text-gold hover:border-gold transition-colors"
              >
                ‹
              </button>
              <button
                onClick={goNext}
                data-cursor-hover
                aria-label="Next artist"
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-white/20 bg-black/40 items-center justify-center text-white/70 hover:text-gold hover:border-gold transition-colors"
              >
                ›
              </button>
            </>
          )}

          <div className="grid md:grid-cols-[320px_1fr] gap-0">
            <div className="relative aspect-[4/5] md:aspect-auto md:h-full min-h-[280px]">
              <Image
                src={artist.photo_data}
                alt={artist.name}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal via-transparent to-transparent md:bg-gradient-to-r" />
              {artist.featured && (
                <span className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] rounded-full border border-gold text-gold bg-black/50 backdrop-blur-sm">
                  <StarIcon filled className="w-3 h-3" aria-hidden /> Featured Artist
                </span>
              )}
            </div>

            <div className="p-6 sm:p-10">
              <p className="text-xs tracking-[0.3em] uppercase text-gold/80 mb-2">
                {artist.years_experience ? `${artist.years_experience}+ Years Experience` : 'Tattoo Artist'}
              </p>
              <h3 className="font-display text-3xl sm:text-4xl mb-3">{artist.name}</h3>

              {artist.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {artist.specialties.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 text-[10px] tracking-[0.1em] uppercase border border-white/15 text-white/70 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <p
                className={`inline-block text-xs mb-5 px-3 py-1 rounded-full uppercase tracking-wide border ${
                  artist.available ? 'text-gold border-gold/40 bg-gold/10' : 'text-white/40 border-white/20 bg-white/5'
                }`}
              >
                {artist.available ? artist.availability_note || 'Currently accepting bookings' : 'Fully booked'}
              </p>

              {artist.bio && <p className="text-white/60 leading-relaxed mb-6">{artist.bio}</p>}

              {(artist.instagram_url || artist.facebook_url || artist.tiktok_url) && (
                <div className="flex flex-wrap gap-4 mb-8 text-xs uppercase tracking-wide">
                  {artist.instagram_url && (
                    <a
                      href={artist.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor-hover
                      className="text-white/60 hover:text-gold transition-colors"
                    >
                      Instagram
                    </a>
                  )}
                  {artist.facebook_url && (
                    <a
                      href={artist.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor-hover
                      className="text-white/60 hover:text-gold transition-colors"
                    >
                      Facebook
                    </a>
                  )}
                  {artist.tiktok_url && (
                    <a
                      href={artist.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor-hover
                      className="text-white/60 hover:text-gold transition-colors"
                    >
                      TikTok
                    </a>
                  )}
                </div>
              )}

              <div className="mb-8">
                <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-3">Featured Portfolio</p>
                {loadingPortfolio ? (
                  <p className="text-white/40 text-sm">Loading portfolio...</p>
                ) : portfolio.length === 0 ? (
                  <p className="text-white/40 text-sm">Portfolio coming soon.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {portfolio.slice(0, 6).map((p) => (
                      <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden group">
                        <Image
                          src={p.image_data}
                          alt={p.title}
                          fill
                          sizes="120px"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {(p.price_min || p.price_max) && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pt-4 pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[9px] text-gold">{formatPHPRange(p.price_min, p.price_max)}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/booking"
                data-cursor-hover
                className="btn-pulse-border glow-hover-red inline-block px-8 py-3.5 bg-crimson hover:bg-crimson-light text-sm uppercase tracking-[0.15em] transition-colors duration-300 rounded-lg shadow-glow-red"
              >
                Book This Artist
              </Link>
            </div>
          </div>

          {artists.length > 1 && (
            <div className="flex sm:hidden justify-center gap-4 pb-6">
              <button
                onClick={goPrev}
                data-cursor-hover
                className="px-4 py-2 text-xs uppercase tracking-wide border border-white/15 rounded-lg text-white/70"
              >
                ‹ Prev
              </button>
              <button
                onClick={goNext}
                data-cursor-hover
                className="px-4 py-2 text-xs uppercase tracking-wide border border-white/15 rounded-lg text-white/70"
              >
                Next ›
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

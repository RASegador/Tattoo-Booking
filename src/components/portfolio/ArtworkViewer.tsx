'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import type { GalleryArtwork } from './GalleryModal';
import { formatPHPRange } from '@/lib/currency';
import { HeartIcon } from '@/components/icons/TattooIcons';

function isDataUrl(src: string) {
  return src.startsWith('data:');
}

export default function ArtworkViewer({
  artworks,
  index,
  onClose,
  onNavigate,
}: {
  artworks: GalleryArtwork[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [zoomed, setZoomed] = useState(false);
  const artwork = artworks[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate((index + 1) % artworks.length);
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + artworks.length) % artworks.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, artworks.length, onClose, onNavigate]);

  if (!artwork) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex items-center justify-center px-4 py-10"
    >
      <button
        onClick={onClose}
        data-cursor-hover
        className="absolute top-6 right-6 text-white/60 hover:text-gold text-2xl z-10"
        aria-label="Close viewer"
      >
        ✕
      </button>

      <button
        onClick={() => onNavigate((index - 1 + artworks.length) % artworks.length)}
        data-cursor-hover
        className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-gold text-3xl z-10"
        aria-label="Previous artwork"
      >
        ‹
      </button>
      <button
        onClick={() => onNavigate((index + 1) % artworks.length)}
        data-cursor-hover
        className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-gold text-3xl z-10"
        aria-label="Next artwork"
      >
        ›
      </button>

      <div className="max-w-6xl w-full grid md:grid-cols-[1.3fr_1fr] gap-8 items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="relative aspect-[4/5] rounded-xl overflow-hidden bg-ink-charcoal cursor-zoom-in"
            onClick={() => setZoomed((z) => !z)}
            data-cursor-hover
          >
            <motion.div
              animate={{ scale: zoomed ? 1.6 : 1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              {isDataUrl(artwork.image_data) ? (
                <img
                  src={artwork.image_data}
                  alt={artwork.title}
                  className="absolute inset-0 w-full h-full object-cover grayscale contrast-125"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              ) : (
                <Image
                  src={artwork.image_data}
                  alt={artwork.title}
                  fill
                  className="object-cover grayscale contrast-125"
                  sizes="60vw"
                />
              )}
            </motion.div>
            <div className="absolute bottom-3 right-3 text-[10px] tracking-widest uppercase text-white/50 bg-black/50 px-2 py-1 rounded">
              {zoomed ? 'Click to reset' : 'Click to zoom'}
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          key={`${artwork.id}-meta`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass-panel rounded-xl p-8"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-2">
            {index + 1} / {artworks.length}
          </p>
          <h3 className="font-display text-2xl mb-4">{artwork.title}</h3>
          {artwork.artist_name && (
            <p className="text-xs tracking-[0.2em] uppercase text-white/40 mb-4">
              By <span className="text-gold/80">{artwork.artist_name}</span>
            </p>
          )}
          <dl className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <dt className="text-white/40 text-xs uppercase tracking-wide">Placement</dt>
              <dd className="text-white/80 mt-1">{artwork.placement}</dd>
            </div>
            <div>
              <dt className="text-white/40 text-xs uppercase tracking-wide">Size</dt>
              <dd className="text-white/80 mt-1">{artwork.size}</dd>
            </div>
            <div>
              <dt className="text-white/40 text-xs uppercase tracking-wide">Est. Duration</dt>
              <dd className="text-white/80 mt-1">{artwork.duration}</dd>
            </div>
          </dl>
          <p className="text-white/60 text-sm leading-relaxed mb-6">{artwork.description}</p>
          <p className="text-gold font-display text-lg mb-6">{formatPHPRange(artwork.price_min, artwork.price_max)}</p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLiked((l) => ({ ...l, [artwork.id]: !l[artwork.id] }))}
              data-cursor-hover
              className={`glow-hover-red flex items-center gap-2 px-4 py-2 border rounded-full text-sm transition-colors ${
                liked[artwork.id] ? 'border-gold text-gold-light' : 'border-white/20 text-white/60 hover:border-white/50'
              }`}
            >
              <HeartIcon filled={!!liked[artwork.id]} className="w-4 h-4" aria-hidden />
              {liked[artwork.id] ? 'Liked' : 'Like'}
            </button>
            <button
              data-cursor-hover
              className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full text-sm text-white/60 hover:border-white/50 transition-colors"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: artwork.title, text: artwork.description }).catch(() => {});
                }
              }}
            >
              ↗ Share
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

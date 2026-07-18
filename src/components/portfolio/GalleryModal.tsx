'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import type { Category } from '@/lib/data';
import ArtworkViewer from './ArtworkViewer';

export type GalleryArtwork = {
  id: number;
  category_slug: string;
  title: string;
  image_data: string;
  placement: string;
  size: string;
  duration: string;
  price_min: number | null;
  price_max: number | null;
  description: string;
  featured?: boolean;
  created_at?: string;
  artist_id?: number | null;
  artist_name?: string | null;
};

function isDataUrl(src: string) {
  return src.startsWith('data:');
}

export default function GalleryModal({
  slug,
  categories,
  onClose,
}: {
  slug: string;
  categories: Category[];
  onClose: () => void;
}) {
  const category = categories.find((c) => c.slug === slug);
  const [artworks, setArtworks] = useState<GalleryArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/gallery/${slug}`);
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.artworks)) {
          setArtworks(data.artworks);
        }
      } catch {
        if (!cancelled) setArtworks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1500] bg-black/90 backdrop-blur-2xl overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, rotateX: 8 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen px-6 py-24 max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-gold/70 mb-2">Portfolio</p>
            <h2 className="font-display text-4xl">{category?.name}</h2>
          </div>
          <button
            onClick={onClose}
            data-cursor-hover
            className="w-11 h-11 flex items-center justify-center rounded-full border border-white/20 text-white/70 hover:border-gold hover:text-gold transition-colors"
            aria-label="Close gallery"
          >
            ✕
          </button>
        </div>

        {loading && artworks.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white/5 animate-pulse aspect-[4/5]" />
            ))}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
            {artworks.map((art, i) => (
              <motion.button
                key={String(art.id)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                onClick={() => setViewerIndex(i)}
                data-cursor-hover
                className="card-hover-red group relative mb-5 w-full break-inside-avoid rounded-xl overflow-hidden block text-left border border-transparent"
              >
                <div className="relative w-full" style={{ aspectRatio: i % 3 === 0 ? '3/4' : i % 3 === 1 ? '1/1' : '4/5' }}>
                  {isDataUrl(art.image_data) ? (
                    <img
                      src={art.image_data}
                      alt={art.title}
                      className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-700"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Image
                      src={art.image_data}
                      alt={art.title}
                      fill
                      className="object-cover grayscale contrast-125 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-sm font-display text-white">{art.title}</p>
                    <p className="text-xs text-gold/80 mt-1">{art.placement} · {art.duration}</p>
                    {art.artist_name && <p className="text-[11px] text-white/50 mt-0.5">By {art.artist_name}</p>}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {viewerIndex !== null && (
          <ArtworkViewer
            artworks={artworks}
            index={viewerIndex}
            onClose={() => setViewerIndex(null)}
            onNavigate={(i) => setViewerIndex(i)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { categories } from '@/lib/data';
import FolderCard from './FolderCard';
import GalleryModal from './GalleryModal';

export default function PortfolioSection() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <section id="portfolio" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">The Gallery</p>
          <h2 className="font-display text-4xl md:text-5xl">
            An Archive of <span className="text-gradient-gold">Living Art</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto mt-5">
            Click a folder to step inside — every category holds a curated collection of healed
            work, close-ups, and client stories.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <FolderCard key={cat.slug} category={cat} index={i} onOpen={setOpenCategory} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {openCategory && <GalleryModal slug={openCategory} onClose={() => setOpenCategory(null)} />}
      </AnimatePresence>
    </section>
  );
}

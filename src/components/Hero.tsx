'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-black/40 to-ink-black" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-xs md:text-sm tracking-[0.5em] uppercase text-gold/80 mb-6"
        >
          Obsidian Ink Studio
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
          className="font-display text-5xl sm:text-6xl md:text-8xl leading-[1.05] tracking-tight"
        >
          Ink That Tells
          <br />
          <span className="text-gradient-gold">Your Story</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-8 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
        >
          A boutique tattoo studio where fine art meets skin. Every piece is custom-built,
          hand-drawn, and executed with obsessive precision — an immersive gallery experience,
          not just a tattoo shop.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <Link
            href="/booking"
            data-cursor-hover
            className="group relative px-9 py-4 bg-crimson text-white text-sm tracking-[0.2em] uppercase overflow-hidden"
          >
            <span className="relative z-10">Book Appointment</span>
            <span className="absolute inset-0 bg-crimson-light translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
          <a
            href="#portfolio"
            data-cursor-hover
            className="px-9 py-4 border border-white/30 text-white text-sm tracking-[0.2em] uppercase hover:border-gold hover:text-gold transition-colors duration-300"
          >
            View Portfolio
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[1px] h-10 bg-gradient-to-b from-gold to-transparent"
        />
      </motion.div>
    </section>
  );
}

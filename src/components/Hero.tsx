'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BarbedWireIcon, InkSplatterIcon } from '@/components/icons/TattooIcons';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const parallaxOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  const [eyebrow, setEyebrow] = useState('Obsidian Ink Studio');
  const [headlineLine1, setHeadlineLine1] = useState('Ink That Tells');
  const [headlineLine2Gold, setHeadlineLine2Gold] = useState('Your Story');
  const [subtext, setSubtext] = useState(
    'A boutique tattoo studio where fine art meets skin. Every piece is custom-built, hand-drawn, and executed with obsessive precision — an immersive gallery experience, not just a tattoo shop.'
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/content');
        const data = await res.json();
        if (!cancelled && data?.hero) {
          const hero = data.hero;
          if (hero.eyebrow) setEyebrow(hero.eyebrow);
          if (hero.headline_line1) setHeadlineLine1(hero.headline_line1);
          if (hero.headline_line2_gold) setHeadlineLine2Gold(hero.headline_line2_gold);
          if (hero.subtext) setSubtext(hero.subtext);
        }
      } catch {
        // keep hardcoded defaults on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      <motion.div className="absolute inset-0 -z-10" style={{ y: parallaxY, opacity: parallaxOpacity }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-black/40 to-ink-black" />
        <div className="ink-splatter-layer">
          <InkSplatterIcon
            variant={1}
            className="absolute -top-24 -left-16 w-[520px] h-[520px] text-gold/40 blur-[55px] animate-parallaxDrift"
          />
          <InkSplatterIcon
            variant={2}
            className="absolute bottom-0 right-0 w-[460px] h-[460px] text-gold-light/35 blur-[65px] animate-parallaxDrift"
            style={{ animationDelay: '3s' }}
          />
        </div>
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-xs md:text-sm tracking-[0.5em] uppercase text-gold/80 mb-6"
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
          className="font-display text-5xl sm:text-6xl md:text-8xl leading-[1.05] tracking-tight"
        >
          {headlineLine1}
          <br />
          <span className="text-gradient-gold">{headlineLine2Gold}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-8 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
        >
          {subtext}
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
            className="btn-pulse-border glow-hover-red group relative px-9 py-4 bg-gold text-ink-black text-sm tracking-[0.2em] uppercase overflow-hidden rounded-sm shadow-glow-red"
          >
            <span className="relative z-10">Book Appointment</span>
            <span className="absolute inset-0 bg-gold-light translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
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
        <BarbedWireIcon className="w-16 h-3 text-gold/45" aria-hidden />
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

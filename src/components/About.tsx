'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Years Combined Experience', value: '18+' },
  { label: 'Pieces Completed', value: '3,200+' },
  { label: 'Awards Won', value: '9' },
  { label: 'Certifications', value: '6' },
];

const specialties = ['Realism', 'Black & Grey', 'Fine Line', 'Anime', 'Traditional', 'Cover Ups'];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export default function About() {
  const [eyebrow, setEyebrow] = useState('The Studio');
  const [headingPlain, setHeadingPlain] = useState('Where Fine Art Meets');
  const [headingGold, setHeadingGold] = useState('Permanent Craft');
  const [artistLine, setArtistLine] = useState('A Collective of Resident Tattoo Artists');
  const [bio1, setBio1] = useState(
    'Obsidian Ink Studio was founded on a simple belief — a tattoo should be treated as fine art, not a transaction. Every client begins with a private consultation where we translate your story, memory, or vision into a piece built exclusively for your skin.'
  );
  const [bio2, setBio2] = useState(
    'Our resident artists trained across traditional Japanese, American, and European studios, bringing decades of combined technique to a modern, gallery-grade studio environment — hospital-level sterilization, premium pigments, and an atmosphere designed to feel more like an art residency than a shop.'
  );
  const [philosophyQuote, setPhilosophyQuote] = useState(
    '"A tattoo is not decoration. It is a permanent conversation between memory, identity, and skin — and every conversation deserves an artist who listens first."'
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/content');
        const data = await res.json();
        if (!cancelled && data?.about) {
          const about = data.about;
          if (about.eyebrow) setEyebrow(about.eyebrow);
          if (about.heading_plain) setHeadingPlain(about.heading_plain);
          if (about.heading_gold) setHeadingGold(about.heading_gold);
          if (about.artist_line) setArtistLine(about.artist_line);
          if (about.bio1) setBio1(about.bio1);
          if (about.bio2) setBio2(about.bio2);
          if (about.philosophy_quote) setPhilosophyQuote(about.philosophy_quote);
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
    <section id="about" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="relative"
        >
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden grain">
            <Image
              src="https://images.unsplash.com/photo-1594091011122-3ae14fdbe243?w=900&h=1125&fit=crop&q=80"
              alt="A resident artist at work inside Obsidian Ink Studio"
              fill
              className="object-cover contrast-110"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-black via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-8 -right-8 glass-panel rounded-xl p-6 hidden sm:block">
            <p className="font-display text-3xl text-gradient-gold">18+</p>
            <p className="text-xs tracking-[0.2em] uppercase text-white/50 mt-1">Years Combined Experience</p>
          </div>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4 section-heading">{eyebrow}</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight mb-3">
            {headingPlain} <span className="text-gradient-gold">{headingGold}</span>
          </h2>
          <p className="text-sm tracking-[0.2em] uppercase text-white/40 mb-6">
            {artistLine}
          </p>
          <p className="text-white/60 leading-relaxed mb-6">
            {bio1}
          </p>
          <p className="text-white/60 leading-relaxed mb-10">
            {bio2}
          </p>

          <div className="grid grid-cols-2 gap-6 mb-10">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl text-white">{s.value}</p>
                <p className="text-xs tracking-[0.15em] uppercase text-white/40 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {specialties.map((s) => (
              <span
                key={s}
                className="px-4 py-2 text-xs tracking-[0.15em] uppercase border border-white/15 text-white/70 rounded-full hover:border-gold hover:text-gold transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="mx-auto max-w-4xl text-center mt-28"
      >
        <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Our Philosophy</p>
        <p className="font-display text-2xl md:text-3xl leading-relaxed text-white/90">
          {philosophyQuote}
        </p>
      </motion.div>
    </section>
  );
}

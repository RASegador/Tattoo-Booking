'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TattooMachineIcon } from '@/components/icons/TattooIcons';

const links = [
  { href: '/#about', label: 'About' },
  { href: '/#portfolio', label: 'Portfolio' },
  { href: '/#reviews', label: 'Reviews' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-[500] transition-all duration-500 ${
        scrolled ? 'glass-panel py-3' : 'py-6 bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl tracking-[0.25em] text-gradient-gold"
          data-cursor-hover
        >
          <TattooMachineIcon className="w-5 h-5 text-crimson-light" aria-hidden />
          OBSIDIAN INK
        </Link>
        <nav className="hidden md:flex items-center gap-10 text-sm tracking-[0.15em] uppercase text-white/80">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-gold transition-colors" data-cursor-hover>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <Link
            href="/booking"
            data-cursor-hover
            className="glow-hover-red px-5 py-2.5 border border-crimson/70 text-crimson-light text-xs tracking-[0.2em] uppercase hover:bg-crimson hover:text-white hover:border-crimson transition-all duration-300"
          >
            Book Now
          </Link>
        </div>
        <button
          className="md:hidden text-white"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          data-cursor-hover
        >
          <div className="w-7 space-y-1.5">
            <span className={`block h-[1.5px] bg-white transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-[1.5px] bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-[1.5px] bg-white transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </div>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="md:hidden glass-panel mt-4 mx-4 rounded-xl overflow-hidden"
        >
          <div className="flex flex-col p-6 gap-5 text-sm tracking-[0.15em] uppercase">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-white/80 hover:text-gold">
                {l.label}
              </a>
            ))}
            <Link href="/booking" onClick={() => setOpen(false)} className="text-gold">
              Book Now →
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

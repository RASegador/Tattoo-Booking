import Link from 'next/link';
import { BarbedWireIcon, TattooMachineIcon } from '@/components/icons/TattooIcons';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-ink-charcoal/60">
      <BarbedWireIcon className="w-full h-3 text-crimson/25" aria-hidden />
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <p className="flex items-center gap-2 font-display text-lg tracking-[0.25em] text-gradient-gold mb-4">
            <TattooMachineIcon className="w-4 h-4 text-crimson-light" aria-hidden />
            OBSIDIAN INK
          </p>
          <p className="text-sm text-white/50 leading-relaxed">
            A cinematic tattoo studio and digital gallery devoted to bold storytelling through ink.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-white/40 mb-4">Navigate</p>
          <ul className="space-y-2 text-sm text-white/60">
            <li><a href="/#about" className="hover:text-gold">About</a></li>
            <li><a href="/#portfolio" className="hover:text-gold">Portfolio</a></li>
            <li><Link href="/booking" className="hover:text-gold">Book Appointment</Link></li>
            <li><a href="/#faq" className="hover:text-gold">FAQ</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-white/40 mb-4">Connect</p>
          <ul className="space-y-2 text-sm text-white/60">
            <li><a href="#" className="hover:text-gold">Instagram</a></li>
            <li><a href="#" className="hover:text-gold">TikTok</a></li>
            <li><a href="#" className="hover:text-gold">Facebook</a></li>
            <li><a href="#" className="hover:text-gold">Pinterest</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-white/40 mb-4">Legal</p>
          <ul className="space-y-2 text-sm text-white/60">
            <li><a href="#" className="hover:text-gold">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-gold">Terms &amp; Conditions</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-white/30 tracking-wide">
        © {new Date().getFullYear()} Obsidian Ink Studio. All rights reserved.
      </div>
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '◆' },
  { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
  { href: '/admin/schedule', label: 'Schedule', icon: '🕐' },
  { href: '/admin/gallery', label: 'Gallery', icon: '🖼' },
  { href: '/admin/artists', label: 'Artists', icon: '🧑‍🎨' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: '★' },
  { href: '/admin/content', label: 'Content', icon: '✎' },
  { href: '/admin/activity', label: 'Activity Log', icon: '≡' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore network errors, still redirect
    }
    router.push('/admin/login');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col z-[400] glass-panel border-r border-white/10 pt-28 px-4 pb-6">
        <div className="mb-8 px-2">
          <p className="text-xs tracking-[0.3em] uppercase text-gold/80">Studio Admin</p>
          <p className="font-display text-lg text-gradient-gold mt-1">Obsidian Ink</p>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-cursor-hover
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive(link.href)
                  ? 'bg-gold/10 text-gold border border-gold/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="text-xs w-4 text-center">{link.icon}</span>
              <span className="uppercase tracking-wide text-xs">{link.label}</span>
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          data-cursor-hover
          className="mt-4 px-3 py-2.5 text-xs uppercase tracking-wide border border-white/15 hover:border-crimson hover:text-crimson rounded-lg transition-colors text-white/60"
        >
          Logout
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-[400] glass-panel border-b border-white/10 pt-20 pb-2 px-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-cursor-hover
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] uppercase tracking-wide transition-colors ${
                isActive(link.href)
                  ? 'bg-gold/10 text-gold border border-gold/30'
                  : 'text-white/60 border border-white/10'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            data-cursor-hover
            className="flex-shrink-0 px-3 py-2 text-[10px] uppercase tracking-wide border border-white/15 hover:border-crimson hover:text-crimson rounded-lg transition-colors text-white/60"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

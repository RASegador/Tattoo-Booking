'use client';

/**
 * Obsidian Ink Studio — original hand-built tattoo-themed icon set.
 *
 * All icons are minimal, single-color, stroke-based line art (currentColor),
 * sized via className (e.g. "w-5 h-5") rather than hardcoded pixel dimensions,
 * so they compose cleanly wherever they're used. Nothing here reproduces real
 * tattoo flash art or any copyrighted artwork — these are original geometric
 * interpretations of common tattoo-studio motifs.
 */

import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/* ---------------------------------------------------------------------- */
/* Functional / UI icons                                                  */
/* ---------------------------------------------------------------------- */

export function TattooMachineIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20l3-3" />
      <path d="M6 18l4-4" />
      <rect x="8.5" y="9.5" width="6" height="5" rx="1" transform="rotate(45 11.5 12)" />
      <path d="M13 9l3-3" />
      <path d="M15 7l1.5-1.5a1.8 1.8 0 0 1 2.5 0v0a1.8 1.8 0 0 1 0 2.5L17.5 9.5" />
      <circle cx="18.8" cy="5.2" r="1.4" />
      <path d="M10 15l-1 4h2.4" strokeDasharray="1.5 2" />
    </svg>
  );
}

export function NeedleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 4L9 15" />
      <path d="M9 15l-2.5 6-2-2L9 15z" fill="currentColor" stroke="none" />
      <path d="M13 6l5 5" />
      <path d="M17 3l4 4" />
      <path d="M4.5 19.5l1-1" />
    </svg>
  );
}

export function InkBottleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 3h6" />
      <path d="M10 3v3l-2.4 2.6A3 3 0 0 0 7 10.6V19a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8.4a3 3 0 0 0-.6-1.8L14 6V3" />
      <path d="M7.5 13.5h9" />
      <circle cx="12" cy="16" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <circle cx="8" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="16" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 2" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" />
    </svg>
  );
}

export function GalleryIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M3.5 16.5l5-5 3.5 3.5L16 11l4.5 5.5" />
    </svg>
  );
}

export function AppointmentIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M8.5 14l2.2 2.2L15.5 12" />
    </svg>
  );
}

export function EmailIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.5 6.5l8.5 7 8.5-7" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 3.5h2.7l1.3 4-1.9 1.5a12 12 0 0 0 5.4 5.4l1.5-1.9 4 1.3v2.7a1.8 1.8 0 0 1-1.9 1.8A16.5 16.5 0 0 1 4.7 5.4a1.8 1.8 0 0 1 1.8-1.9z" />
    </svg>
  );
}

export function LocationIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-6.8 7-12a7 7 0 1 0-14 0c0 5.2 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  );
}

export function StarIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base} fill={filled ? 'currentColor' : 'none'} {...props}>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5z" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6l7-3z" />
      <path d="M8.8 12l2.2 2.2 4.2-4.4" />
    </svg>
  );
}

export function HeartIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base} fill={filled ? 'currentColor' : 'none'} {...props}>
      <path d="M12 20.2s-7.6-4.6-9.8-9.4C.9 7.4 2.6 4 6 4c2 0 3.4 1 6 3.6C14.6 5 16 4 18 4c3.4 0 5.1 3.4 3.8 6.8-2.2 4.8-9.8 9.4-9.8 9.4z" />
    </svg>
  );
}

/* ---------------------------------------------------------------------- */
/* Decorative / motif icons                                               */
/* ---------------------------------------------------------------------- */

export function SkullIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c-4.4 0-7.5 3.2-7.5 7.2 0 2.5 1.2 4 2.3 5.1v2.3c0 .7.6 1.4 1.4 1.4h1v1.4h1.6V19h2.4v1.4H15V19h1c.8 0 1.4-.6 1.4-1.4v-2.3c1.1-1.1 2.3-2.6 2.3-5.1C19.5 6.2 16.4 3 12 3z" />
      <circle cx="9.3" cy="11" r="1.5" />
      <circle cx="14.7" cy="11" r="1.5" />
      <path d="M12 12.5v2.2l-1 1h2l-1-1" />
      <path d="M9.5 17h5" />
    </svg>
  );
}

export function RoseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5c1.8 0 3.4 1.3 3.4 3s-1.6 3-3.4 3-3.4-1.3-3.4-3 1.6-3 3.4-3z" />
      <path d="M9.4 5.4c-1.3-.6-3-.2-3.7 1-.7 1.2-.1 2.8 1.2 3.4" />
      <path d="M14.6 5.4c1.3-.6 3-.2 3.7 1 .7 1.2.1 2.8-1.2 3.4" />
      <path d="M12 9.3c1.6.4 2.6 1.8 2.3 3.4-.3 1.6-1.9 2.6-3.5 2.3-1.6-.3-2.6-1.9-2.2-3.4.3-1.4 1.6-2.4 3-2.4" />
      <path d="M12 15c-.4 2-.2 4.2 0 6" />
      <path d="M12 17.5c-1.2-.3-2.4 0-3.2 1" />
      <path d="M12 19.5c1-.6 2.2-.7 3.2-.1" />
    </svg>
  );
}

export function DragonIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 15c1.5-2 3-2.6 4.4-2 .8.4 1 1.4.4 2.1-1 .4-1.7-.2-1.8-1" />
      <path d="M6 13.5c1.8-3.2 4.6-5 7.8-5 2 0 3.6.7 4.8 1.9" />
      <path d="M18.6 10.4c.9-.3 1.8-.1 2.4.5.6.6.8 1.6.4 2.3-.6.3-1.2.1-1.5-.5" />
      <path d="M13.8 8.5c-.2-1.1.3-2 1.2-2.4.9-.4 2 0 2.5.9" />
      <path d="M13.8 8.5c1.6.6 2.6 2 2.5 3.7-.1 2.3-2.1 4.2-4.6 4.5-2 .2-4-.6-5-2.1" />
      <path d="M9 15.5c-1 1.1-1 2.6-.1 3.7" />
      <circle cx="16.7" cy="7.6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SnakeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6c2.5-2 5-2 6.5 0s.5 4-1.5 4.5-3.5.5-3.8 2.4c-.3 2 1.3 3 3.3 2.6 1.5-.3 2-1.5 3.5-1.5s2.5 1 2.2 2.5c-.3 1.3-1.6 2-3 1.8" />
      <path d="M16.8 18.3c1.1-.3 1.9-1.1 2-2.1" />
      <circle cx="6.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
      <path d="M17 15.4l1.6.6-.4 1.7" />
    </svg>
  );
}

export function BarbedWireIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 120 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...props}>
      <path d="M0 8h120" />
      {[10, 30, 50, 70, 90, 110].map((x) => (
        <g key={x}>
          <path d={`M${x} 8l-4-6`} />
          <path d={`M${x} 8l-4 6`} />
          <path d={`M${x} 8l4-6`} />
          <path d={`M${x} 8l4 6`} />
        </g>
      ))}
    </svg>
  );
}

export function TribalPatternIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 120 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M0 12c6-10 12-10 18 0s12 10 18 0 12-10 18 0 12 10 18 0 12-10 18 0 12 10 18 0 12-10 12-10" />
      <path d="M0 12c6 10 12 10 18 0s12-10 18 0 12 10 18 0 12-10 18 0 12 10 18 0 12-10 18 0" opacity="0.45" />
    </svg>
  );
}

export function InkSplatterIcon(props: IconProps & { variant?: 1 | 2 | 3 }) {
  const { variant = 1, ...rest } = props;
  const paths: Record<number, string> = {
    1: 'M50 10c14 0 26 10 30 22 3 9-2 16-11 15-6-1-8 6-15 7-9 1-13-8-21-7-9 1-16-6-14-15 3-13 17-22 31-22z',
    2: 'M48 8c16-3 32 6 34 20 2 11-6 19-17 17-7-1-6 9-16 10-11 1-18-9-16-19 2-4-6-8-4-16 2-8 11-11 19-12z',
    3: 'M52 12c12-4 28 2 32 15 3 10-4 20-15 19-5 0-9 7-17 6-10-1-15-11-12-20 1-6-4-9-2-15 2-6 8-6 14-5z',
  };
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" stroke="none" {...rest}>
      <path d={paths[variant] ?? paths[1]} />
    </svg>
  );
}

export function ToriiIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8.5c3-1.4 15-1.4 18 0" />
      <path d="M4 6.5c2.5-1.2 13.5-1.2 16 0" />
      <path d="M7 6v14" />
      <path d="M17 6v14" />
      <path d="M4 12.5h16" />
    </svg>
  );
}

export function TribalMarkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l3.2 4.5-3.2 3-3.2-3L12 3z" />
      <path d="M12 10.5l4.5 3.2-3 3.2-1.5-1.7-1.5 1.7-3-3.2L12 10.5z" />
      <path d="M12 17.5l2 2.5h-4l2-2.5z" />
    </svg>
  );
}

export function StencilPatternIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" strokeDasharray="2 2.4" />
      <circle cx="12" cy="12" r="5" strokeDasharray="1.6 2" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  );
}

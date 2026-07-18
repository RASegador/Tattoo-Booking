'use client';

import { useEffect, useState } from 'react';

type Sparkle = {
  id: number;
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
};

const SPARKLE_COUNT = 34;

function generateSparkles(): Sparkle[] {
  return Array.from({ length: SPARKLE_COUNT }).map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 2 + Math.random() * 2.5,
    delay: Math.random() * 4,
    duration: 2.2 + Math.random() * 2.4,
  }));
}

/**
 * Small twinkling gold flecks scattered across the background — distinct from
 * the slow drifting smoke in SmokeBackground. Generated client-side only
 * (after mount) to avoid SSR/client hydration mismatches from Math.random().
 */
export default function GoldSparkles() {
  const [sparkles, setSparkles] = useState<Sparkle[] | null>(null);

  useEffect(() => {
    setSparkles(generateSparkles());
  }, []);

  if (!sparkles) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="gold-sparkle absolute animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: '0 0 6px 1px rgba(230,201,121,0.85), 0 0 14px 3px rgba(201,162,75,0.45)',
          }}
        />
      ))}
    </div>
  );
}

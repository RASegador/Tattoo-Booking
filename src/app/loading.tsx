'use client';

import { motion } from 'framer-motion';

/**
 * App Router route-level loading UI — shown automatically during navigation
 * and data fetches for segments that suspend. Themed as ink dropping onto
 * skin and spreading outward, echoing the intro loader's motif but lighter
 * weight since this can appear mid-session.
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9500] flex items-center justify-center bg-ink-black/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-center w-24 h-24">
        {[0, 0.4, 0.8].map((delay) => (
          <motion.span
            key={delay}
            className="absolute w-3 h-3 rounded-full ink-drop"
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 7, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay, ease: 'easeOut' }}
          />
        ))}
        <motion.span
          className="w-3 h-3 rounded-full bg-crimson-light"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

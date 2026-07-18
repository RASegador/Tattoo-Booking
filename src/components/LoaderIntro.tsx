'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function LoaderIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-ink-black"
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
        >
          <div className="relative flex flex-col items-center gap-6">
            {/* Ink-spreading rings — mimics a drop of ink hitting skin/paper */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[0, 0.5, 1].map((delay) => (
                <motion.span
                  key={delay}
                  className="absolute w-3 h-3 rounded-full ink-drop"
                  initial={{ scale: 0, opacity: 0.9 }}
                  animate={{ scale: 9, opacity: 0 }}
                  transition={{ duration: 2.2, repeat: Infinity, delay, ease: 'easeOut' }}
                />
              ))}
            </div>

            <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="relative">
              <motion.circle
                cx="70"
                cy="70"
                r="54"
                stroke="#c9a24b"
                strokeWidth="1"
                strokeDasharray="6 6"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '70px 70px' }}
              />
              <motion.circle
                cx="70"
                cy="70"
                r="8"
                fill="#b3122e"
                initial={{ scale: 0, opacity: 0.9 }}
                animate={{ scale: [0, 1.1, 1], opacity: [0.9, 1, 0.85] }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              />
              <motion.path
                d="M40 90 Q 55 40 70 55 Q 85 70 100 30"
                stroke="#e0193b"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                className="tattoo-line"
              />
              <motion.text
                x="70"
                y="78"
                textAnchor="middle"
                fontFamily="var(--font-cinzel)"
                fontSize="20"
                fill="#f5f5f0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.6 }}
              >
                OI
              </motion.text>
            </svg>
            <motion.p
              className="text-xs tracking-[0.4em] text-white/50 font-body uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.6 }}
            >
              Obsidian Ink Studio
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

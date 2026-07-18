'use client';

import { useRef, type ComponentType } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { Category } from '@/lib/data';
import {
  DragonIcon,
  InkBottleIcon,
  NeedleIcon,
  RoseIcon,
  SkullIcon,
  StencilPatternIcon,
  ToriiIcon,
  TribalMarkIcon,
} from '@/components/icons/TattooIcons';
import type { IconProps } from '@/components/icons/TattooIcons';

const CATEGORY_ICONS: Record<string, ComponentType<IconProps>> = {
  'black-grey': SkullIcon,
  realism: DragonIcon,
  traditional: NeedleIcon,
  'neo-traditional': RoseIcon,
  japanese: ToriiIcon,
  tribal: TribalMarkIcon,
  'fine-line': NeedleIcon,
  minimalist: StencilPatternIcon,
  lettering: NeedleIcon,
  floral: RoseIcon,
  geometric: StencilPatternIcon,
  color: InkBottleIcon,
};

export default function FolderCard({
  category,
  index,
  onOpen,
}: {
  category: Category;
  index: number;
  onOpen: (slug: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const CategoryIcon = CATEGORY_ICONS[category.slug];

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08 }}
      className="perspective-1000"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => onOpen(category.slug)}
        data-cursor-hover
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5 + (index % 3), repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
        whileHover={{ scale: 1.06, y: -14 }}
        whileTap={{ scale: 0.98 }}
        className="card-hover-red group relative cursor-pointer rounded-2xl p-8 h-56 flex flex-col justify-between overflow-hidden glass-panel border border-white/10 hover:border-gold-light/50 transition-colors duration-300"
      >
        {/* glow */}
        <div className="absolute -inset-1 bg-gradient-to-br from-gold/0 via-gold/0 to-gold/0 group-hover:from-gold/20 group-hover:via-transparent group-hover:to-gold-light/15 transition-all duration-500 pointer-events-none" />

        {/* folder corner fold */}
        <motion.div
          className="absolute top-0 right-0 w-10 h-10 bg-white/5"
          style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
          whileHover={{ scale: 1.4 }}
        />

        <div className="flex items-start justify-between" style={{ transform: 'translateZ(40px)' }}>
          {CategoryIcon ? (
            <CategoryIcon className="w-9 h-9 text-gold-light drop-shadow-[0_0_10px_rgba(201,162,75,0.55)]" aria-hidden />
          ) : (
            <span className="text-4xl drop-shadow-[0_0_12px_rgba(201,162,75,0.4)]">{category.icon}</span>
          )}
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 group-hover:text-gold/70 transition-colors">
            {category.count ?? 0} pieces
          </span>
        </div>

        <div style={{ transform: 'translateZ(30px)' }}>
          <h3 className="font-display text-xl text-white group-hover:text-gold transition-colors">{category.name}</h3>
          <p className="text-xs text-white/40 mt-2 leading-relaxed">{category.description}</p>
        </div>

        {/* floating spark on hover */}
        <motion.span
          className="absolute bottom-4 right-4 text-lg text-gold-light opacity-0 group-hover:opacity-70"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✦
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

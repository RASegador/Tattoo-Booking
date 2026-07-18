'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  r: number;
  speedY: number;
  speedX: number;
  alpha: number;
  hue: 'gold' | 'crimson' | 'cyan';
};

export default function SmokeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors: Record<Particle['hue'], string> = {
      gold: '201,162,75',
      crimson: '179,18,46',
      cyan: '63,240,224',
    };

    const particles: Particle[] = Array.from({ length: 46 }).map(() => ({
      x: Math.random() * width,
      y: height + Math.random() * height,
      r: 40 + Math.random() * 120,
      speedY: 0.15 + Math.random() * 0.35,
      speedX: (Math.random() - 0.5) * 0.2,
      alpha: 0.02 + Math.random() * 0.05,
      hue: (() => {
        const r = Math.random();
        if (r < 0.45) return 'crimson';
        if (r < 0.9) return 'gold';
        return 'cyan';
      })(),
    }));

    let raf = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        if (p.y + p.r < 0) {
          p.y = height + p.r;
          p.x = Math.random() * width;
        }
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        gradient.addColorStop(0, `rgba(${colors[p.hue]},${p.alpha})`);
        gradient.addColorStop(1, `rgba(${colors[p.hue]},0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(render);
    };
    render();

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-crimson/20 rounded-full blur-[140px] animate-glowPulse" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[140px] animate-glowPulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan/10 rounded-full blur-[140px] animate-glowPulse" style={{ animationDelay: '3s' }} />
      <div className="absolute inset-0 bg-noise opacity-40" />
    </div>
  );
}

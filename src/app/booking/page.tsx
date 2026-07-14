import type { Metadata } from 'next';
import BookingWizard from '@/components/booking/BookingWizard';

export const metadata: Metadata = {
  title: 'Book Your Session — Obsidian Ink Studio',
  description: 'Book your custom tattoo appointment online at Obsidian Ink Studio.',
};

export default function BookingPage() {
  return (
    <section className="relative min-h-screen pt-40 pb-24 px-6">
      <div className="mx-auto max-w-3xl text-center mb-14">
        <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Reserve Your Session</p>
        <h1 className="font-display text-4xl md:text-5xl">
          Begin Your <span className="text-gradient-gold">Ink Journey</span>
        </h1>
        <p className="text-white/50 mt-5">
          A few simple steps and your consultation request is on its way to our studio.
        </p>
      </div>
      <BookingWizard />
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

type DisplayReview = {
  id: string | number;
  name: string;
  avatarUrl: string;
  rating: number;
  tattooImage: string;
  text: string;
  date: string;
  verified: boolean;
};

function isDataUrl(src: string) {
  return src.startsWith('data:');
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          data-cursor-hover
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={`text-2xl leading-none transition-colors ${n <= value ? 'text-gold' : 'text-white/20 hover:text-white/40'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handlePhotoChange = (file: File | null) => {
    if (!file) {
      setPhoto(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/public/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, review_text: reviewText, tattoo_image: photo || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Could not submit your review. Please try again.');
      }
      setSent(true);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div className="text-center mb-16">
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-cursor-hover
          className="px-6 py-3 border border-gold/40 text-gold text-sm uppercase tracking-[0.2em] hover:bg-gold hover:text-ink-black transition-all duration-300"
        >
          Leave a Review
        </button>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="glass-panel rounded-2xl border border-gold/30 p-8 max-w-xl mx-auto mb-16 text-center">
        <p className="text-4xl mb-3">✦</p>
        <p className="font-display text-xl mb-2">Thank You</p>
        <p className="text-sm text-white/60 leading-relaxed">
          Your review has been submitted and is pending approval. Once we review it, it&rsquo;ll appear here on the site.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-white/10 p-8 max-w-xl mx-auto mb-16">
      <div className="flex items-center justify-between mb-6">
        <p className="font-display text-xl">Share Your Experience</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          data-cursor-hover
          aria-label="Close review form"
          className="text-white/40 hover:text-gold transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <div>
          <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Your Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Rating</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Your Review</label>
          <textarea
            required
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell us about your experience at the studio…"
            className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold outline-none transition-colors resize-none"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Photo of Your Tattoo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
            className="text-sm text-white/60"
          />
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-white/10 mt-3" />
          )}
        </div>
        {error && <p className="text-xs text-gold-light/90 leading-relaxed">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          data-cursor-hover
          className="w-full py-4 bg-gold hover:bg-gold-light text-ink-black transition-colors text-sm tracking-[0.2em] uppercase font-medium disabled:opacity-60"
        >
          {loading ? 'Submitting…' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

export default function Reviews() {
  // Starts empty on purpose — no placeholder/fake reviews. The grid only
  // ever shows real, admin-approved customer submissions.
  const [reviews, setReviews] = useState<DisplayReview[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/public/testimonials');
      const data = await res.json();
      if (Array.isArray(data?.testimonials)) {
        setReviews(
          data.testimonials.map((t: any) => ({
            id: t.id,
            name: t.name,
            avatarUrl: t.avatar_url,
            rating: t.rating,
            tattooImage: t.tattoo_image,
            text: t.review_text,
            date: t.review_date,
            verified: t.verified,
          }))
        );
      }
    } catch {
      // keep the list empty on failure
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <section id="reviews" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Client Stories</p>
          <h2 className="font-display text-4xl md:text-5xl">
            Voices From <span className="text-gradient-gold">The Chair</span>
          </h2>
        </motion.div>

        <ReviewForm onSubmitted={loadReviews} />

        {loaded && reviews.length === 0 ? (
          <p className="text-center text-white/40 text-sm max-w-md mx-auto">
            No reviews yet — be the first to share your experience at the studio.
          </p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-gold/40 transition-colors"
            >
              <div className="relative h-40 w-full">
                {!r.tattooImage ? (
                  <div className="absolute inset-0 grunge-texture" />
                ) : isDataUrl(r.tattooImage) ? (
                  <img
                    src={r.tattooImage}
                    alt={`Tattoo for ${r.name}`}
                    className="absolute inset-0 w-full h-full object-cover grayscale contrast-125"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                ) : (
                  <Image
                    src={r.tattooImage}
                    alt={`Tattoo for ${r.name}`}
                    fill
                    className="object-cover grayscale contrast-125"
                    sizes="33vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gold/40 flex items-center justify-center bg-gold/10">
                    {!r.avatarUrl ? (
                      <span className="text-gold text-sm font-display">
                        {r.name.trim().charAt(0).toUpperCase() || '?'}
                      </span>
                    ) : isDataUrl(r.avatarUrl) ? (
                      <img
                        src={r.avatarUrl}
                        alt={r.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    ) : (
                      <Image
                        src={r.avatarUrl}
                        alt={r.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white flex items-center gap-1.5">
                      {r.name}
                      {r.verified && <span className="text-cyan text-xs" title="Verified client">✓</span>}
                    </p>
                    <p className="text-xs text-white/40">{r.date}</p>
                  </div>
                </div>
                <div className="text-gold text-sm mb-3">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p className="text-sm text-white/60 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';

type Testimonial = {
  id: string;
  name: string;
  avatar_url: string;
  rating: number;
  tattoo_image: string;
  review_text: string;
  review_date: string;
  verified: boolean;
  approved: boolean;
  created_at: string;
};

type NewTestimonialForm = {
  name: string;
  avatar_url: string;
  rating: number;
  tattoo_image: string;
  review_text: string;
  review_date: string;
  verified: boolean;
};

const emptyForm: NewTestimonialForm = {
  name: '',
  avatar_url: '',
  rating: 5,
  tattoo_image: '',
  review_text: '',
  review_date: '',
  verified: false,
};

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          data-cursor-hover
          className={`text-xl leading-none ${n <= value ? 'text-gold' : 'text-white/20'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<NewTestimonialForm>(emptyForm);
  const [tattooImageFile, setTattooImageFile] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Testimonial>>({});

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/testimonials', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch {
      setError('Could not load testimonials.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setTattooImageFile('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setTattooImageFile(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.review_text.trim()) {
      setError('Name and review text are required.');
      return;
    }
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          avatar_url: form.avatar_url,
          rating: form.rating,
          tattoo_image: tattooImageFile || form.tattoo_image,
          review_text: form.review_text,
          review_date: form.review_date,
          verified: form.verified,
          approved: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not add testimonial.');
        return;
      }
      setTestimonials((prev) => [data.testimonial, ...prev]);
      setForm(emptyForm);
      setTattooImageFile('');
    } catch {
      setError('Network error.');
    }
  };

  const handleToggleApproved = async (t: Testimonial) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: !t.approved }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Failed');
      setTestimonials((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...data.testimonial } : x)));
    } catch {
      setError('Could not update testimonial.');
    }
  };

  const handleSaveEdit = async (id: string) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDraft),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not update testimonial.');
        return;
      }
      setTestimonials((prev) => prev.map((x) => (x.id === id ? { ...x, ...data.testimonial } : x)));
      setEditId(null);
      setEditDraft({});
    } catch {
      setError('Network error.');
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
      setTestimonials((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError('Could not delete testimonial.');
    }
  };

  return (
    <section className="relative pb-10">
      <div className="mb-10">
        <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Studio Admin</p>
        <h1 className="font-display text-4xl md:text-5xl">
          Testimonials <span className="text-gradient-gold">Management</span>
        </h1>
      </div>

      {error && (
        <div className="glass-panel rounded-xl p-6 border border-crimson/30 text-crimson-light text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel rounded-xl p-16 text-center border border-white/10">
          <p className="text-white/40 text-sm uppercase tracking-wide">Loading testimonials...</p>
        </div>
      ) : (
        <>
          {testimonials.length === 0 ? (
            <div className="glass-panel rounded-xl p-16 text-center border border-white/10 mb-10">
              <p className="text-white/50">No testimonials yet.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-10">
              {testimonials.map((t) => (
                <div key={t.id} className="glass-panel rounded-xl p-6 border border-white/10">
                  {editId === t.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        defaultValue={t.name}
                        onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                        placeholder="Name"
                        className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
                      />
                      <textarea
                        defaultValue={t.review_text}
                        onChange={(e) => setEditDraft((d) => ({ ...d, review_text: e.target.value }))}
                        rows={3}
                        className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        defaultValue={t.review_date}
                        onChange={(e) => setEditDraft((d) => ({ ...d, review_date: e.target.value }))}
                        placeholder="Review date"
                        className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
                      />
                      <StarPicker
                        value={editDraft.rating ?? t.rating}
                        onChange={(v) => setEditDraft((d) => ({ ...d, rating: v }))}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(t.id)}
                          data-cursor-hover
                          className="px-3 py-1.5 text-xs uppercase border border-cyan/40 text-cyan rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditId(null);
                            setEditDraft({});
                          }}
                          data-cursor-hover
                          className="px-3 py-1.5 text-xs uppercase border border-white/15 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-[1fr_auto] gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <p className="font-display text-lg">{t.name}</p>
                          <span className="text-gold text-sm">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span>
                          {t.verified && (
                            <span className="text-[10px] uppercase tracking-wide text-cyan border border-cyan/40 bg-cyan/10 px-2 py-0.5 rounded-full">
                              Verified
                            </span>
                          )}
                          <span
                            className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                              t.approved
                                ? 'text-cyan border-cyan/40 bg-cyan/10'
                                : 'text-gold border-gold/40 bg-gold/10'
                            }`}
                          >
                            {t.approved ? 'Approved' : 'Pending Approval'}
                          </span>
                        </div>
                        <p className="text-sm text-white/70">{t.review_text}</p>
                        <p className="text-xs text-white/40 mt-2">{t.review_date}</p>
                        {t.tattoo_image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={t.tattoo_image}
                            alt={t.name}
                            className="w-24 h-24 object-cover rounded-lg border border-white/10 mt-3"
                          />
                        )}
                      </div>
                      <div className="flex flex-wrap items-start gap-2 md:justify-end">
                        <button
                          onClick={() => handleToggleApproved(t)}
                          data-cursor-hover
                          className="px-3 py-2 text-xs uppercase border border-white/15 hover:border-cyan hover:text-cyan rounded-lg transition-colors"
                        >
                          {t.approved ? 'Unapprove' : 'Approve'}
                        </button>
                        <button
                          onClick={() => setEditId(t.id)}
                          data-cursor-hover
                          className="px-3 py-2 text-xs uppercase border border-white/15 hover:border-gold hover:text-gold rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          data-cursor-hover
                          className="px-3 py-2 text-xs uppercase border border-white/15 hover:border-crimson hover:text-crimson rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="glass-panel rounded-xl p-6 border border-white/10">
            <h2 className="font-display text-xl mb-6">Add Testimonial</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Name"
                  className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
                <input
                  type="text"
                  value={form.avatar_url}
                  onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
                  placeholder="Avatar URL (optional)"
                  className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Rating</label>
                <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
              </div>

              <textarea
                value={form.review_text}
                onChange={(e) => setForm((f) => ({ ...f, review_text: e.target.value }))}
                placeholder="Review text"
                rows={3}
                className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.review_date}
                  onChange={(e) => setForm((f) => ({ ...f, review_date: e.target.value }))}
                  placeholder="Review date (e.g. March 2026)"
                  className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
                <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/50 cursor-pointer" data-cursor-hover>
                  <input
                    type="checkbox"
                    checked={form.verified}
                    onChange={(e) => setForm((f) => ({ ...f, verified: e.target.checked }))}
                  />
                  Verified
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-3 items-start">
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Upload Tattoo Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="text-sm text-white/60"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Or Image URL</label>
                  <input
                    type="text"
                    value={form.tattoo_image}
                    onChange={(e) => setForm((f) => ({ ...f, tattoo_image: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {tattooImageFile && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tattooImageFile} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
              )}

              <button
                type="submit"
                data-cursor-hover
                className="px-6 py-3 bg-crimson hover:bg-crimson-light text-sm uppercase tracking-wide transition-colors rounded-lg"
              >
                Add Testimonial
              </button>
            </form>
          </div>
        </>
      )}
    </section>
  );
}

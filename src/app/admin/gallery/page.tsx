'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatPHPRange } from '@/lib/currency';

type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  sort_order: number;
};

type Artwork = {
  id: string;
  category_slug: string;
  title: string;
  image_data: string;
  placement: string;
  size: string;
  duration: string;
  price_min: number | null;
  price_max: number | null;
  description: string;
  featured: boolean;
  created_at: string;
};

type NewCategoryForm = {
  name: string;
  icon: string;
  description: string;
  sort_order: string;
};

type NewArtworkForm = {
  title: string;
  placement: string;
  size: string;
  duration: string;
  priceMin: string;
  priceMax: string;
  description: string;
  imageUrl: string;
};

const emptyNewCategory: NewCategoryForm = { name: '', icon: '', description: '', sort_order: '0' };
const emptyNewArtwork: NewArtworkForm = {
  title: '',
  placement: '',
  size: '',
  duration: '',
  priceMin: '',
  priceMax: '',
  description: '',
  imageUrl: '',
};

export default function AdminGalleryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingArtworks, setLoadingArtworks] = useState(false);
  const [error, setError] = useState('');

  const [newCategory, setNewCategory] = useState<NewCategoryForm>(emptyNewCategory);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editCategoryDraft, setEditCategoryDraft] = useState<Partial<Category>>({});

  const [newArtwork, setNewArtwork] = useState<NewArtworkForm>(emptyNewArtwork);
  const [newArtworkFile, setNewArtworkFile] = useState<string>('');
  const [editArtworkId, setEditArtworkId] = useState<string | null>(null);
  const [editArtworkDraft, setEditArtworkDraft] = useState<Partial<Artwork>>({});

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch('/api/admin/gallery/categories', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const cats: Category[] = data.categories || [];
      setCategories(cats);
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0].slug);
      }
    } catch {
      setError('Could not load categories.');
    } finally {
      setLoadingCategories(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchArtworks = useCallback(async (slug: string) => {
    if (!slug) {
      setArtworks([]);
      return;
    }
    setLoadingArtworks(true);
    try {
      const res = await fetch(`/api/admin/gallery/artworks?category=${encodeURIComponent(slug)}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setArtworks(data.artworks || []);
    } catch {
      setError('Could not load artworks.');
    } finally {
      setLoadingArtworks(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategory) fetchArtworks(selectedCategory);
  }, [selectedCategory, fetchArtworks]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newCategory.name.trim()) return;
    try {
      const res = await fetch('/api/admin/gallery/categories', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name,
          icon: newCategory.icon,
          description: newCategory.description,
          sort_order: Number(newCategory.sort_order) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not add category.');
        return;
      }
      setCategories((prev) => [...prev, data.category]);
      setNewCategory(emptyNewCategory);
    } catch {
      setError('Network error.');
    }
  };

  const handleSaveCategory = async (id: string) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/gallery/categories/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCategoryDraft),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not update category.');
        return;
      }
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data.category } : c)));
      setEditCategoryId(null);
      setEditCategoryDraft({});
    } catch {
      setError('Network error.');
    }
  };

  const handleDeleteCategory = async (id: string, slug: string) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/gallery/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (selectedCategory === slug) setSelectedCategory('');
    } catch {
      setError('Could not delete category.');
    }
  };

  const handleArtworkFileChange = (file: File | null) => {
    if (!file) {
      setNewArtworkFile('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setNewArtworkFile(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedCategory) {
      setError('Select a category first.');
      return;
    }
    const imageData = newArtworkFile || newArtwork.imageUrl;
    if (!imageData) {
      setError('Provide an image file or URL.');
      return;
    }
    try {
      const res = await fetch('/api/admin/gallery/artworks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_slug: selectedCategory,
          title: newArtwork.title,
          image_data: imageData,
          placement: newArtwork.placement,
          size: newArtwork.size,
          duration: newArtwork.duration,
          price_min: newArtwork.priceMin ? Number(newArtwork.priceMin) : null,
          price_max: newArtwork.priceMax ? Number(newArtwork.priceMax) : null,
          description: newArtwork.description,
          featured: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not add artwork.');
        return;
      }
      setArtworks((prev) => [...prev, data.artwork]);
      setNewArtwork(emptyNewArtwork);
      setNewArtworkFile('');
    } catch {
      setError('Network error.');
    }
  };

  const handleToggleFeatured = async (a: Artwork) => {
    try {
      const res = await fetch(`/api/admin/gallery/artworks/${a.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !a.featured }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Failed');
      setArtworks((prev) => prev.map((w) => (w.id === a.id ? { ...w, ...data.artwork } : w)));
    } catch {
      setError('Could not update artwork.');
    }
  };

  const handleSaveArtwork = async (id: string) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/gallery/artworks/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editArtworkDraft),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not update artwork.');
        return;
      }
      setArtworks((prev) => prev.map((w) => (w.id === id ? { ...w, ...data.artwork } : w)));
      setEditArtworkId(null);
      setEditArtworkDraft({});
    } catch {
      setError('Network error.');
    }
  };

  const handleDeleteArtwork = async (id: string) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/gallery/artworks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
      setArtworks((prev) => prev.filter((w) => w.id !== id));
    } catch {
      setError('Could not delete artwork.');
    }
  };

  return (
    <section className="relative pb-10">
      <div className="mb-10">
        <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Studio Admin</p>
        <h1 className="font-display text-4xl md:text-5xl">
          Gallery <span className="text-gradient-gold">Management</span>
        </h1>
      </div>

      {error && (
        <div className="glass-panel rounded-xl p-6 border border-crimson/30 text-crimson-light text-sm mb-6">
          {error}
        </div>
      )}

      <div className="glass-panel rounded-xl p-6 border border-white/10 mb-10">
        <h2 className="font-display text-xl mb-6">
          Categories
        </h2>

        {loadingCategories ? (
          <p className="text-white/40 text-sm">Loading categories...</p>
        ) : (
          <div className="space-y-3 mb-6">
            {categories.map((c) => (
              <div key={c.id} className="border border-white/10 rounded-lg p-4">
                {editCategoryId === c.id ? (
                  <div className="grid md:grid-cols-[80px_1fr_2fr_100px_auto_auto] gap-2 items-center">
                    <input
                      type="text"
                      defaultValue={c.icon}
                      onChange={(e) => setEditCategoryDraft((d) => ({ ...d, icon: e.target.value }))}
                      className="bg-white/5 border border-white/15 rounded-lg px-2 py-2 text-sm focus:border-gold focus:outline-none"
                    />
                    <input
                      type="text"
                      defaultValue={c.name}
                      onChange={(e) => setEditCategoryDraft((d) => ({ ...d, name: e.target.value }))}
                      className="bg-white/5 border border-white/15 rounded-lg px-2 py-2 text-sm focus:border-gold focus:outline-none"
                    />
                    <input
                      type="text"
                      defaultValue={c.description}
                      onChange={(e) => setEditCategoryDraft((d) => ({ ...d, description: e.target.value }))}
                      className="bg-white/5 border border-white/15 rounded-lg px-2 py-2 text-sm focus:border-gold focus:outline-none"
                    />
                    <input
                      type="number"
                      defaultValue={c.sort_order}
                      onChange={(e) => setEditCategoryDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))}
                      className="bg-white/5 border border-white/15 rounded-lg px-2 py-2 text-sm focus:border-gold focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveCategory(c.id)}
                      data-cursor-hover
                      className="px-3 py-2 text-xs uppercase border border-cyan/40 text-cyan rounded-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditCategoryId(null);
                        setEditCategoryDraft({});
                      }}
                      data-cursor-hover
                      className="px-3 py-2 text-xs uppercase border border-white/15 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{c.icon}</span>
                      <div>
                        <p className="font-display">{c.name}</p>
                        <p className="text-xs text-white/40">{c.description} · order {c.sort_order}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCategory(c.slug)}
                        data-cursor-hover
                        className={`px-3 py-1.5 text-xs uppercase border rounded-lg transition-colors ${
                          selectedCategory === c.slug ? 'border-gold text-gold' : 'border-white/15 text-white/60'
                        }`}
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditCategoryId(c.id);
                          setEditCategoryDraft({});
                        }}
                        data-cursor-hover
                        className="px-3 py-1.5 text-xs uppercase border border-white/15 hover:border-gold hover:text-gold rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id, c.slug)}
                        data-cursor-hover
                        className="px-3 py-1.5 text-xs uppercase border border-white/15 hover:border-crimson hover:text-crimson rounded-lg transition-colors"
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

        <form onSubmit={handleAddCategory} className="grid md:grid-cols-[80px_1fr_2fr_100px_auto] gap-2">
          <input
            type="text"
            value={newCategory.icon}
            onChange={(e) => setNewCategory((f) => ({ ...f, icon: e.target.value }))}
            placeholder="Icon"
            className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) => setNewCategory((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            required
            className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <input
            type="text"
            value={newCategory.description}
            onChange={(e) => setNewCategory((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <input
            type="number"
            value={newCategory.sort_order}
            onChange={(e) => setNewCategory((f) => ({ ...f, sort_order: e.target.value }))}
            placeholder="Order"
            className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            data-cursor-hover
            className="px-4 py-2 border border-gold text-gold text-xs uppercase tracking-wide hover:bg-gold hover:text-ink-black transition-all rounded-lg"
          >
            Add Category
          </button>
        </form>
      </div>

      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="font-display text-xl">Artworks</h2>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {loadingArtworks ? (
          <p className="text-white/40 text-sm mb-6">Loading artworks...</p>
        ) : artworks.length === 0 ? (
          <p className="text-white/40 text-sm mb-6">No artworks in this category yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {artworks.map((a) => (
              <div key={a.id} className="border border-white/10 rounded-lg overflow-hidden">
                {a.image_data && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image_data} alt={a.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  {editArtworkId === a.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        defaultValue={a.title}
                        onChange={(e) => setEditArtworkDraft((d) => ({ ...d, title: e.target.value }))}
                        placeholder="Title"
                        className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        defaultValue={a.placement}
                        onChange={(e) => setEditArtworkDraft((d) => ({ ...d, placement: e.target.value }))}
                        placeholder="Placement"
                        className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        defaultValue={a.size}
                        onChange={(e) => setEditArtworkDraft((d) => ({ ...d, size: e.target.value }))}
                        placeholder="Size"
                        className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        defaultValue={a.duration}
                        onChange={(e) => setEditArtworkDraft((d) => ({ ...d, duration: e.target.value }))}
                        placeholder="Duration"
                        className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          defaultValue={a.price_min ?? ''}
                          onChange={(e) =>
                            setEditArtworkDraft((d) => ({ ...d, price_min: e.target.value ? Number(e.target.value) : null }))
                          }
                          placeholder="Price Min (₱)"
                          className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
                        />
                        <input
                          type="number"
                          defaultValue={a.price_max ?? ''}
                          onChange={(e) =>
                            setEditArtworkDraft((d) => ({ ...d, price_max: e.target.value ? Number(e.target.value) : null }))
                          }
                          placeholder="Price Max (₱)"
                          className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
                        />
                      </div>
                      <textarea
                        defaultValue={a.description}
                        onChange={(e) => setEditArtworkDraft((d) => ({ ...d, description: e.target.value }))}
                        placeholder="Description"
                        rows={2}
                        className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveArtwork(a.id)}
                          data-cursor-hover
                          className="px-3 py-1.5 text-xs uppercase border border-cyan/40 text-cyan rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditArtworkId(null);
                            setEditArtworkDraft({});
                          }}
                          data-cursor-hover
                          className="px-3 py-1.5 text-xs uppercase border border-white/15 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-display text-sm">{a.title || 'Untitled'}</p>
                        {a.featured && (
                          <span className="text-[10px] uppercase tracking-wide text-gold border border-gold/40 bg-gold/10 px-2 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mb-1">
                        {a.placement} · {a.size} · {a.duration}
                      </p>
                      <p className="text-xs text-white/40 mb-2">{formatPHPRange(a.price_min, a.price_max)}</p>
                      <p className="text-xs text-white/60 mb-3 line-clamp-2">{a.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleToggleFeatured(a)}
                          data-cursor-hover
                          className="px-3 py-1.5 text-xs uppercase border border-white/15 hover:border-gold hover:text-gold rounded-lg transition-colors"
                        >
                          {a.featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          onClick={() => setEditArtworkId(a.id)}
                          data-cursor-hover
                          className="px-3 py-1.5 text-xs uppercase border border-white/15 hover:border-cyan hover:text-cyan rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteArtwork(a.id)}
                          data-cursor-hover
                          className="px-3 py-1.5 text-xs uppercase border border-white/15 hover:border-crimson hover:text-crimson rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-white/10 pt-6">
          <h3 className="font-display text-lg mb-4">Add Artwork</h3>
          <form onSubmit={handleAddArtwork} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input
                type="text"
                value={newArtwork.title}
                onChange={(e) => setNewArtwork((f) => ({ ...f, title: e.target.value }))}
                placeholder="Title"
                className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
              <input
                type="text"
                value={newArtwork.placement}
                onChange={(e) => setNewArtwork((f) => ({ ...f, placement: e.target.value }))}
                placeholder="Placement"
                className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
              <input
                type="text"
                value={newArtwork.size}
                onChange={(e) => setNewArtwork((f) => ({ ...f, size: e.target.value }))}
                placeholder="Size"
                className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
              <input
                type="text"
                value={newArtwork.duration}
                onChange={(e) => setNewArtwork((f) => ({ ...f, duration: e.target.value }))}
                placeholder="Duration"
                className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
              <input
                type="number"
                value={newArtwork.priceMin}
                onChange={(e) => setNewArtwork((f) => ({ ...f, priceMin: e.target.value }))}
                placeholder="Price Min (₱)"
                className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
              <input
                type="number"
                value={newArtwork.priceMax}
                onChange={(e) => setNewArtwork((f) => ({ ...f, priceMax: e.target.value }))}
                placeholder="Price Max (₱)"
                className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <textarea
              value={newArtwork.description}
              onChange={(e) => setNewArtwork((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description"
              rows={2}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
            />
            <div className="grid md:grid-cols-2 gap-3 items-start">
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleArtworkFileChange(e.target.files?.[0] || null)}
                  className="text-sm text-white/60"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Or Image URL</label>
                <input
                  type="text"
                  value={newArtwork.imageUrl}
                  onChange={(e) => setNewArtwork((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>
            </div>
            {newArtworkFile && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={newArtworkFile} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-white/10" />
            )}
            <button
              type="submit"
              data-cursor-hover
              className="px-6 py-3 bg-crimson hover:bg-crimson-light text-sm uppercase tracking-wide transition-colors rounded-lg"
            >
              Add Artwork
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

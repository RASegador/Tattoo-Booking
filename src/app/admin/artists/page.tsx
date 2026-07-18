'use client';

import { useCallback, useEffect, useState } from 'react';

type Artist = {
  id: string;
  slug: string;
  name: string;
  bio: string;
  photo_data: string;
  specialties: string[];
  years_experience: number | null;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  available: boolean;
  availability_note: string;
  active: boolean;
  featured: boolean;
  sort_order: number;
};

type NewArtistForm = {
  name: string;
  bio: string;
  specialties: string;
  years_experience: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  availability_note: string;
  sort_order: string;
  imageUrl: string;
};

const emptyNewArtist: NewArtistForm = {
  name: '',
  bio: '',
  specialties: '',
  years_experience: '',
  instagram_url: '',
  facebook_url: '',
  tiktok_url: '',
  availability_note: '',
  sort_order: '0',
  imageUrl: '',
};

const inputClass =
  'w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none';

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newArtist, setNewArtist] = useState<NewArtistForm>(emptyNewArtist);
  const [newArtistFile, setNewArtistFile] = useState<string>('');

  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, unknown>>({});

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/artists', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setArtists(data.artists || []);
    } catch {
      setError('Could not load artists.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setNewArtistFile('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setNewArtistFile(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newArtist.name.trim()) return;
    try {
      const res = await fetch('/api/admin/artists', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newArtist.name,
          bio: newArtist.bio,
          photo_data: newArtistFile || newArtist.imageUrl,
          specialties: newArtist.specialties
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          years_experience: newArtist.years_experience ? Number(newArtist.years_experience) : null,
          instagram_url: newArtist.instagram_url,
          facebook_url: newArtist.facebook_url,
          tiktok_url: newArtist.tiktok_url,
          availability_note: newArtist.availability_note,
          sort_order: Number(newArtist.sort_order) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not add artist.');
        return;
      }
      setArtists((prev) => [...prev, data.artist]);
      setNewArtist(emptyNewArtist);
      setNewArtistFile('');
    } catch {
      setError('Network error.');
    }
  };

  const patchArtist = async (id: string, body: Record<string, unknown>) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/artists/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not update artist.');
        return false;
      }
      setArtists((prev) => prev.map((a) => (a.id === id ? { ...a, ...data.artist } : a)));
      return true;
    } catch {
      setError('Network error.');
      return false;
    }
  };

  const handleToggleActive = (a: Artist) => patchArtist(a.id, { active: !a.active });
  const handleToggleAvailable = (a: Artist) => patchArtist(a.id, { available: !a.available });
  const handleToggleFeatured = (a: Artist) => patchArtist(a.id, { featured: !a.featured });

  const handleSaveEdit = async (id: string) => {
    const ok = await patchArtist(id, editDraft);
    if (ok) {
      setEditId(null);
      setEditDraft({});
    }
  };

  const handleDeleteArtist = async (id: string) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/artists/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      setArtists((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError('Could not delete artist.');
    }
  };

  return (
    <section className="relative pb-10">
      <div className="mb-10">
        <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Studio Admin</p>
        <h1 className="font-display text-4xl md:text-5xl">
          Artist <span className="text-gradient-gold">Management</span>
        </h1>
      </div>

      {error && (
        <div className="glass-panel rounded-xl p-6 border border-crimson/30 text-crimson-light text-sm mb-6">
          {error}
        </div>
      )}

      <div className="glass-panel rounded-xl p-6 border border-white/10 mb-10">
        <h2 className="font-display text-xl mb-6">Artists</h2>

        {loading ? (
          <p className="text-white/40 text-sm">Loading artists...</p>
        ) : artists.length === 0 ? (
          <p className="text-white/40 text-sm mb-6">No artists yet — add one below.</p>
        ) : (
          <div className="space-y-4 mb-8">
            {artists.map((a) => (
              <div key={a.id} className="border border-white/10 rounded-lg p-4">
                {editId === a.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      defaultValue={a.name}
                      onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Name"
                      className={inputClass}
                    />
                    <textarea
                      defaultValue={a.bio}
                      onChange={(e) => setEditDraft((d) => ({ ...d, bio: e.target.value }))}
                      placeholder="Bio"
                      rows={3}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      defaultValue={a.specialties.join(', ')}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          specialties: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        }))
                      }
                      placeholder="Specialties (comma separated)"
                      className={inputClass}
                    />
                    <div className="grid md:grid-cols-2 gap-2">
                      <input
                        type="number"
                        defaultValue={a.years_experience ?? ''}
                        onChange={(e) => setEditDraft((d) => ({ ...d, years_experience: Number(e.target.value) }))}
                        placeholder="Years of experience"
                        className={inputClass}
                      />
                      <input
                        type="number"
                        defaultValue={a.sort_order}
                        onChange={(e) => setEditDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))}
                        placeholder="Sort order"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        defaultValue={a.instagram_url}
                        onChange={(e) => setEditDraft((d) => ({ ...d, instagram_url: e.target.value }))}
                        placeholder="Instagram URL"
                        className={inputClass}
                      />
                      <input
                        type="text"
                        defaultValue={a.facebook_url}
                        onChange={(e) => setEditDraft((d) => ({ ...d, facebook_url: e.target.value }))}
                        placeholder="Facebook URL"
                        className={inputClass}
                      />
                      <input
                        type="text"
                        defaultValue={a.tiktok_url}
                        onChange={(e) => setEditDraft((d) => ({ ...d, tiktok_url: e.target.value }))}
                        placeholder="TikTok URL"
                        className={inputClass}
                      />
                    </div>
                    <input
                      type="text"
                      defaultValue={a.photo_data}
                      onChange={(e) => setEditDraft((d) => ({ ...d, photo_data: e.target.value }))}
                      placeholder="Photo URL"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      defaultValue={a.availability_note}
                      onChange={(e) => setEditDraft((d) => ({ ...d, availability_note: e.target.value }))}
                      placeholder="Availability note (e.g. Booking 2 weeks out)"
                      className={inputClass}
                    />
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleSaveEdit(a.id)}
                        data-cursor-hover
                        className="px-3 py-2 text-xs uppercase border border-cyan/40 text-cyan rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditId(null);
                          setEditDraft({});
                        }}
                        data-cursor-hover
                        className="px-3 py-2 text-xs uppercase border border-white/15 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {a.photo_data && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.photo_data}
                          alt={a.name}
                          className="w-16 h-16 rounded-full object-cover border border-white/10"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display text-lg">{a.name}</p>
                          {a.featured && (
                            <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border text-gold border-gold/50 bg-gold/10">
                              ★ Featured Artist
                            </span>
                          )}
                          <span
                            className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                              a.active ? 'text-cyan border-cyan/40 bg-cyan/10' : 'text-white/40 border-white/20 bg-white/5'
                            }`}
                          >
                            {a.active ? 'Active' : 'Inactive'}
                          </span>
                          <span
                            className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                              a.available ? 'text-gold border-gold/40 bg-gold/10' : 'text-white/40 border-white/20 bg-white/5'
                            }`}
                          >
                            {a.available ? 'Available' : 'Fully Booked'}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-1">
                          {a.specialties.join(' · ') || 'No specialties listed'}
                          {a.years_experience ? ` · ${a.years_experience} yrs experience` : ''}
                        </p>
                        {a.bio && <p className="text-xs text-white/60 mt-2 max-w-xl">{a.bio}</p>}
                        {a.availability_note && (
                          <p className="text-xs text-gold/70 mt-1">{a.availability_note}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleFeatured(a)}
                        data-cursor-hover
                        className={`px-3 py-1.5 text-xs uppercase border rounded-lg transition-colors ${
                          a.featured
                            ? 'border-gold text-gold bg-gold/10'
                            : 'border-white/15 hover:border-gold hover:text-gold'
                        }`}
                      >
                        {a.featured ? 'Unfeature' : 'Make Featured'}
                      </button>
                      <button
                        onClick={() => handleToggleAvailable(a)}
                        data-cursor-hover
                        className="px-3 py-1.5 text-xs uppercase border border-white/15 hover:border-gold hover:text-gold rounded-lg transition-colors"
                      >
                        {a.available ? 'Mark Fully Booked' : 'Mark Available'}
                      </button>
                      <button
                        onClick={() => handleToggleActive(a)}
                        data-cursor-hover
                        className="px-3 py-1.5 text-xs uppercase border border-white/15 hover:border-cyan hover:text-cyan rounded-lg transition-colors"
                      >
                        {a.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          setEditId(a.id);
                          setEditDraft({});
                        }}
                        data-cursor-hover
                        className="px-3 py-1.5 text-xs uppercase border border-white/15 hover:border-gold hover:text-gold rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteArtist(a.id)}
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

        <div className="border-t border-white/10 pt-6">
          <h3 className="font-display text-lg mb-4">Add Artist</h3>
          <form onSubmit={handleAddArtist} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input
                type="text"
                value={newArtist.name}
                onChange={(e) => setNewArtist((f) => ({ ...f, name: e.target.value }))}
                placeholder="Full Name"
                required
                className={inputClass}
              />
              <input
                type="text"
                value={newArtist.specialties}
                onChange={(e) => setNewArtist((f) => ({ ...f, specialties: e.target.value }))}
                placeholder="Specialties (comma separated)"
                className={inputClass}
              />
            </div>
            <textarea
              value={newArtist.bio}
              onChange={(e) => setNewArtist((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Biography"
              rows={3}
              className={inputClass}
            />
            <div className="grid md:grid-cols-2 gap-3">
              <input
                type="number"
                value={newArtist.years_experience}
                onChange={(e) => setNewArtist((f) => ({ ...f, years_experience: e.target.value }))}
                placeholder="Years of experience"
                className={inputClass}
              />
              <input
                type="number"
                value={newArtist.sort_order}
                onChange={(e) => setNewArtist((f) => ({ ...f, sort_order: e.target.value }))}
                placeholder="Sort order"
                className={inputClass}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <input
                type="text"
                value={newArtist.instagram_url}
                onChange={(e) => setNewArtist((f) => ({ ...f, instagram_url: e.target.value }))}
                placeholder="Instagram URL"
                className={inputClass}
              />
              <input
                type="text"
                value={newArtist.facebook_url}
                onChange={(e) => setNewArtist((f) => ({ ...f, facebook_url: e.target.value }))}
                placeholder="Facebook URL"
                className={inputClass}
              />
              <input
                type="text"
                value={newArtist.tiktok_url}
                onChange={(e) => setNewArtist((f) => ({ ...f, tiktok_url: e.target.value }))}
                placeholder="TikTok URL"
                className={inputClass}
              />
            </div>
            <input
              type="text"
              value={newArtist.availability_note}
              onChange={(e) => setNewArtist((f) => ({ ...f, availability_note: e.target.value }))}
              placeholder="Availability note (optional, e.g. Booking 2 weeks out)"
              className={inputClass}
            />
            <div className="grid md:grid-cols-2 gap-3 items-start">
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Upload Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="text-sm text-white/60"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Or Photo URL</label>
                <input
                  type="text"
                  value={newArtist.imageUrl}
                  onChange={(e) => setNewArtist((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
            </div>
            {newArtistFile && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={newArtistFile}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border border-white/10"
              />
            )}
            <button
              type="submit"
              data-cursor-hover
              className="px-6 py-3 bg-crimson hover:bg-crimson-light text-sm uppercase tracking-wide transition-colors rounded-lg"
            >
              Add Artist
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

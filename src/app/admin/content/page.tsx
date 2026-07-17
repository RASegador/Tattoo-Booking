'use client';

import { useEffect, useState } from 'react';

type HeroContent = {
  eyebrow: string;
  headline_line1: string;
  headline_line2_gold: string;
  subtext: string;
};

type AboutContent = {
  eyebrow: string;
  heading_plain: string;
  heading_gold: string;
  artist_line: string;
  bio1: string;
  bio2: string;
  philosophy_quote: string;
};

type ContactContent = {
  address: string;
  phone: string;
  email: string;
  hours: string;
};

type FaqItem = { q: string; a: string };

type SiteContent = {
  hero: HeroContent;
  about: AboutContent;
  contact: ContactContent;
  faq: FaqItem[];
};

const SECTION_TABS = ['hero', 'about', 'contact', 'faq'] as const;
type SectionTab = (typeof SECTION_TABS)[number];

export default function AdminContentPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<SectionTab>('hero');
  const [savingSection, setSavingSection] = useState<SectionTab | null>(null);
  const [savedSection, setSavedSection] = useState<SectionTab | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/content', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((data: SiteContent) => {
        if (!cancelled) {
          setContent(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load content.');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveSection = async (section: SectionTab, value: unknown) => {
    setSavingSection(section);
    setSavedSection(null);
    setError('');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_key: section, content: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Could not save ${section}.`);
        return;
      }
      setSavedSection(section);
      setTimeout(() => setSavedSection(null), 2500);
    } catch {
      setError('Network error.');
    } finally {
      setSavingSection(null);
    }
  };

  const updateHero = (patch: Partial<HeroContent>) => {
    setContent((c) => (c ? { ...c, hero: { ...c.hero, ...patch } } : c));
  };
  const updateAbout = (patch: Partial<AboutContent>) => {
    setContent((c) => (c ? { ...c, about: { ...c.about, ...patch } } : c));
  };
  const updateContact = (patch: Partial<ContactContent>) => {
    setContent((c) => (c ? { ...c, contact: { ...c.contact, ...patch } } : c));
  };
  const updateFaqItem = (index: number, patch: Partial<FaqItem>) => {
    setContent((c) => {
      if (!c) return c;
      const faq = [...c.faq];
      faq[index] = { ...faq[index], ...patch };
      return { ...c, faq };
    });
  };
  const addFaqItem = () => {
    setContent((c) => (c ? { ...c, faq: [...c.faq, { q: '', a: '' }] } : c));
  };
  const removeFaqItem = (index: number) => {
    setContent((c) => (c ? { ...c, faq: c.faq.filter((_, i) => i !== index) } : c));
  };

  const inputClass =
    'w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors';

  return (
    <section className="relative pb-10">
      <div className="mb-10">
        <p className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">Studio Admin</p>
        <h1 className="font-display text-4xl md:text-5xl">
          Site <span className="text-gradient-gold">Content</span>
        </h1>
      </div>

      {error && (
        <div className="glass-panel rounded-xl p-6 border border-crimson/30 text-crimson-light text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel rounded-xl p-16 text-center border border-white/10">
          <p className="text-white/40 text-sm uppercase tracking-wide">Loading content...</p>
        </div>
      ) : content ? (
        <>
          <div className="flex flex-wrap gap-2 mb-8">
            {SECTION_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                data-cursor-hover
                className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wide border transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-white/15 text-white/60 hover:border-white/40'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'hero' && (
            <div className="glass-panel rounded-xl p-6 border border-white/10 space-y-4">
              <h2 className="font-display text-xl mb-2">Hero Section</h2>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Eyebrow</label>
                <input type="text" value={content.hero.eyebrow} onChange={(e) => updateHero({ eyebrow: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Headline Line 1</label>
                <input type="text" value={content.hero.headline_line1} onChange={(e) => updateHero({ headline_line1: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Headline Line 2 (Gold)</label>
                <input type="text" value={content.hero.headline_line2_gold} onChange={(e) => updateHero({ headline_line2_gold: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Subtext</label>
                <textarea rows={3} value={content.hero.subtext} onChange={(e) => updateHero({ subtext: e.target.value })} className={inputClass} />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => saveSection('hero', content.hero)}
                  disabled={savingSection === 'hero'}
                  data-cursor-hover
                  className="px-6 py-3 bg-crimson hover:bg-crimson-light disabled:opacity-50 text-sm uppercase tracking-wide transition-colors rounded-lg"
                >
                  {savingSection === 'hero' ? 'Saving...' : 'Save Hero'}
                </button>
                {savedSection === 'hero' && <span className="text-cyan text-xs uppercase tracking-wide">Saved</span>}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="glass-panel rounded-xl p-6 border border-white/10 space-y-4">
              <h2 className="font-display text-xl mb-2">About Section</h2>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Eyebrow</label>
                <input type="text" value={content.about.eyebrow} onChange={(e) => updateAbout({ eyebrow: e.target.value })} className={inputClass} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Heading (Plain)</label>
                  <input type="text" value={content.about.heading_plain} onChange={(e) => updateAbout({ heading_plain: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Heading (Gold)</label>
                  <input type="text" value={content.about.heading_gold} onChange={(e) => updateAbout({ heading_gold: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Artist Line</label>
                <input type="text" value={content.about.artist_line} onChange={(e) => updateAbout({ artist_line: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Bio Paragraph 1</label>
                <textarea rows={3} value={content.about.bio1} onChange={(e) => updateAbout({ bio1: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Bio Paragraph 2</label>
                <textarea rows={3} value={content.about.bio2} onChange={(e) => updateAbout({ bio2: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Philosophy Quote</label>
                <textarea rows={2} value={content.about.philosophy_quote} onChange={(e) => updateAbout({ philosophy_quote: e.target.value })} className={inputClass} />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => saveSection('about', content.about)}
                  disabled={savingSection === 'about'}
                  data-cursor-hover
                  className="px-6 py-3 bg-crimson hover:bg-crimson-light disabled:opacity-50 text-sm uppercase tracking-wide transition-colors rounded-lg"
                >
                  {savingSection === 'about' ? 'Saving...' : 'Save About'}
                </button>
                {savedSection === 'about' && <span className="text-cyan text-xs uppercase tracking-wide">Saved</span>}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="glass-panel rounded-xl p-6 border border-white/10 space-y-4">
              <h2 className="font-display text-xl mb-2">Contact Info</h2>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Address</label>
                <input type="text" value={content.contact.address} onChange={(e) => updateContact({ address: e.target.value })} className={inputClass} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Phone</label>
                  <input type="text" value={content.contact.phone} onChange={(e) => updateContact({ phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Email</label>
                  <input type="text" value={content.contact.email} onChange={(e) => updateContact({ email: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/40 block mb-2">Hours</label>
                <input type="text" value={content.contact.hours} onChange={(e) => updateContact({ hours: e.target.value })} className={inputClass} />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => saveSection('contact', content.contact)}
                  disabled={savingSection === 'contact'}
                  data-cursor-hover
                  className="px-6 py-3 bg-crimson hover:bg-crimson-light disabled:opacity-50 text-sm uppercase tracking-wide transition-colors rounded-lg"
                >
                  {savingSection === 'contact' ? 'Saving...' : 'Save Contact'}
                </button>
                {savedSection === 'contact' && <span className="text-cyan text-xs uppercase tracking-wide">Saved</span>}
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="glass-panel rounded-xl p-6 border border-white/10 space-y-4">
              <h2 className="font-display text-xl mb-2">FAQ</h2>
              <div className="space-y-4">
                {content.faq.map((item, i) => (
                  <div key={i} className="border border-white/10 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs uppercase tracking-wide text-white/40">Question {i + 1}</label>
                      <button
                        onClick={() => removeFaqItem(i)}
                        data-cursor-hover
                        className="text-xs uppercase text-crimson hover:text-crimson-light transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.q}
                      onChange={(e) => updateFaqItem(i, { q: e.target.value })}
                      className={inputClass}
                    />
                    <textarea
                      rows={2}
                      value={item.a}
                      onChange={(e) => updateFaqItem(i, { a: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={addFaqItem}
                data-cursor-hover
                className="px-4 py-2 border border-white/15 text-xs uppercase tracking-wide rounded-lg hover:border-gold hover:text-gold transition-colors"
              >
                + Add Question
              </button>
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => saveSection('faq', content.faq)}
                  disabled={savingSection === 'faq'}
                  data-cursor-hover
                  className="px-6 py-3 bg-crimson hover:bg-crimson-light disabled:opacity-50 text-sm uppercase tracking-wide transition-colors rounded-lg"
                >
                  {savingSection === 'faq' ? 'Saving...' : 'Save FAQ'}
                </button>
                {savedSection === 'faq' && <span className="text-cyan text-xs uppercase tracking-wide">Saved</span>}
              </div>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}

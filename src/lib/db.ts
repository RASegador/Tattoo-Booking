import { neon } from '@neondatabase/serverless';
import { categories as seedCategories, getArtworksForCategory, reviews as seedReviews } from './data';

// fetchOptions: { cache: 'no-store' } is required here — this driver issues its queries as HTTP
// fetch() calls under the hood, and without this, responses were observed being served from a
// stale cache within a warm serverless instance: repeated INSERT/PUT calls committed real rows
// (confirmed via RETURNING *, real incrementing ids), yet subsequent SELECTs on the same
// container kept returning the same stale result set indefinitely, never seeing the new rows.
// This explains both the earlier "admin bookings only shows 1 row" bug and the "most recently
// written site_content row is missing" bug — both are the same root cause, not the bound-
// parameter issue they were first (incorrectly) attributed to.
export const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '', {
  fetchOptions: { cache: 'no-store' },
});

let schemaEnsured = false;

export async function ensureSchema(): Promise<void> {
  if (schemaEnsured) return;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id serial PRIMARY KEY,
      email text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      name text,
      role text DEFAULT 'admin',
      created_at timestamptz DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id serial PRIMARY KEY,
      booking_code text UNIQUE NOT NULL,
      style text,
      size text,
      placement text,
      reference_image_names jsonb DEFAULT '[]',
      description text,
      date text,
      time text,
      full_name text,
      mobile text,
      email text,
      notes text,
      status text DEFAULT 'Pending',
      admin_notes text,
      estimated_duration text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS business_hours (
      id serial PRIMARY KEY,
      day_of_week int UNIQUE,
      open_time text,
      close_time text,
      is_closed boolean DEFAULT false
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS blocked_dates (
      id serial PRIMARY KEY,
      date text UNIQUE NOT NULL,
      reason text,
      created_at timestamptz DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS gallery_categories (
      id serial PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      name text,
      icon text,
      description text,
      sort_order int DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS artworks (
      id serial PRIMARY KEY,
      category_slug text REFERENCES gallery_categories(slug) ON DELETE CASCADE,
      title text,
      image_data text,
      placement text,
      size text,
      duration text,
      price text,
      description text,
      featured boolean DEFAULT false,
      created_at timestamptz DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id serial PRIMARY KEY,
      name text,
      avatar_url text,
      rating int DEFAULT 5,
      tattoo_image text,
      review_text text,
      review_date text,
      verified boolean DEFAULT true,
      approved boolean DEFAULT true,
      created_at timestamptz DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      id serial PRIMARY KEY,
      section_key text UNIQUE NOT NULL,
      content jsonb NOT NULL,
      updated_at timestamptz DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id serial PRIMARY KEY,
      admin_email text,
      action text,
      details text,
      created_at timestamptz DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS artists (
      id serial PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      name text NOT NULL,
      bio text,
      photo_data text,
      specialties jsonb DEFAULT '[]',
      years_experience int,
      instagram_url text,
      facebook_url text,
      tiktok_url text,
      available boolean DEFAULT true,
      availability_note text,
      active boolean DEFAULT true,
      sort_order int DEFAULT 0,
      created_at timestamptz DEFAULT now()
    )
  `;

  // Additive column migrations — existing production tables predate these columns.
  await sql`ALTER TABLE artworks ADD COLUMN IF NOT EXISTS artist_id int REFERENCES artists(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE artworks ADD COLUMN IF NOT EXISTS artist_name text`;
  await sql`ALTER TABLE artworks ADD COLUMN IF NOT EXISTS price_min numeric`;
  await sql`ALTER TABLE artworks ADD COLUMN IF NOT EXISTS price_max numeric`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS artist_id int REFERENCES artists(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS artist_name text`;
  await sql`ALTER TABLE artists ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false`;

  await seedIfEmpty();

  schemaEnsured = true;
}

async function seedIfEmpty(): Promise<void> {
  // business_hours
  const hoursCount = await sql`SELECT count(*)::int AS c FROM business_hours`;
  if (Number(hoursCount[0]?.c ?? 0) === 0) {
    for (let day = 0; day <= 6; day++) {
      const isClosed = day === 1; // Monday closed
      await sql`
        INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed)
        VALUES (${day}, ${isClosed ? null : '11:00 AM'}, ${isClosed ? null : '8:00 PM'}, ${isClosed})
        ON CONFLICT (day_of_week) DO NOTHING
      `;
    }
  }

  // artists
  const artistCount = await sql`SELECT count(*)::int AS c FROM artists`;
  if (Number(artistCount[0]?.c ?? 0) === 0) {
    await sql`
      INSERT INTO artists (slug, name, bio, photo_data, specialties, years_experience, instagram_url, active, available, sort_order)
      VALUES (
        'ralph-anthony-segador',
        'Ralph Anthony Segador',
        'Founder and lead artist of Obsidian Ink Studio, trained across traditional Japanese, American, and European studios before opening a modern, gallery-grade studio in Camarines Norte.',
        '/ralph-portrait.jpg',
        ${JSON.stringify(['Realism', 'Black & Grey', 'Fine Line', 'Traditional'])}::jsonb,
        14,
        '',
        true,
        true,
        0
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  // gallery_categories + artworks — one-time migration to the 12-category spec with real
  // (Unsplash) sample images and structured PHP pricing, gated by a sentinel row so it runs
  // exactly once and never clobbers artwork edits made afterward through the admin gallery UI.
  const galleryV2 = await sql`SELECT 1 FROM site_content WHERE section_key = ${'gallery_v2_migrated'} LIMIT 1`;
  if (galleryV2.length === 0) {
    // Categories dropped per the client's 12-category spec — cascades to their old artworks.
    await sql`DELETE FROM gallery_categories WHERE slug IN ('anime', 'cover-ups', 'custom')`;

    const primaryArtistRows = await sql`SELECT id, name FROM artists ORDER BY sort_order ASC, id ASC LIMIT 1`;
    const primaryArtist = primaryArtistRows[0] as { id: number; name: string } | undefined;

    for (let i = 0; i < seedCategories.length; i++) {
      const cat = seedCategories[i];
      await sql`
        INSERT INTO gallery_categories (slug, name, icon, description, sort_order)
        VALUES (${cat.slug}, ${cat.name}, ${cat.icon}, ${cat.description}, ${i})
        ON CONFLICT (slug) DO NOTHING
      `;
      // Replace any old placeholder artworks (picsum images, free-text USD price) for this
      // category with the new curated real-image, PHP-priced set.
      await sql`DELETE FROM artworks WHERE category_slug = ${cat.slug}`;
      const artworks = getArtworksForCategory(cat.slug);
      for (const art of artworks) {
        await sql`
          INSERT INTO artworks (
            category_slug, title, image_data, placement, size, duration,
            price_min, price_max, description, artist_id, artist_name, featured
          )
          VALUES (
            ${cat.slug}, ${art.title}, ${art.imageUrl}, ${art.placement}, ${art.size}, ${art.duration},
            ${art.priceMin}, ${art.priceMax}, ${art.description}, ${primaryArtist?.id ?? null}, ${primaryArtist?.name ?? ''}, false
          )
        `;
      }
    }

    await sql`INSERT INTO site_content (section_key, content) VALUES ('gallery_v2_migrated', ${JSON.stringify({ migrated: true })}::jsonb) ON CONFLICT (section_key) DO NOTHING`;
  }

  // artists_v2 — one-time migration that (1) promotes Ralph Anthony Segador to Featured / Lead
  // Artist with sort_order 0, and (2) seeds 3 additional sample artists with full profiles and
  // their own portfolio artworks. Gated by a sentinel row, same pattern as gallery_v2_migrated,
  // so it runs exactly once and never clobbers artist edits made afterward through the admin UI.
  const artistsV2 = await sql`SELECT 1 FROM site_content WHERE section_key = ${'artists_v2_migrated'} LIMIT 1`;
  if (artistsV2.length === 0) {
    await sql`
      UPDATE artists SET featured = true, sort_order = 0 WHERE slug = ${'ralph-anthony-segador'}
    `;

    const newArtists = [
      {
        slug: 'isabella-cruz',
        name: 'Isabella Cruz',
        bio: 'Isabella specializes in Japanese irezumi-influenced work and bold neo-traditional pieces, blending traditional motifs — koi, dragons, cherry blossoms — with a modern, illustrative edge. Her large-scale narrative pieces are built to age beautifully over decades. Trained under masters of the Japanese style, she brings meticulous linework and rich, saturated color to every session.',
        photo: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=600&h=750&fit=crop&q=80',
        specialties: ['Japanese', 'Neo Traditional'],
        years: 7,
        sortOrder: 10,
        artworks: [
          {
            title: 'Crimson Dragon Sleeve',
            image: 'https://images.unsplash.com/photo-1778837224447-8f3b265035eb?w=1000&h=1200&fit=crop&q=80',
            category: 'japanese',
            placement: 'Full Sleeve',
            size: 'Large (9-14 in)',
          },
          {
            title: 'Cherry Blossom Elbow Wrap',
            image: 'https://images.unsplash.com/photo-1635510236894-0c255ab893dc?w=1000&h=1200&fit=crop&q=80',
            category: 'japanese',
            placement: 'Elbow',
            size: 'Medium (5-8 in)',
          },
          {
            title: 'Ember Dragon Forearm',
            image: 'https://images.unsplash.com/photo-1721836300647-b70a83352c31?w=1000&h=1200&fit=crop&q=80',
            category: 'neo-traditional',
            placement: 'Forearm',
            size: 'Large (9-14 in)',
          },
          {
            title: 'Botanical Neo-Traditional Sleeve',
            image: 'https://images.unsplash.com/photo-1664234417152-cb8b88e544ad?w=1000&h=1200&fit=crop&q=80',
            category: 'neo-traditional',
            placement: 'Upper Arm',
            size: 'Large (9-14 in)',
          },
        ],
      },
      {
        slug: 'diego-mendoza',
        name: 'Diego Mendoza',
        bio: 'Diego is a precision fine-line specialist known for delicate single-needle work, minimalist compositions, and custom script and lettering. His steady hand and restrained, clean approach make him the go-to artist for clients who want a piece that says exactly enough — no more, no less. Every lettering commission is hand-lettered from scratch to match the client\'s story.',
        photo: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=600&h=750&fit=crop&q=80',
        specialties: ['Fine Line', 'Minimalist', 'Lettering'],
        years: 5,
        sortOrder: 20,
        artworks: [
          {
            title: 'Fine Line Vine Wrap',
            image: 'https://images.unsplash.com/photo-1649352508636-2d2efdb4c5b3?w=1000&h=1200&fit=crop&q=80',
            category: 'fine-line',
            placement: 'Forearm',
            size: 'Small (2-4 in)',
          },
          {
            title: 'Minimalist Palette Icon',
            image: 'https://images.unsplash.com/photo-1687825495498-1bb4c92dbb19?w=1000&h=1200&fit=crop&q=80',
            category: 'minimalist',
            placement: 'Upper Arm',
            size: 'Small (2-4 in)',
          },
          {
            title: 'Shoulder Script & Ornament',
            image: 'https://images.unsplash.com/photo-1602835644721-c5c063fe7f67?w=1000&h=1200&fit=crop&q=80',
            category: 'lettering',
            placement: 'Shoulder',
            size: 'Medium (5-8 in)',
          },
          {
            title: '"Hope" Wrist Script',
            image: 'https://images.unsplash.com/photo-1570168918437-5f25c140bd84?w=1000&h=1200&fit=crop&q=80',
            category: 'lettering',
            placement: 'Wrist',
            size: 'Small (2-4 in)',
          },
        ],
      },
      {
        slug: 'camille-dizon',
        name: 'Camille Dizon',
        bio: 'Camille creates vibrant botanical and floral color work alongside clean, precise geometric design. Her pieces balance painterly color blending with disciplined structure, whether she\'s building a full peony sleeve or a striking sacred-geometry back piece. Clients come to her for tattoos that feel like wearable art — bold, considered, and built to flatter the body\'s natural lines.',
        photo: 'https://images.unsplash.com/photo-1532170579297-281918c8ae72?w=600&h=750&fit=crop&q=80',
        specialties: ['Floral', 'Color Tattoos', 'Geometric'],
        years: 6,
        sortOrder: 30,
        artworks: [
          {
            title: 'Peony Bloom Study',
            image: 'https://images.unsplash.com/photo-1514470884303-0dd271e01df0?w=1000&h=1200&fit=crop&q=80',
            category: 'floral',
            placement: 'Shoulder',
            size: 'Small (2-4 in)',
          },
          {
            title: 'Peony & Serpent Sleeve',
            image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=1000&h=1200&fit=crop&q=80',
            category: 'floral',
            placement: 'Upper Arm',
            size: 'Large (9-14 in)',
          },
          {
            title: 'Geometric Arrow Line Forearm',
            image: 'https://images.unsplash.com/photo-1656173877582-c7c017bff89e?w=1000&h=1200&fit=crop&q=80',
            category: 'geometric',
            placement: 'Forearm',
            size: 'Medium (5-8 in)',
          },
          {
            title: 'Radiant Eye Back Piece',
            image: 'https://images.unsplash.com/photo-1594812332797-bec39ee15b47?w=1000&h=1200&fit=crop&q=80',
            category: 'geometric',
            placement: 'Back',
            size: 'Large (9-14 in)',
          },
        ],
      },
    ];

    for (const a of newArtists) {
      const inserted = await sql`
        INSERT INTO artists (
          slug, name, bio, photo_data, specialties, years_experience,
          instagram_url, facebook_url, tiktok_url, available, availability_note,
          active, featured, sort_order
        )
        VALUES (
          ${a.slug}, ${a.name}, ${a.bio}, ${a.photo},
          ${JSON.stringify(a.specialties)}::jsonb, ${a.years},
          '', '', '', true, 'Currently accepting bookings',
          true, false, ${a.sortOrder}
        )
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `;
      const artistId = inserted[0]?.id as number | undefined;
      if (!artistId) continue;

      for (const art of a.artworks) {
        await sql`
          INSERT INTO artworks (
            category_slug, title, image_data, placement, size, duration,
            price_min, price_max, description, artist_id, artist_name, featured
          )
          VALUES (
            ${art.category}, ${art.title}, ${art.image}, ${art.placement}, ${art.size}, '3-5 hours',
            ${3500}, ${12000}, ${`${art.title} by ${a.name}.`}, ${artistId}, ${a.name}, false
          )
        `;
      }
    }

    await sql`INSERT INTO site_content (section_key, content) VALUES ('artists_v2_migrated', ${JSON.stringify({ migrated: true })}::jsonb) ON CONFLICT (section_key) DO NOTHING`;
  }

  // testimonials
  const testimonialCount = await sql`SELECT count(*)::int AS c FROM testimonials`;
  if (Number(testimonialCount[0]?.c ?? 0) === 0) {
    for (const r of seedReviews) {
      const avatarUrl = `https://i.pravatar.cc/80?u=${r.avatarSeed}`;
      const tattooImage = `https://picsum.photos/seed/${r.tattooSeed}/600/400`;
      await sql`
        INSERT INTO testimonials (name, avatar_url, rating, tattoo_image, review_text, review_date, verified, approved)
        VALUES (${r.name}, ${avatarUrl}, ${r.rating}, ${tattooImage}, ${r.text}, ${r.date}, ${r.verified}, true)
      `;
    }
  }

  // site_content
  const contentCount = await sql`SELECT count(*)::int AS c FROM site_content`;
  if (Number(contentCount[0]?.c ?? 0) === 0) {
    const heroContent = {
      eyebrow: 'Obsidian Ink Studio',
      headline_line1: 'Ink That Tells',
      headline_line2_gold: 'Your Story',
      subtext:
        'A boutique tattoo studio where fine art meets skin. Every piece is custom-built, hand-drawn, and executed with obsessive precision — an immersive gallery experience, not just a tattoo shop.',
    };
    const aboutContent = {
      eyebrow: 'The Studio',
      heading_plain: 'Where Fine Art Meets',
      heading_gold: 'Permanent Craft',
      artist_line: 'Ralph Anthony Segador — Founder & Lead Artist',
      bio1:
        'Obsidian Ink Studio was founded on a simple belief — a tattoo should be treated as fine art, not a transaction. Every client begins with a private consultation where we translate your story, memory, or vision into a piece built exclusively for your skin.',
      bio2:
        'Lead artist Ralph Anthony Segador trained across traditional Japanese, American, and European studios before opening Obsidian Ink, blending decades of technique with a modern, gallery-grade studio environment — hospital-level sterilization, premium pigments, and an atmosphere designed to feel more like an art residency than a shop.',
      philosophy_quote:
        'A tattoo is not decoration. It is a permanent conversation between memory, identity, and skin — and every conversation deserves an artist who listens first.',
    };
    const contactContent = {
      address: 'San Vicente, Camarines Norte, Philippines',
      phone: '0994 147 5924',
      email: 'ralph.segador03@gmail.com',
      hours: 'Tue – Sun, 11:00 AM – 8:00 PM · Closed Mondays',
    };
    const { faqs } = await import('./data');

    await sql`INSERT INTO site_content (section_key, content) VALUES ('hero', ${JSON.stringify(heroContent)}::jsonb) ON CONFLICT (section_key) DO NOTHING`;
    await sql`INSERT INTO site_content (section_key, content) VALUES ('about', ${JSON.stringify(aboutContent)}::jsonb) ON CONFLICT (section_key) DO NOTHING`;
    await sql`INSERT INTO site_content (section_key, content) VALUES ('contact', ${JSON.stringify(contactContent)}::jsonb) ON CONFLICT (section_key) DO NOTHING`;
    await sql`INSERT INTO site_content (section_key, content) VALUES ('faq', ${JSON.stringify(faqs)}::jsonb) ON CONFLICT (section_key) DO NOTHING`;
  }

  // studio_info — additive, independent of the "site_content totally empty" gate above,
  // since production's site_content table is already seeded (hero/about/contact/faq exist).
  // ON CONFLICT DO NOTHING makes this safe to run on every ensureSchema() call.
  const studioInfoContent = {
    address: 'San Vicente, Camarines Norte, Philippines',
    prep_instructions:
      "Please arrive well-rested and hydrated, and eat a solid meal beforehand. Avoid alcohol and blood-thinning medication for at least 24 hours prior to your session, and wear comfortable clothing that allows easy access to the tattoo placement area.",
    contact_email: 'ralph.segador03@gmail.com',
    contact_phone: '0994 147 5924',
  };
  await sql`INSERT INTO site_content (section_key, content) VALUES ('studio_info', ${JSON.stringify(studioInfoContent)}::jsonb) ON CONFLICT (section_key) DO NOTHING`;

  // pricing — same additive pattern as studio_info above.
  const pricingContent = {
    deposit_amount: 2000,
    starting_price_note: 'Small minimalist pieces start around ₱2,500. Large-scale custom or realism work is quoted per session after a consultation.',
  };
  await sql`INSERT INTO site_content (section_key, content) VALUES ('pricing', ${JSON.stringify(pricingContent)}::jsonb) ON CONFLICT (section_key) DO NOTHING`;
}

export async function logActivity(adminEmail: string | null | undefined, action: string, details: string): Promise<void> {
  try {
    await sql`
      INSERT INTO activity_logs (admin_email, action, details)
      VALUES (${adminEmail ?? 'system'}, ${action}, ${details})
    `;
  } catch {
    // non-fatal
  }
}

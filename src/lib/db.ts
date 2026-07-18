import { neon } from '@neondatabase/serverless';
import { categories as seedCategories, getArtworksForCategory } from './data';

export const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '');

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

  // gallery_categories + artworks
  const catCount = await sql`SELECT count(*)::int AS c FROM gallery_categories`;
  if (Number(catCount[0]?.c ?? 0) === 0) {
    for (let i = 0; i < seedCategories.length; i++) {
      const cat = seedCategories[i];
      await sql`
        INSERT INTO gallery_categories (slug, name, icon, description, sort_order)
        VALUES (${cat.slug}, ${cat.name}, ${cat.icon}, ${cat.description}, ${i})
        ON CONFLICT (slug) DO NOTHING
      `;
      const artworks = getArtworksForCategory(cat.slug);
      for (const art of artworks) {
        const imageUrl = `https://picsum.photos/seed/${art.seed}/700/900`;
        await sql`
          INSERT INTO artworks (category_slug, title, image_data, placement, size, duration, price, description, featured)
          VALUES (${cat.slug}, ${art.title}, ${imageUrl}, ${art.placement}, ${art.size}, ${art.duration}, ${art.price}, ${art.description}, false)
        `;
      }
    }
  }

  // testimonials — intentionally NOT seeded with placeholder reviews.
  // Real reviews only ever enter this table via customer submissions
  // (POST /api/public/testimonials, pending admin approval) or manual
  // entries added in /admin/testimonials.

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

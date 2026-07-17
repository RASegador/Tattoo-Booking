import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await ensureSchema();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  const artworks = category
    ? await sql`SELECT * FROM artworks WHERE category_slug = ${category} ORDER BY created_at DESC`
    : await sql`SELECT * FROM artworks ORDER BY created_at DESC`;

  return NextResponse.json({ artworks });
}

type ArtworkInput = {
  category_slug?: string;
  title?: string;
  image_data?: string;
  placement?: string;
  size?: string;
  duration?: string;
  price_min?: number | null;
  price_max?: number | null;
  description?: string;
  featured?: boolean;
  artist_id?: number | null;
  artist_name?: string;
};

export async function POST(req: NextRequest) {
  await ensureSchema();

  let body: ArtworkInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.category_slug || !body.title) {
    return NextResponse.json({ error: 'category_slug and title are required' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO artworks (
      category_slug, title, image_data, placement, size, duration,
      price_min, price_max, description, featured, artist_id, artist_name
    )
    VALUES (
      ${body.category_slug}, ${body.title}, ${body.image_data ?? ''}, ${body.placement ?? ''},
      ${body.size ?? ''}, ${body.duration ?? ''}, ${body.price_min ?? null}, ${body.price_max ?? null},
      ${body.description ?? ''}, ${body.featured ?? false}, ${body.artist_id ?? null}, ${body.artist_name ?? ''}
    )
    RETURNING *
  `;

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'gallery.artwork_created', `Artwork "${body.title}" added to ${body.category_slug}`);

  return NextResponse.json({ artwork: rows[0] }, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'artist'
  );
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rows = await sql`SELECT 1 FROM artists WHERE slug = ${candidate} LIMIT 1`;
    if (rows.length === 0) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

export async function GET() {
  await ensureSchema();
  const artists = await sql`SELECT * FROM artists ORDER BY sort_order ASC, id ASC`;
  return NextResponse.json({ artists });
}

type ArtistInput = {
  name?: string;
  slug?: string;
  bio?: string;
  photo_data?: string;
  specialties?: string[];
  years_experience?: number;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  available?: boolean;
  availability_note?: string;
  active?: boolean;
  sort_order?: number;
};

export async function POST(req: NextRequest) {
  await ensureSchema();

  let body: ArtistInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const baseSlug = body.slug ? slugify(body.slug) : slugify(body.name);
  const slug = await uniqueSlug(baseSlug);

  const rows = await sql`
    INSERT INTO artists (
      slug, name, bio, photo_data, specialties, years_experience,
      instagram_url, facebook_url, tiktok_url, available, availability_note, active, sort_order
    )
    VALUES (
      ${slug}, ${body.name}, ${body.bio ?? ''}, ${body.photo_data ?? ''},
      ${JSON.stringify(body.specialties ?? [])}::jsonb, ${body.years_experience ?? null},
      ${body.instagram_url ?? ''}, ${body.facebook_url ?? ''}, ${body.tiktok_url ?? ''},
      ${body.available ?? true}, ${body.availability_note ?? ''}, ${body.active ?? true}, ${body.sort_order ?? 0}
    )
    RETURNING *
  `;

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'artist.created', `Artist "${body.name}" (${slug}) added`);

  return NextResponse.json({ artist: rows[0] }, { status: 201 });
}

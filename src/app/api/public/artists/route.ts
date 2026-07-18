import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureSchema();
    const artists = await sql`
      SELECT id, slug, name, bio, photo_data, specialties, years_experience,
             instagram_url, facebook_url, tiktok_url, available, availability_note, featured
      FROM artists
      WHERE active = true
      ORDER BY featured DESC, sort_order ASC, id ASC
    `;
    return NextResponse.json({ artists });
  } catch {
    return NextResponse.json({ artists: [] });
  }
}

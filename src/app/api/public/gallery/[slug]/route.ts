import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await ensureSchema();
    const artistIdParam = req.nextUrl.searchParams.get('artistId');
    const artistId = artistIdParam ? Number(artistIdParam) : null;

    const artworks =
      artistId && Number.isFinite(artistId)
        ? await sql`
            SELECT * FROM artworks
            WHERE category_slug = ${params.slug}
            ORDER BY (artist_id = ${artistId}) DESC, created_at ASC
          `
        : await sql`
            SELECT * FROM artworks WHERE category_slug = ${params.slug} ORDER BY created_at ASC
          `;
    return NextResponse.json({ artworks });
  } catch {
    return NextResponse.json({ artworks: [] });
  }
}

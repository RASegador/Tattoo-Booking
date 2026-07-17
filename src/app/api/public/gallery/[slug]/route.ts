import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await ensureSchema();
    const artworks = await sql`
      SELECT * FROM artworks WHERE category_slug = ${params.slug} ORDER BY created_at ASC
    `;
    return NextResponse.json({ artworks });
  } catch {
    return NextResponse.json({ artworks: [] });
  }
}

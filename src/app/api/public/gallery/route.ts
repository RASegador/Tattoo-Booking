import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureSchema();
    const categories = await sql`
      SELECT gc.*, COALESCE(a.count, 0)::int AS count
      FROM gallery_categories gc
      LEFT JOIN (
        SELECT category_slug, count(*) AS count FROM artworks GROUP BY category_slug
      ) a ON a.category_slug = gc.slug
      ORDER BY gc.sort_order ASC, gc.id ASC
    `;
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ categories: [] });
  }
}

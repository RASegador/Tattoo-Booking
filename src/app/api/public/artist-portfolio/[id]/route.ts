import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ artworks: [] });
    }
    const artworks = await sql`
      SELECT * FROM artworks WHERE artist_id = ${id} ORDER BY featured DESC, created_at ASC
    `;
    return NextResponse.json({ artworks });
  } catch {
    return NextResponse.json({ artworks: [] });
  }
}

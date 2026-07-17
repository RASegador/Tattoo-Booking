import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type ArtworkRow = {
  id: number;
  category_slug: string;
  title: string;
  image_data: string;
  placement: string;
  size: string;
  duration: string;
  price_min: number | null;
  price_max: number | null;
  description: string;
  featured: boolean;
  artist_id: number | null;
  artist_name: string | null;
};

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body: Partial<ArtworkRow>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const existingRows = await sql`SELECT * FROM artworks WHERE id = ${id} LIMIT 1`;
  const existing = existingRows[0] as ArtworkRow | undefined;
  if (!existing) {
    return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
  }

  // price_min/price_max/artist_id use "key present in body" rather than `?? existing`, since an
  // explicit null (clearing a price bound, or unassigning the artist) is a valid value that `??`
  // would otherwise silently overwrite with the existing value.
  const nextPriceMin = 'price_min' in body ? body.price_min ?? null : existing.price_min;
  const nextPriceMax = 'price_max' in body ? body.price_max ?? null : existing.price_max;
  const nextArtistId = 'artist_id' in body ? body.artist_id ?? null : existing.artist_id;
  const nextArtistName = 'artist_name' in body ? body.artist_name ?? '' : existing.artist_name;

  const updated = await sql`
    UPDATE artworks SET
      category_slug = ${body.category_slug ?? existing.category_slug},
      title = ${body.title ?? existing.title},
      image_data = ${body.image_data ?? existing.image_data},
      placement = ${body.placement ?? existing.placement},
      size = ${body.size ?? existing.size},
      duration = ${body.duration ?? existing.duration},
      price_min = ${nextPriceMin},
      price_max = ${nextPriceMax},
      description = ${body.description ?? existing.description},
      featured = ${body.featured ?? existing.featured},
      artist_id = ${nextArtistId},
      artist_name = ${nextArtistName}
    WHERE id = ${id}
    RETURNING *
  `;

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'gallery.artwork_updated', `Artwork "${existing.title}" updated`);

  return NextResponse.json({ artwork: updated[0] });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const deleted = await sql`DELETE FROM artworks WHERE id = ${id} RETURNING *`;
  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
  }

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'gallery.artwork_deleted', `Artwork "${deleted[0].title}" deleted`);

  return NextResponse.json({ ok: true });
}

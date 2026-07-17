import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

type ArtworkRow = {
  id: number;
  category_slug: string;
  title: string;
  image_data: string;
  placement: string;
  size: string;
  duration: string;
  price: string;
  description: string;
  featured: boolean;
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

  const updated = await sql`
    UPDATE artworks SET
      category_slug = ${body.category_slug ?? existing.category_slug},
      title = ${body.title ?? existing.title},
      image_data = ${body.image_data ?? existing.image_data},
      placement = ${body.placement ?? existing.placement},
      size = ${body.size ?? existing.size},
      duration = ${body.duration ?? existing.duration},
      price = ${body.price ?? existing.price},
      description = ${body.description ?? existing.description},
      featured = ${body.featured ?? existing.featured}
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

import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type ArtistRow = {
  id: number;
  slug: string;
  name: string;
  bio: string;
  photo_data: string;
  specialties: string[];
  years_experience: number | null;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  available: boolean;
  availability_note: string;
  active: boolean;
  featured: boolean;
  sort_order: number;
};

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body: Partial<ArtistRow>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const existingRows = await sql`SELECT * FROM artists WHERE id = ${id} LIMIT 1`;
  const existing = existingRows[0] as ArtistRow | undefined;
  if (!existing) {
    return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
  }

  const nextSpecialties = body.specialties ?? existing.specialties;

  const updated = await sql`
    UPDATE artists SET
      name = ${body.name ?? existing.name},
      bio = ${body.bio ?? existing.bio},
      photo_data = ${body.photo_data ?? existing.photo_data},
      specialties = ${JSON.stringify(nextSpecialties)}::jsonb,
      years_experience = ${body.years_experience ?? existing.years_experience},
      instagram_url = ${body.instagram_url ?? existing.instagram_url},
      facebook_url = ${body.facebook_url ?? existing.facebook_url},
      tiktok_url = ${body.tiktok_url ?? existing.tiktok_url},
      available = ${body.available ?? existing.available},
      availability_note = ${body.availability_note ?? existing.availability_note},
      active = ${body.active ?? existing.active},
      featured = ${body.featured ?? existing.featured},
      sort_order = ${body.sort_order ?? existing.sort_order}
    WHERE id = ${id}
    RETURNING *
  `;

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'artist.updated', `Artist "${existing.name}" updated`);

  return NextResponse.json({ artist: updated[0] });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const deleted = await sql`DELETE FROM artists WHERE id = ${id} RETURNING *`;
  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
  }

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'artist.deleted', `Artist "${deleted[0].name}" deleted`);

  return NextResponse.json({ ok: true });
}

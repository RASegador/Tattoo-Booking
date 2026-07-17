import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

type CategoryRow = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  description: string;
  sort_order: number;
};

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body: Partial<CategoryRow>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const existingRows = await sql`SELECT * FROM gallery_categories WHERE id = ${id} LIMIT 1`;
  const existing = existingRows[0] as CategoryRow | undefined;
  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  const updated = await sql`
    UPDATE gallery_categories SET
      name = ${body.name ?? existing.name},
      icon = ${body.icon ?? existing.icon},
      description = ${body.description ?? existing.description},
      sort_order = ${body.sort_order ?? existing.sort_order}
    WHERE id = ${id}
    RETURNING *
  `;

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'gallery.category_updated', `Category "${existing.name}" updated`);

  return NextResponse.json({ category: updated[0] });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const deleted = await sql`DELETE FROM gallery_categories WHERE id = ${id} RETURNING *`;
  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'gallery.category_deleted', `Category "${deleted[0].name}" deleted`);

  return NextResponse.json({ ok: true });
}

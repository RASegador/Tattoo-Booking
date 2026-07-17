import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'category';
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rows = await sql`SELECT 1 FROM gallery_categories WHERE slug = ${candidate} LIMIT 1`;
    if (rows.length === 0) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

export async function GET() {
  await ensureSchema();
  const categories = await sql`SELECT * FROM gallery_categories ORDER BY sort_order ASC, id ASC`;
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  await ensureSchema();

  let body: { name?: string; slug?: string; icon?: string; description?: string; sort_order?: number };
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
    INSERT INTO gallery_categories (slug, name, icon, description, sort_order)
    VALUES (${slug}, ${body.name}, ${body.icon ?? '✦'}, ${body.description ?? ''}, ${body.sort_order ?? 0})
    RETURNING *
  `;

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'gallery.category_created', `Category "${body.name}" (${slug}) created`);

  return NextResponse.json({ category: rows[0] }, { status: 201 });
}

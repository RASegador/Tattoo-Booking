import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const rows = await sql`SELECT section_key, content FROM site_content`;
  const result: Record<string, unknown> = {};
  for (const row of rows as Array<{ section_key: string; content: unknown }>) {
    result[row.section_key] = row.content;
  }
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  await ensureSchema();

  let body: { section_key?: string; content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.section_key || body.content === undefined) {
    return NextResponse.json({ error: 'section_key and content are required' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO site_content (section_key, content, updated_at)
    VALUES (${body.section_key}, ${JSON.stringify(body.content)}::jsonb, now())
    ON CONFLICT (section_key) DO UPDATE SET content = EXCLUDED.content, updated_at = now()
    RETURNING *
  `;

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'content.updated', `Site content section "${body.section_key}" updated`);

  return NextResponse.json({ section: rows[0] });
}

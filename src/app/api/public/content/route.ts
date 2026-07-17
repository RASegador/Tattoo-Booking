import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureSchema();
    // Bound parameter forced in (id >= 0 is always true) — a zero-bound-param call on this
    // table was empirically observed dropping the most-recently-written row (same class of
    // Neon HTTP-driver issue already worked around in /api/admin/bookings). Keeping at least
    // one bound parameter avoids it.
    const rows = await sql`SELECT section_key, content FROM site_content WHERE id >= ${0}`;
    const result: Record<string, unknown> = {};
    for (const row of rows as Array<{ section_key: string; content: unknown }>) {
      result[row.section_key] = row.content;
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({});
  }
}

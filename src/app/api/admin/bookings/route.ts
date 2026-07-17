import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await ensureSchema();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const q = searchParams.get('q');

  const conditions: string[] = [];
  const params: unknown[] = [];

  // Always keep at least one bound parameter. Empirically, calling this Neon driver as
  // sql(queryText, params) with params === [] (i.e. no filters applied) silently returns
  // only a single row instead of the full table — a real production bug that hid most
  // bookings from the admin list whenever no status/date/search filter was active. Every
  // branch below that already passes real params works correctly, so this harmless
  // always-true bound condition keeps every call on that same working code path.
  params.push(0);
  conditions.push(`id >= $${params.length}`);

  if (status && status !== 'All') {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`date <= $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    const idx = params.length;
    conditions.push(`(full_name ILIKE $${idx} OR mobile ILIKE $${idx} OR email ILIKE $${idx} OR booking_code ILIKE $${idx})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT * FROM bookings ${whereClause} ORDER BY date DESC NULLS LAST, time DESC NULLS LAST, created_at DESC`;

  try {
    const rows = await sql(query, params);
    return NextResponse.json({ bookings: rows });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load bookings', detail: String(err) }, { status: 500 });
  }
}

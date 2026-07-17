import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  await ensureSchema();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const q = searchParams.get('q');

  const conditions: string[] = [];
  const params: unknown[] = [];

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
    const rows = await sql.query(query, params);
    return NextResponse.json({ bookings: rows });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load bookings', detail: String(err) }, { status: 500 });
  }
}

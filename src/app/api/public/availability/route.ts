import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureSchema();
    const businessHours = await sql`SELECT * FROM business_hours ORDER BY day_of_week ASC`;
    const blockedRows = await sql`SELECT date FROM blocked_dates ORDER BY date ASC`;
    const blockedDates = (blockedRows as Array<{ date: string }>).map((r) => r.date);
    return NextResponse.json({ businessHours, blockedDates });
  } catch {
    return NextResponse.json({ businessHours: [], blockedDates: [] });
  }
}

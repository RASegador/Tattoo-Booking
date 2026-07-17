import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const mobile = searchParams.get('mobile');

    if (!code || !mobile) {
      return NextResponse.json({ error: 'code and mobile are required' }, { status: 400 });
    }

    const rows = await sql`
      SELECT * FROM bookings WHERE booking_code = ${code} AND mobile = ${mobile} LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking: rows[0] });
  } catch {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}

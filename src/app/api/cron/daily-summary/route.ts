import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';
import { sendAdminDailySummaryEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    await ensureSchema();

    const todaysAppointments = await sql`
      SELECT * FROM bookings
      WHERE date = to_char(now(), 'YYYY-MM-DD')
      ORDER BY time ASC
    `;

    const pendingRows = await sql`
      SELECT count(*)::int AS c FROM bookings
      WHERE date = to_char(now(), 'YYYY-MM-DD') AND status = 'Pending'
    `;
    const confirmedRows = await sql`
      SELECT count(*)::int AS c FROM bookings
      WHERE date = to_char(now(), 'YYYY-MM-DD') AND status = 'Confirmed'
    `;

    const dateRows = await sql`SELECT to_char(now(), 'YYYY-MM-DD') AS d`;
    const date = String(dateRows[0]?.d ?? '');

    const result = await sendAdminDailySummaryEmail({
      date,
      totalToday: todaysAppointments.length,
      pending: Number(pendingRows[0]?.c ?? 0),
      confirmed: Number(confirmedRows[0]?.c ?? 0),
      todaysAppointments,
    });

    return NextResponse.json({ ok: result.success });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send daily summary', detail: String(err) }, { status: 500 });
  }
}

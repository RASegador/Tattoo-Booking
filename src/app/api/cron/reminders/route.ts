import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';
import { sendAppointmentReminderEmail } from '@/lib/email';

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

    const bookings = await sql`
      SELECT * FROM bookings
      WHERE date = to_char(now() + interval '1 day', 'YYYY-MM-DD')
        AND status = 'Confirmed'
    `;

    let sent = 0;
    for (const booking of bookings) {
      const result = await sendAppointmentReminderEmail(booking);
      if (result.success) sent += 1;
    }

    return NextResponse.json({ sent });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send reminders', detail: String(err) }, { status: 500 });
  }
}
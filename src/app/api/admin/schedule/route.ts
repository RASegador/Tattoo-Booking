import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const hours = await sql`SELECT * FROM business_hours ORDER BY day_of_week ASC`;
  const blockedDates = await sql`SELECT * FROM blocked_dates ORDER BY date ASC`;
  return NextResponse.json({ hours, blockedDates });
}

type HourInput = {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

export async function PUT(req: NextRequest) {
  await ensureSchema();

  let body: { hours?: HourInput[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const hours = body.hours ?? [];
  if (!Array.isArray(hours) || hours.length === 0) {
    return NextResponse.json({ error: 'hours array is required' }, { status: 400 });
  }

  for (const h of hours) {
    await sql`
      INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed)
      VALUES (${h.day_of_week}, ${h.open_time}, ${h.close_time}, ${h.is_closed})
      ON CONFLICT (day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time,
        close_time = EXCLUDED.close_time,
        is_closed = EXCLUDED.is_closed
    `;
  }

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'schedule.updated', 'Business hours updated');

  const updated = await sql`SELECT * FROM business_hours ORDER BY day_of_week ASC`;
  return NextResponse.json({ hours: updated });
}

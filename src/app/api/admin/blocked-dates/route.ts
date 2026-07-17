import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  await ensureSchema();

  let body: { date?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.date) {
    return NextResponse.json({ error: 'date is required' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO blocked_dates (date, reason)
    VALUES (${body.date}, ${body.reason ?? null})
    ON CONFLICT (date) DO UPDATE SET reason = EXCLUDED.reason
    RETURNING *
  `;

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'blocked_date.added', `Blocked date ${body.date} added`);

  return NextResponse.json({ blockedDate: rows[0] }, { status: 201 });
}

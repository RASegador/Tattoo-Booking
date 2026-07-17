import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const deleted = await sql`DELETE FROM blocked_dates WHERE id = ${id} RETURNING *`;
  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Blocked date not found' }, { status: 404 });
  }

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'blocked_date.removed', `Blocked date ${deleted[0].date} removed`);

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import {
  sendBookingApprovedEmail,
  sendBookingRejectedEmail,
  sendBookingRescheduledEmail,
  sendReviewRequestEmail,
  sendBookingCancelledEmail,
} from '@/lib/email';

export const dynamic = 'force-dynamic';

type BookingRow = {
  id: number;
  status: string;
  date: string;
  time: string;
  admin_notes: string | null;
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid booking id' }, { status: 400 });
  }

  let body: { status?: string; admin_notes?: string; date?: string; time?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const existingRows = await sql`SELECT * FROM bookings WHERE id = ${id} LIMIT 1`;
  const existing = existingRows[0] as BookingRow | undefined;
  if (!existing) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const nextStatus = body.status ?? existing.status;
  const nextDate = body.date ?? existing.date;
  const nextTime = body.time ?? existing.time;

  if (body.status === 'Confirmed') {
    const conflictRows = await sql`
      SELECT id FROM bookings
      WHERE date = ${nextDate} AND time = ${nextTime} AND status = 'Confirmed' AND id != ${id}
      LIMIT 1
    `;
    if (conflictRows.length > 0) {
      return NextResponse.json({ error: 'Time slot already confirmed for another booking' }, { status: 409 });
    }
  }

  const updated = await sql`
    UPDATE bookings SET
      status = ${nextStatus},
      admin_notes = ${body.admin_notes ?? existing.admin_notes},
      date = ${nextDate},
      time = ${nextTime},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;

  const session = await getSessionFromRequest(req);
  if (body.status && body.status !== existing.status) {
    await logActivity(session?.email, 'booking.status_change', `Booking #${id} status changed from ${existing.status} to ${body.status}`);
  } else {
    await logActivity(session?.email, 'booking.updated', `Booking #${id} updated`);
  }

  const updatedBooking = updated[0];
  const statusChanged = Boolean(body.status) && body.status !== existing.status;

  if (statusChanged && body.status === 'Confirmed') {
    sendBookingApprovedEmail(updatedBooking).catch(() => {});
  } else if (statusChanged && body.status === 'Cancelled') {
    sendBookingRejectedEmail(updatedBooking, updatedBooking?.admin_notes || undefined).catch(() => {});
  } else if (statusChanged && body.status === 'Completed') {
    sendReviewRequestEmail(updatedBooking).catch(() => {});
  }

  const dateChanged = Boolean(body.date) && body.date !== existing.date;
  const timeChanged = Boolean(body.time) && body.time !== existing.time;
  if (!statusChanged && (dateChanged || timeChanged)) {
    sendBookingRescheduledEmail(updatedBooking, existing.date, existing.time).catch(() => {});
  }

  return NextResponse.json({ booking: updated[0] });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid booking id' }, { status: 400 });
  }

  const updated = await sql`
    UPDATE bookings SET status = 'Cancelled', updated_at = now() WHERE id = ${id} RETURNING *
  `;

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'booking.cancelled', `Booking #${id} cancelled`);

  sendBookingCancelledEmail(updated[0]).catch(() => {});

  return NextResponse.json({ booking: updated[0] });
}

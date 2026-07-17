import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { generateBookingId } from '@/lib/bookings';
import { sendBookingConfirmationEmail, sendAdminNewBookingAlert } from '@/lib/email';

export const dynamic = 'force-dynamic';

type BookingRequestBody = {
  style?: string;
  size?: string;
  placement?: string;
  referenceImageNames?: string[];
  description?: string;
  date?: string;
  time?: string;
  fullName?: string;
  mobile?: string;
  email?: string;
  notes?: string;
  estimatedDuration?: string;
};

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();

    let body: BookingRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!body.fullName || !body.mobile || !body.date || !body.time) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    const bookingCode = generateBookingId();

    const rows = await sql`
      INSERT INTO bookings (
        booking_code, style, size, placement, reference_image_names, description,
        date, time, full_name, mobile, email, notes, status, estimated_duration
      )
      VALUES (
        ${bookingCode}, ${body.style ?? ''}, ${body.size ?? ''}, ${body.placement ?? ''},
        ${JSON.stringify(body.referenceImageNames ?? [])}::jsonb, ${body.description ?? ''},
        ${body.date}, ${body.time}, ${body.fullName}, ${body.mobile}, ${body.email ?? ''},
        ${body.notes ?? ''}, 'Pending', ${body.estimatedDuration ?? ''}
      )
      RETURNING *
    `;

    await logActivity(null, 'booking.created', `New booking ${bookingCode} from ${body.fullName}`);

    const createdBooking = rows[0];
    // Awaited (not fire-and-forget): Vercel serverless functions can freeze
    // the execution environment immediately after the response is sent,
    // which kills any in-flight un-awaited promises before they complete.
    await Promise.allSettled([
      sendBookingConfirmationEmail(createdBooking),
      sendAdminNewBookingAlert(createdBooking),
    ]);

    return NextResponse.json({ ok: true, booking: rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create booking', detail: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureSchema();
    const bookings = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ bookings: [] });
  }
}

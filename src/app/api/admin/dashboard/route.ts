import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();

  const totalRows = await sql`SELECT count(*)::int AS c FROM bookings`;
  const statusRows = await sql`SELECT status, count(*)::int AS c FROM bookings GROUP BY status`;
  const weekRows = await sql`
    SELECT count(*)::int AS c FROM bookings
    WHERE date >= to_char(now(), 'YYYY-MM-DD') AND date <= to_char(now() + interval '7 days', 'YYYY-MM-DD')
  `;
  const galleryRows = await sql`SELECT count(*)::int AS c FROM artworks`;
  const testimonialRows = await sql`SELECT count(*)::int AS c FROM testimonials`;
  const approvedTestimonialRows = await sql`SELECT count(*)::int AS c FROM testimonials WHERE approved = true`;
  const recentActivity = await sql`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10`;
  const todayBookings = await sql`
    SELECT * FROM bookings WHERE date = to_char(now(), 'YYYY-MM-DD') ORDER BY time ASC
  `;

  const statusCounts: Record<string, number> = {
    Pending: 0,
    Confirmed: 0,
    Completed: 0,
    Cancelled: 0,
    Rescheduled: 0,
  };
  for (const row of statusRows as Array<{ status: string; c: number }>) {
    if (row.status in statusCounts) statusCounts[row.status] = Number(row.c);
  }

  return NextResponse.json({
    totalBookings: Number(totalRows[0]?.c ?? 0),
    statusCounts,
    bookingsNext7Days: Number(weekRows[0]?.c ?? 0),
    totalArtworks: Number(galleryRows[0]?.c ?? 0),
    totalTestimonials: Number(testimonialRows[0]?.c ?? 0),
    approvedTestimonials: Number(approvedTestimonialRows[0]?.c ?? 0),
    recentActivity,
    todayBookings,
  });
}

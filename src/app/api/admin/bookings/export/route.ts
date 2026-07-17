import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  await ensureSchema();

  const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;

  const header = [
    'Booking ID',
    'Name',
    'Mobile',
    'Email',
    'Style',
    'Size',
    'Placement',
    'Date',
    'Time',
    'Status',
    'Created At',
  ];

  const lines = [header.join(',')];

  for (const row of rows as Array<Record<string, unknown>>) {
    lines.push(
      [
        row.booking_code,
        row.full_name,
        row.mobile,
        row.email,
        row.style,
        row.size,
        row.placement,
        row.date,
        row.time,
        row.status,
        row.created_at,
      ]
        .map(csvEscape)
        .join(',')
    );
  }

  const csv = lines.join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="bookings.csv"',
    },
  });
}

import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export async function GET() {
  try {
    await ensureSchema();
    const testimonials = await sql`
      SELECT * FROM testimonials WHERE approved = true ORDER BY created_at DESC
    `;
    return NextResponse.json({ testimonials });
  } catch {
    return NextResponse.json({ testimonials: [] });
  }
}

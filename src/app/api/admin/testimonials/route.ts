import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET() {
  await ensureSchema();
  const testimonials = await sql`SELECT * FROM testimonials ORDER BY created_at DESC`;
  return NextResponse.json({ testimonials });
}

type TestimonialInput = {
  name?: string;
  avatar_url?: string;
  rating?: number;
  tattoo_image?: string;
  review_text?: string;
  review_date?: string;
  verified?: boolean;
  approved?: boolean;
};

export async function POST(req: NextRequest) {
  await ensureSchema();

  let body: TestimonialInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.name || !body.review_text) {
    return NextResponse.json({ error: 'name and review_text are required' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO testimonials (name, avatar_url, rating, tattoo_image, review_text, review_date, verified, approved)
    VALUES (
      ${body.name}, ${body.avatar_url ?? ''}, ${body.rating ?? 5}, ${body.tattoo_image ?? ''},
      ${body.review_text}, ${body.review_date ?? ''}, ${body.verified ?? true}, ${body.approved ?? true}
    )
    RETURNING *
  `;

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'testimonial.created', `Testimonial from "${body.name}" added`);

  return NextResponse.json({ testimonial: rows[0] }, { status: 201 });
}

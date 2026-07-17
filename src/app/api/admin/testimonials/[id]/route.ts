import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

type TestimonialRow = {
  id: number;
  name: string;
  avatar_url: string;
  rating: number;
  tattoo_image: string;
  review_text: string;
  review_date: string;
  verified: boolean;
  approved: boolean;
};

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body: Partial<TestimonialRow>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const existingRows = await sql`SELECT * FROM testimonials WHERE id = ${id} LIMIT 1`;
  const existing = existingRows[0] as TestimonialRow | undefined;
  if (!existing) {
    return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
  }

  const updated = await sql`
    UPDATE testimonials SET
      name = ${body.name ?? existing.name},
      avatar_url = ${body.avatar_url ?? existing.avatar_url},
      rating = ${body.rating ?? existing.rating},
      tattoo_image = ${body.tattoo_image ?? existing.tattoo_image},
      review_text = ${body.review_text ?? existing.review_text},
      review_date = ${body.review_date ?? existing.review_date},
      verified = ${body.verified ?? existing.verified},
      approved = ${body.approved ?? existing.approved}
    WHERE id = ${id}
    RETURNING *
  `;

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'testimonial.updated', `Testimonial from "${existing.name}" updated`);

  return NextResponse.json({ testimonial: updated[0] });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureSchema();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const deleted = await sql`DELETE FROM testimonials WHERE id = ${id} RETURNING *`;
  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
  }

  const session = await getSessionFromRequest(req);
  await logActivity(session?.email, 'testimonial.deleted', `Testimonial from "${deleted[0].name}" deleted`);

  return NextResponse.json({ ok: true });
}

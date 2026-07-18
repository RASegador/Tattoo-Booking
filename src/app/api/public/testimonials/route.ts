import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { sendNewTestimonialAlert } from '@/lib/email';

export const dynamic = 'force-dynamic';

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

type PublicTestimonialInput = {
  name?: string;
  rating?: number;
  review_text?: string;
  tattoo_image?: string;
};

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();

    let body: PublicTestimonialInput;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const name = (body.name ?? '').trim();
    const reviewText = (body.review_text ?? '').trim();
    const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating) || 5)));

    if (!name || !reviewText) {
      return NextResponse.json({ error: 'Name and review are required' }, { status: 400 });
    }
    if (reviewText.length > 2000) {
      return NextResponse.json({ error: 'Review is too long' }, { status: 400 });
    }

    const reviewDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Client-submitted reviews are never auto-published or auto-verified —
    // approved/verified are intentionally NOT settable from this input and
    // always start false, regardless of what the request body contains.
    // An admin has to approve them in /admin/testimonials before they show
    // publicly (same moderation gate the public GET above already enforces
    // via `WHERE approved = true`).
    const rows = await sql`
      INSERT INTO testimonials (name, avatar_url, rating, tattoo_image, review_text, review_date, verified, approved)
      VALUES (
        ${name}, '', ${rating}, ${body.tattoo_image ?? ''},
        ${reviewText}, ${reviewDate}, false, false
      )
      RETURNING *
    `;

    try {
      await logActivity(null, 'testimonial.submitted', `New review submitted by ${name} (pending approval)`);
    } catch {
      // non-critical
    }

    // Awaited, not fire-and-forget — same reasoning as the booking and
    // contact routes: Vercel can freeze the function right after the
    // response is sent, killing any un-awaited send.
    await sendNewTestimonialAlert({ name, rating, review_text: reviewText });

    return NextResponse.json({ ok: true, testimonial: rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to submit review', detail: String(err) }, { status: 500 });
  }
}

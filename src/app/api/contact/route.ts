import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/db';
import { sendContactMessageEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

type ContactRequestBody = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(req: NextRequest) {
  try {
    let body: ContactRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const name = (body.name ?? '').trim();
    const email = (body.email ?? '').trim();
    const message = (body.message ?? '').trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    // Basic email shape check — the real validation happens client-side via
    // input[type=email], this just guards direct API hits.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Awaited (not fire-and-forget) — same reasoning as the booking route:
    // Vercel serverless functions can freeze immediately after the response
    // is sent, which would kill an un-awaited send before it completes.
    const result = await sendContactMessageEmail({ name, email, message });

    if (!result.success) {
      console.error('Contact message email failed to send:', result.error);
      return NextResponse.json({ error: 'Failed to send message. Please try again or reach out by phone.' }, { status: 502 });
    }

    try {
      await logActivity(null, 'contact.message', `New contact message from ${name} <${email}>`);
    } catch {
      // Non-critical — don't fail the request if activity logging has an issue.
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send message', detail: String(err) }, { status: 500 });
  }
}

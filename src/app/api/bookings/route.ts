import { NextRequest, NextResponse } from 'next/server';

// Demo in-memory store. Serverless instances are ephemeral and stateless,
// so this only persists for the lifetime of a single warm function instance.
// The booking wizard also writes to localStorage, which is the durable
// source of truth for this demo. Swap this file for a real database
// (Supabase/Firebase/Postgres) adapter to persist bookings server-side.
type StoredBooking = Record<string, unknown> & { id: string; createdAt: string };
const memoryStore: StoredBooking[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as StoredBooking;
    if (!body?.id) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 });
    }
    memoryStore.unshift(body);
    // Simulate email confirmation dispatch
    return NextResponse.json({ ok: true, booking: body }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ bookings: memoryStore });
}

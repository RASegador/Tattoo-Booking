import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql, logActivity } from '@/lib/db';
import { hashPassword, signSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  try {
    const rows = await sql`SELECT count(*)::int AS c FROM admin_users`;
    const needsSetup = Number(rows[0]?.c ?? 0) === 0;
    return NextResponse.json({ needsSetup });
  } catch {
    return NextResponse.json({ needsSetup: true });
  }
}

export async function POST(req: NextRequest) {
  await ensureSchema();

  const existing = await sql`SELECT count(*)::int AS c FROM admin_users`;
  if (Number(existing[0]?.c ?? 0) > 0) {
    return NextResponse.json({ error: 'Setup already completed' }, { status: 403 });
  }

  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const name = body.name?.trim() || 'Admin';

  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: 'Email and a password of at least 6 characters are required' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  await sql`
    INSERT INTO admin_users (email, password_hash, name, role)
    VALUES (${email}, ${passwordHash}, ${name}, 'admin')
  `;

  const token = await signSession({ email, name, role: 'admin' });

  await logActivity(email, 'admin.setup', `Initial admin account created for ${email}`);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  return res;
}

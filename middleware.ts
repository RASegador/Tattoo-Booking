import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = process.env.ADMIN_JWT_SECRET || 'obsidian-ink-dev-secret-change-me';
const encodedSecret = new TextEncoder().encode(SECRET);
const SESSION_COOKIE = 'admin_session';

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, encodedSecret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicAdminPage = pathname === '/admin/login' || pathname === '/admin/setup';
  const isPublicAdminApi = pathname === '/api/admin/login' || pathname === '/api/admin/setup';

  const isProtectedPage = pathname.startsWith('/admin') && !isPublicAdminPage;
  const isProtectedApi = pathname.startsWith('/api/admin') && !isPublicAdminApi;

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const authed = await isAuthenticated(req);

  if (authed) {
    return NextResponse.next();
  }

  if (isProtectedApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

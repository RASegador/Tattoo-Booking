import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import type { NextRequest } from 'next/server';

const SECRET = process.env.ADMIN_JWT_SECRET || 'obsidian-ink-dev-secret-change-me';
const encodedSecret = new TextEncoder().encode(SECRET);

export const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  email: string;
  name: string;
  role: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(encodedSecret);
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    if (typeof payload.email !== 'string') return null;
    return {
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : '',
      role: typeof payload.role === 'string' ? payload.role : 'admin',
    };
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest | Request): Promise<SessionPayload | null> {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  const token = match ? decodeURIComponent(match[1]) : null;
  return verifySession(token);
}

export const SESSION_MAX_AGE = SESSION_DURATION_SECONDS;

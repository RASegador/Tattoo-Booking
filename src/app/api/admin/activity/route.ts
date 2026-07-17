import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  await ensureSchema();
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get('limit'));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 200) : 50;

  const rows = await sql`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ${limit}`;
  return NextResponse.json({ activity: rows });
}

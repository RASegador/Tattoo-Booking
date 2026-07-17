import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

export async function GET() {
  try {
    await ensureSchema();
    const rows = await sql`SELECT section_key, content FROM site_content`;
    const result: Record<string, unknown> = {};
    for (const row of rows as Array<{ section_key: string; content: unknown }>) {
      result[row.section_key] = row.content;
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({});
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { pinOk } from '@/lib/party/staff';

const schema = z.object({ pin: z.string() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success || !pinOk(parsed.data.pin)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

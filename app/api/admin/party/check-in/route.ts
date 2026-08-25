import { NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/cms/server';
import { hydrateStore, resetCheckIn } from '@/lib/party/store';

export async function POST(req: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as { ticketId?: string; action?: string } | null;
  const ticketId = String(body?.ticketId || '').trim();
  if (!ticketId) return NextResponse.json({ error: 'Missing ticket' }, { status: 400 });
  await hydrateStore();
  if (body?.action === 'reset') {
    const ok = await resetCheckIn(ticketId);
    if (!ok) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

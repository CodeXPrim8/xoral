import { NextResponse } from 'next/server';
import { eventWithLiveInventory, hydrateStore } from '@/lib/party/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  await hydrateStore();
  return NextResponse.json({ event: eventWithLiveInventory() });
}

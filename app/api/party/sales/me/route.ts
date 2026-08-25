import { NextResponse } from 'next/server';
import { dashboardFor } from '@/lib/party/sales';
import { readSalesPerson, salesFail } from '@/lib/party/sales-http';
import { hydrateStore } from '@/lib/party/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  await hydrateStore();
  const me = await readSalesPerson();
  if (!me) return salesFail('Log in first.', 401);
  return NextResponse.json(dashboardFor(me));
}

import { NextResponse } from 'next/server';
import { createPerson, hydrateStore } from '@/lib/party/store';
import { dashboardFor, publicPerson } from '@/lib/party/sales';
import { readSalesPerson, salesFail } from '@/lib/party/sales-http';

export async function POST(request: Request) {
  await hydrateStore();
  const me = await readSalesPerson();
  if (!me) return salesFail('Log in first.', 401);
  if (me.role !== 'vendor') return salesFail('Only vendors can add sellers.', 403);

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const password = String(body.password || '');
  if (!name || !email || password.length < 6 || phone.length < 7) {
    return salesFail('Name, phone, email and a 6+ character password are required.');
  }
  try {
    const seller = await createPerson({ role: 'seller', vendorId: me.id, name, email, phone, password });
    return NextResponse.json({ seller: publicPerson(seller), dashboard: dashboardFor(me) });
  } catch (err) {
    return salesFail(err instanceof Error ? err.message : 'Could not add seller.');
  }
}

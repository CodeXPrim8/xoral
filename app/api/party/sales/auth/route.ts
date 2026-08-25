import { NextResponse } from 'next/server';
import { createPerson, authenticatePerson, createSalesSession, clearSalesSession, hydrateStore } from '@/lib/party/store';
import { publicPerson } from '@/lib/party/sales';
import { readSalesPerson, SALES_COOKIE, salesFail } from '@/lib/party/sales-http';
import { cookies } from 'next/headers';

function sessionCookie() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  };
}

export async function GET() {
  await hydrateStore();
  const me = await readSalesPerson();
  if (!me) return salesFail('Log in first.', 401);
  return NextResponse.json({ me: publicPerson(me) });
}

export async function POST(request: Request) {
  try {
    await hydrateStore();
  } catch (err) {
    return salesFail(err instanceof Error ? err.message : 'Sales store is unavailable.');
  }
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || 'login');

  if (action === 'logout') {
    const jar = await cookies();
    await clearSalesSession(jar.get(SALES_COOKIE)?.value);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SALES_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    return res;
  }

  const email = String(body.email || '').trim();
  const password = String(body.password || '');
  const name = String(body.name || '').trim();
  const phone = String(body.phone || '').trim();

  if (action === 'register') {
    const invite = process.env.PARTY_VENDOR_INVITE;
    if (invite && String(body.invite || '') !== invite) {
      return salesFail('Vendor invite code is required.');
    }
    if (!name || !email || password.length < 6 || phone.length < 7) {
      return salesFail('Name, phone, email and a 6+ character password are required.');
    }
    try {
      const person = await createPerson({ role: 'vendor', name, email, phone, password });
      const session = await createSalesSession(person.id);
      const res = NextResponse.json({ ok: true, me: publicPerson(person) });
      res.cookies.set(SALES_COOKIE, session.token, sessionCookie());
      return res;
    } catch (err) {
      return salesFail(err instanceof Error ? err.message : 'Could not register.');
    }
  }

  const person = authenticatePerson(email, password);
  if (!person) return salesFail('Wrong email or password.', 401);
  const session = await createSalesSession(person.id);
  const res = NextResponse.json({ ok: true, me: publicPerson(person) });
  res.cookies.set(SALES_COOKIE, session.token, sessionCookie());
  return res;
}

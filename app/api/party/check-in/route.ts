import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkInTicket, getTicket, hydrateStore } from '@/lib/party/store';
import { verifyTicketPayload } from '@/lib/party/ticket-crypto';
import { pinOk } from '@/lib/party/staff';

const schema = z.object({ payload: z.string().min(8), pin: z.string() });

export async function POST(request: Request) {
  await hydrateStore();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success || !pinOk(parsed.data.pin)) {
    return NextResponse.json({ status: 'invalid', message: 'Staff PIN required' });
  }

  const ticketId = verifyTicketPayload(parsed.data.payload);
  if (!ticketId) {
    return NextResponse.json({ status: 'invalid', message: 'QR signature is not valid' });
  }

  const ticket = getTicket(ticketId);
  if (!ticket) {
    return NextResponse.json({ status: 'invalid', message: 'Ticket is not in the live check-in store' });
  }

  const result = await checkInTicket(ticketId);
  if (!result.ok) {
    return NextResponse.json({ status: 'invalid', message: 'Ticket not found' });
  }

  if (!result.first) {
    return NextResponse.json({
      status: 'already',
      guestName: ticket.guestName,
      ticketType: ticket.ticketTypeName,
      orderId: ticket.orderId,
      at: result.at,
    });
  }

  return NextResponse.json({
    status: 'valid',
    guestName: ticket.guestName,
    ticketType: ticket.ticketTypeName,
    orderId: ticket.orderId,
    at: result.at,
  });
}

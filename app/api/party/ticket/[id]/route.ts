import { NextResponse } from 'next/server';
import { MOCK_EVENT } from '@/lib/party/mock-event';
import { getTicket, getOrder, hydrateStore } from '@/lib/party/store';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await hydrateStore();
  const { id } = await params;
  const ticket = getTicket(id);
  if (!ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
  const order = getOrder(ticket.orderId);
  return NextResponse.json({
    ticket,
    event: {
      name: MOCK_EVENT.name,
      volume: MOCK_EVENT.volume,
      startsAt: MOCK_EVENT.startsAt,
      venue: `${MOCK_EVENT.venue}, ${MOCK_EVENT.address} · ${MOCK_EVENT.city}`,
      scheduleLabel: MOCK_EVENT.scheduleLabel,
    },
    order: order ? { id: order.id, fullName: order.fullName } : null,
  });
}

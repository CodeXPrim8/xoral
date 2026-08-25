import { MOCK_EVENT } from './mock-event';
import { sendTicketEmail } from './mail';
import {
  findOrder,
  getTicketsByOrder,
  recordSaleIfNeeded,
  saveOrder,
  saveTickets,
} from './store';
import { createTicketId, signTicketPayload } from './ticket-crypto';
import type { PartyOrder, PartyTicket } from './types';

async function issueTickets(order: PartyOrder) {
  const existing = getTicketsByOrder(order.id);
  if (existing.length) return existing;
  const tickets: PartyTicket[] = order.items.flatMap((item) => {
    const type = MOCK_EVENT.ticketTypes.find((t) => t.id === item.ticketTypeId);
    const genderTag = item.gender === 'female' ? 'Girl' : 'Guy';
    return Array.from({ length: item.quantity }, () => {
      const id = createTicketId();
      return {
        id,
        orderId: order.id,
        eventId: order.eventId,
        ticketTypeId: item.ticketTypeId,
        ticketTypeName: `${type?.name ?? 'Ticket'} · ${genderTag}`,
        guestName: order.fullName,
        qrPayload: signTicketPayload(id),
        checkedInAt: null,
      };
    });
  });
  await saveTickets(tickets);
  return tickets;
}

export async function fulfillPaidOrder(order: PartyOrder, origin?: string) {
  if (order.status !== 'paid') {
    order.status = 'paid';
    await saveOrder(order);
  }
  const tickets = await issueTickets(order);
  await recordSaleIfNeeded(order);
  if (!order.emailSentAt) {
    const sent = await sendTicketEmail(order, tickets, origin);
    if (sent) {
      order.emailSentAt = new Date().toISOString();
      await saveOrder(order);
    }
  }
  return tickets;
}

export function orderFromPayment(orderId?: string | null, reference?: string | null) {
  return (orderId && findOrder(orderId)) || (reference && findOrder(reference)) || null;
}

export function publicOrigin(requestUrl: string) {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.PARTY_SITE_URL || new URL(requestUrl).origin).replace(/\/$/, '');
}

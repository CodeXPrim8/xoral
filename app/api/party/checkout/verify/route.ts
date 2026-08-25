import { NextResponse } from 'next/server';
import { MOCK_EVENT } from '@/lib/party/mock-event';
import { getPaymentAdapter } from '@/lib/party/payments';
import { fulfillPaidOrder, orderFromPayment, publicOrigin } from '@/lib/party/fulfill';
import { getTicketsByOrder, hydrateStore, saveOrder } from '@/lib/party/store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await hydrateStore();
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order');
  const reference =
    url.searchParams.get('reference') ||
    url.searchParams.get('trxref') ||
    url.searchParams.get('orderNo') ||
    orderId;

  if (!orderId && !reference) {
    return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 });
  }

  const order = orderFromPayment(orderId, reference);
  if (!order) {
    return NextResponse.json({ error: 'Order not found. Complete checkout again.' }, { status: 404 });
  }

  const adapter = getPaymentAdapter();
  const verified = await adapter.verify({ reference: order.paymentReference || reference || order.id });
  if (!verified.paid) {
    const pending = /pending|initial|ongoing|processing/i.test(verified.rawStatus);
    if (pending || !verified.rawStatus || /unknown/i.test(verified.rawStatus)) {
      return NextResponse.json({ error: 'Payment is still processing. Refresh in a moment.', processing: true }, { status: 202 });
    }
    order.status = 'failed';
    await saveOrder(order);
    return NextResponse.json({ error: 'Payment was not verified' }, { status: 402 });
  }

  await fulfillPaidOrder(order, publicOrigin(request.url));
  const tickets = getTicketsByOrder(order.id);

  return NextResponse.json({
    order: {
      id: order.id,
      fullName: order.fullName,
      email: order.email,
      instagram: order.instagram,
      showOnGuestWall: order.showOnGuestWall,
      totalKobo: order.totalKobo,
      emailSentAt: order.emailSentAt,
      referralCode: order.referralCode,
    },
    event: {
      name: MOCK_EVENT.name,
      volume: MOCK_EVENT.volume,
      startsAt: MOCK_EVENT.startsAt,
      venue: `${MOCK_EVENT.venue}, ${MOCK_EVENT.address} · ${MOCK_EVENT.city}`,
      scheduleLabel: MOCK_EVENT.scheduleLabel,
    },
    tickets,
  });
}

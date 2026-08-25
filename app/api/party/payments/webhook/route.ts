import { NextResponse } from 'next/server';
import { getPaymentAdapter } from '@/lib/party/payments';
import { fulfillPaidOrder, orderFromPayment, publicOrigin } from '@/lib/party/fulfill';
import { hydrateStore } from '@/lib/party/store';

export async function POST(request: Request) {
  await hydrateStore();
  const rawBody = await request.text();
  const signature =
    request.headers.get('authorization') ||
    request.headers.get('x-paystack-signature') ||
    request.headers.get('verif-hash') ||
    request.headers.get('x-opay-signature');

  const adapter = getPaymentAdapter();
  const hook = await adapter.verifyWebhook(rawBody, signature);
  const reference = hook?.reference;
  if (!reference) {
    return NextResponse.json({ received: true, paid: false });
  }

  const confirmed = await adapter.verify({ reference });
  if (!confirmed.paid && !hook?.paid) {
    return NextResponse.json({ received: true, paid: false });
  }
  if (!confirmed.paid) {
    return NextResponse.json({ received: true, paid: false, pending: true });
  }

  const order = orderFromPayment(reference, reference);
  if (!order) {
    return NextResponse.json({ received: true, order: false });
  }

  await fulfillPaidOrder(order, publicOrigin(request.url));
  return NextResponse.json({ received: true, paid: true });
}

import { NextResponse } from 'next/server';
import { MOCK_EVENT } from '@/lib/party/mock-event';
import { getPaymentAdapter } from '@/lib/party/payments';
import { publicOrigin } from '@/lib/party/fulfill';
import { createOrderId } from '@/lib/party/ticket-crypto';
import { hydrateStore, remainingForType, saveOrder } from '@/lib/party/store';
import { lineTotalKobo } from '@/lib/party/pricing';
import { z } from 'zod';

const schema = z.object({
  eventId: z.string(),
  items: z.array(z.object({
    ticketTypeId: z.string(),
    quantity: z.number().int().positive(),
    gender: z.enum(['male', 'female']),
  })).min(1),
  fullName: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().trim().min(7),
  referralCode: z.string().optional(),
  promoCode: z.string().optional(),
  showOnGuestWall: z.boolean().optional(),
  instagram: z.string().optional(),
});

export async function POST(request: Request) {
  await hydrateStore();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid checkout details' }, { status: 400 });
  }

  const body = parsed.data;
  if (body.eventId !== MOCK_EVENT.id) {
    return NextResponse.json({ error: 'Unknown event' }, { status: 404 });
  }

  let totalKobo = 0;
  for (const item of body.items) {
    const ticket = MOCK_EVENT.ticketTypes.find((t) => t.id === item.ticketTypeId);
    if (!ticket) return NextResponse.json({ error: 'Unknown ticket type' }, { status: 400 });
    if (item.quantity > ticket.maxPerCustomer) {
      return NextResponse.json({ error: `Max ${ticket.maxPerCustomer} for ${ticket.name}` }, { status: 400 });
    }
    if (item.quantity > remainingForType(ticket.id)) {
      return NextResponse.json({ error: `${ticket.name} does not have enough remaining` }, { status: 400 });
    }
    totalKobo += lineTotalKobo(ticket, item.gender, item.quantity);
  }

  const orderId = createOrderId();
  const origin = publicOrigin(request.url);
  const pending = {
    id: orderId,
    eventId: body.eventId,
    email: body.email,
    fullName: body.fullName,
    phone: body.phone,
    referralCode: body.referralCode?.trim() || undefined,
    promoCode: body.promoCode,
    instagram: body.instagram,
    showOnGuestWall: Boolean(body.showOnGuestWall),
    items: body.items,
    status: 'pending' as const,
    totalKobo,
    createdAt: new Date().toISOString(),
  };
  await saveOrder(pending);

  try {
    const adapter = getPaymentAdapter();
    const payment = await adapter.initiate({
      orderId,
      email: body.email,
      fullName: body.fullName,
      phone: body.phone,
      amountKobo: totalKobo,
      currency: 'NGN',
      callbackUrl: `${origin}/party/checkout/confirm?order=${orderId}`,
      webhookUrl: `${origin}/api/party/payments/webhook`,
      metadata: {
        orderId,
        instagram: body.instagram ?? '',
        items: JSON.stringify(body.items),
      },
    });
    await saveOrder({ ...pending, paymentReference: payment.reference });
    return NextResponse.json({
      orderId,
      provider: payment.provider,
      reference: payment.reference,
      authorizationUrl: payment.authorizationUrl,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not start payment.' }, { status: 502 });
  }
}

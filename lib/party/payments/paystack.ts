import type { PaymentAdapter, InitiatePaymentInput, VerifyPaymentInput } from './types';

export const paystackAdapter: PaymentAdapter = {
  id: 'paystack',
  async initiate(input: InitiatePaymentInput) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error('PAYSTACK_SECRET_KEY is not configured');

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        currency: input.currency,
        reference: input.orderId,
        callback_url: input.callbackUrl,
        metadata: input.metadata,
      }),
    });

    const json = (await response.json()) as {
      status: boolean;
      data?: { authorization_url: string; reference: string };
      message?: string;
    };

    if (!json.status || !json.data) {
      throw new Error(json.message || 'Paystack initialize failed');
    }

    return {
      provider: 'paystack',
      reference: json.data.reference,
      authorizationUrl: json.data.authorization_url,
    };
  },
  async verify(input: VerifyPaymentInput) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error('PAYSTACK_SECRET_KEY is not configured');

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(input.reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const json = (await response.json()) as {
      status: boolean;
      data?: { status: string; amount: number; reference: string };
    };

    const paid = Boolean(json.status && json.data?.status === 'success');
    return {
      provider: 'paystack',
      reference: json.data?.reference ?? input.reference,
      paid,
      amountKobo: json.data?.amount ?? 0,
      rawStatus: json.data?.status ?? 'unknown',
    };
  },
  async verifyWebhook(rawBody: string, signature: string | null) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret || !signature) return null;

    const { createHmac } = await import('crypto');
    const hash = createHmac('sha512', secret).update(rawBody).digest('hex');
    if (hash !== signature) return null;

    const payload = JSON.parse(rawBody) as {
      event?: string;
      data?: { reference: string; status: string; amount: number };
    };
    if (payload.event !== 'charge.success' || !payload.data) return null;

    return {
      provider: 'paystack',
      reference: payload.data.reference,
      paid: payload.data.status === 'success',
      amountKobo: payload.data.amount,
      rawStatus: payload.data.status,
    };
  },
};

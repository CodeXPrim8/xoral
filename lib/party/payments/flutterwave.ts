import type { PaymentAdapter, InitiatePaymentInput, VerifyPaymentInput } from './types';

export const flutterwaveAdapter: PaymentAdapter = {
  id: 'flutterwave',
  async initiate(input: InitiatePaymentInput) {
    const secret = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secret) throw new Error('FLUTTERWAVE_SECRET_KEY is not configured');

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: input.orderId,
        amount: input.amountKobo / 100,
        currency: input.currency,
        redirect_url: input.callbackUrl,
        customer: { email: input.email },
        meta: input.metadata,
      }),
    });

    const json = (await response.json()) as {
      status: string;
      data?: { link: string };
      message?: string;
    };

    if (json.status !== 'success' || !json.data?.link) {
      throw new Error(json.message || 'Flutterwave initialize failed');
    }

    return {
      provider: 'flutterwave',
      reference: input.orderId,
      authorizationUrl: json.data.link,
    };
  },
  async verify(input: VerifyPaymentInput) {
    const secret = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secret) throw new Error('FLUTTERWAVE_SECRET_KEY is not configured');

    const response = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(input.reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const json = (await response.json()) as {
      status: string;
      data?: { status: string; amount: number; tx_ref: string };
    };

    const paid = json.status === 'success' && json.data?.status === 'successful';
    return {
      provider: 'flutterwave',
      reference: json.data?.tx_ref ?? input.reference,
      paid,
      amountKobo: Math.round((json.data?.amount ?? 0) * 100),
      rawStatus: json.data?.status ?? 'unknown',
    };
  },
  async verifyWebhook(rawBody: string, signature: string | null) {
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
    if (!secretHash || signature !== secretHash) return null;

    const payload = JSON.parse(rawBody) as {
      event?: string;
      data?: { tx_ref: string; status: string; amount: number };
    };
    if (!payload.data) return null;

    return {
      provider: 'flutterwave',
      reference: payload.data.tx_ref,
      paid: payload.data.status === 'successful',
      amountKobo: Math.round(payload.data.amount * 100),
      rawStatus: payload.data.status,
    };
  },
};

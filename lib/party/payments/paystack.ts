import type { PaymentAdapter, InitiatePaymentInput, VerifyPaymentInput } from './types';

function secret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not configured');
  return key;
}

export const paystackAdapter: PaymentAdapter = {
  id: 'paystack',
  async initiate(input: InitiatePaymentInput) {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        currency: 'NGN',
        reference: input.orderId,
        callback_url: input.callbackUrl,
        channels: ['card', 'bank', 'ussd', 'bank_transfer', 'qr'],
        metadata: {
          ...input.metadata,
          orderId: input.orderId,
          custom_fields: [
            { display_name: 'Guest', variable_name: 'guest_name', value: input.fullName || '' },
            { display_name: 'Phone', variable_name: 'guest_phone', value: input.phone || '' },
          ],
        },
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
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(input.reference)}`, {
      headers: { Authorization: `Bearer ${secret()}` },
    });
    const json = (await response.json()) as {
      status: boolean;
      data?: { status: string; amount: number; reference: string };
      message?: string;
    };

    const paid = Boolean(json.status && json.data?.status === 'success');
    return {
      provider: 'paystack',
      reference: json.data?.reference ?? input.reference,
      paid,
      amountKobo: json.data?.amount ?? 0,
      rawStatus: json.data?.status ?? json.message ?? 'unknown',
    };
  },
  async verifyWebhook(rawBody: string, signature: string | null) {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key || !signature) return null;

    const { createHmac } = await import('crypto');
    const hash = createHmac('sha512', key).update(rawBody).digest('hex');
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

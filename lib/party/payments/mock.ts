import type { PaymentAdapter, InitiatePaymentInput, VerifyPaymentInput } from './types';

/** Development-only adapter. Never treat this as a real payment in production. */
export const mockAdapter: PaymentAdapter = {
  id: 'mock',
  async initiate(input: InitiatePaymentInput) {
    const reference = `mock_${input.orderId}`;
    return {
      provider: 'mock',
      reference,
      authorizationUrl: `/party/checkout/confirm?reference=${encodeURIComponent(reference)}`,
    };
  },
  async verify(input: VerifyPaymentInput) {
    const paid = input.reference.startsWith('mock_');
    return {
      provider: 'mock',
      reference: input.reference,
      paid,
      amountKobo: 0,
      rawStatus: paid ? 'mock_success' : 'mock_failed',
    };
  },
  async verifyWebhook() {
    return null;
  },
};

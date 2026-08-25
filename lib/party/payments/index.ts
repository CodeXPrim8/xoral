import type { PaymentAdapter, PaymentProviderId } from './types';
import { flutterwaveAdapter } from './flutterwave';
import { mockAdapter } from './mock';
import { opayAdapter } from './opay';
import { paystackAdapter } from './paystack';

const adapters: Record<PaymentProviderId, PaymentAdapter> = {
  paystack: paystackAdapter,
  flutterwave: flutterwaveAdapter,
  opay: opayAdapter,
  mock: mockAdapter,
};

export function getPaymentProvider(): PaymentProviderId {
  const configured = process.env.PARTY_PAYMENT_PROVIDER as PaymentProviderId | undefined;
  if (configured && adapters[configured]) return configured;
  if (process.env.PAYSTACK_SECRET_KEY) return 'paystack';
  if (process.env.OPAY_MERCHANT_ID && process.env.OPAY_SECRET_KEY) return 'opay';
  return process.env.NODE_ENV === 'production' ? 'paystack' : 'mock';
}

export function getPaymentAdapter(id?: PaymentProviderId): PaymentAdapter {
  const provider = id ?? getPaymentProvider();
  if (process.env.NODE_ENV === 'production' && provider === 'mock') {
    throw new Error('Mock payments are disabled in production');
  }
  return adapters[provider];
}

export type { PaymentAdapter, PaymentProviderId, InitiatePaymentResult, VerifyPaymentResult } from './types';

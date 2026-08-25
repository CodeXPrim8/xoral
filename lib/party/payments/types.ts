export type PaymentProviderId = 'paystack' | 'flutterwave' | 'opay' | 'mock';

export type InitiatePaymentInput = {
  orderId: string;
  email: string;
  fullName?: string;
  phone?: string;
  amountKobo: number;
  currency: 'NGN';
  callbackUrl: string;
  webhookUrl?: string;
  metadata?: Record<string, string>;
};

export type InitiatePaymentResult = {
  provider: PaymentProviderId;
  reference: string;
  authorizationUrl: string;
};

export type VerifyPaymentInput = {
  reference: string;
};

export type VerifyPaymentResult = {
  provider: PaymentProviderId;
  reference: string;
  paid: boolean;
  amountKobo: number;
  rawStatus: string;
};

export interface PaymentAdapter {
  id: PaymentProviderId;
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  verify(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
  verifyWebhook(rawBody: string, signature: string | null): Promise<VerifyPaymentResult | null>;
}

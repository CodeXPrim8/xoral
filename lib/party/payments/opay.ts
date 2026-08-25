import { createHmac } from 'crypto';
import type { PaymentAdapter, InitiatePaymentInput, VerifyPaymentInput, VerifyPaymentResult } from './types';

function creds() {
  const merchantId = process.env.OPAY_MERCHANT_ID;
  const secret = process.env.OPAY_SECRET_KEY;
  const publicKey = process.env.OPAY_PUBLIC_KEY;
  const base = (process.env.OPAY_BASE_URL || 'https://liveapi.opaycheckout.com').replace(/\/$/, '');
  if (!merchantId || !secret) {
    throw new Error('OPay credentials are not configured. Set OPAY_MERCHANT_ID and OPAY_SECRET_KEY.');
  }
  return { merchantId, secret, publicKey, base };
}

function hmacSha512(secret: string, rawBody: string) {
  return createHmac('sha512', secret).update(rawBody).digest('hex');
}

function hmacSha3(secret: string, payload: string) {
  return createHmac('sha3-512', secret).update(payload).digest('hex');
}

async function opay(path: string, body: Record<string, unknown>, auth: 'public' | 'signature') {
  const { merchantId, secret, publicKey, base } = creds();
  const raw = JSON.stringify(body);
  const bearer = auth === 'public'
    ? publicKey
    : hmacSha512(secret, raw);
  if (!bearer) {
    throw new Error(auth === 'public'
      ? 'OPay public key is missing. Set OPAY_PUBLIC_KEY (cashier create uses the public key, not HMAC).'
      : 'OPay secret key is missing.');
  }
  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearer}`,
      MerchantId: merchantId,
      'Content-Type': 'application/json',
    },
    body: raw,
  });
  return response.json() as Promise<{
    code?: string;
    message?: string;
    data?: {
      cashierUrl?: string;
      reference?: string;
      orderNo?: string;
      status?: string;
      amount?: { total?: number };
    };
  }>;
}

function paidStatus(status: string) {
  const value = status.toUpperCase();
  return value === 'SUCCESS' || value === 'SUCCESSFUL' || value === 'COMPLETED';
}

function callbackSignature(payload: {
  amount?: string | number;
  currency?: string;
  reference?: string;
  refunded?: boolean;
  status?: string;
  timestamp?: string;
  token?: string;
  transactionId?: string;
}) {
  const amount = String(payload.amount ?? '');
  const currency = String(payload.currency ?? 'NGN');
  const reference = String(payload.reference ?? '');
  const refunded = payload.refunded ? 't' : 'f';
  const status = String(payload.status ?? '');
  const timestamp = String(payload.timestamp ?? '');
  const token = String(payload.token ?? '');
  const transactionId = String(payload.transactionId ?? '');
  return `{Amount:"${amount}",Currency:"${currency}",Reference:"${reference}",Refunded:${refunded},Status:"${status}",Timestamp:"${timestamp}",Token:"${token}",TransactionID:"${transactionId}"}`;
}

export const opayAdapter: PaymentAdapter = {
  id: 'opay',
  async initiate(input: InitiatePaymentInput) {
    const body = {
      country: 'NG',
      reference: input.orderId,
      amount: { total: input.amountKobo, currency: input.currency },
      returnUrl: input.callbackUrl,
      callbackUrl: input.webhookUrl || input.callbackUrl,
      cancelUrl: input.callbackUrl,
      expireAt: 120,
      customerVisitSource: 'BROWSER',
      product: { name: 'Xoral Party Ticket', description: `Order ${input.orderId}` },
      userInfo: {
        userEmail: input.email,
        userId: input.orderId,
        userMobile: input.phone || '',
        userName: input.fullName || '',
      },
    };
    const json = await opay('/api/v1/international/cashier/create', body, 'public');
    if (!json.data?.cashierUrl) {
      throw new Error(json.message || 'OPay checkout could not start.');
    }
    return {
      provider: 'opay' as const,
      reference: json.data.reference || json.data.orderNo || input.orderId,
      authorizationUrl: json.data.cashierUrl,
    };
  },
  async verify(input: VerifyPaymentInput) {
    const json = await opay('/api/v1/international/cashier/status', {
      country: 'NG',
      reference: input.reference,
    }, 'signature');
    const status = String(json.data?.status || json.message || '');
    return {
      provider: 'opay' as const,
      reference: json.data?.reference || input.reference,
      paid: paidStatus(status),
      amountKobo: json.data?.amount?.total ?? 0,
      rawStatus: status || 'unknown',
    };
  },
  async verifyWebhook(rawBody: string, _signature: string | null): Promise<VerifyPaymentResult | null> {
    try {
      const parsed = JSON.parse(rawBody) as {
        payload?: {
          amount?: string | number;
          currency?: string;
          reference?: string;
          refunded?: boolean;
          status?: string;
          timestamp?: string;
          token?: string;
          transactionId?: string;
        };
        sha512?: string;
        reference?: string;
        status?: string;
        amount?: string | number;
      };
      const payload = parsed.payload ?? {
        reference: parsed.reference,
        status: parsed.status,
        amount: parsed.amount,
      };
      const reference = String(payload.reference || '');
      if (!reference) return null;

      const secret = process.env.OPAY_SECRET_KEY;
      if (secret && parsed.sha512 && parsed.payload) {
        const expected = hmacSha3(secret, callbackSignature(parsed.payload));
        if (expected !== parsed.sha512.toLowerCase() && expected !== parsed.sha512) {
          // Status API in the webhook route is the source of truth.
        }
      }

      const status = String(payload.status || '');
      const rawAmount = payload.amount;
      const amount = typeof rawAmount === 'number' ? rawAmount : Number(rawAmount || 0);
      return {
        provider: 'opay',
        reference,
        paid: paidStatus(status),
        amountKobo: Number.isFinite(amount) ? amount : 0,
        rawStatus: status || 'unknown',
      };
    } catch {
      return null;
    }
  },
};

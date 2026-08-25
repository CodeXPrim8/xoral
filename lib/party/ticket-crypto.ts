import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const PREFIX = 'xp';

function secret() {
  return process.env.PARTY_TICKET_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-only-ticket-secret-change-me');
}

export function createTicketId() {
  return `XP-${randomBytes(6).toString('hex').toUpperCase()}`;
}

export function createOrderId() {
  return `XO-${randomBytes(5).toString('hex').toUpperCase()}`;
}

export function signTicketPayload(ticketId: string) {
  const key = secret();
  if (!key) throw new Error('PARTY_TICKET_SECRET is not configured');
  const sig = createHmac('sha256', key).update(ticketId).digest('hex').slice(0, 24);
  return `${PREFIX}:${ticketId}.${sig}`;
}

export function verifyTicketPayload(payload: string): string | null {
  const key = secret();
  if (!key) return null;
  const match = payload.trim().match(/^xp:([A-Z0-9-]+)\.([a-f0-9]{24})$/i);
  if (!match) return null;
  const ticketId = match[1];
  const given = match[2].toLowerCase();
  const expected = createHmac('sha256', key).update(ticketId).digest('hex').slice(0, 24);
  try {
    if (given.length !== expected.length) return null;
    if (!timingSafeEqual(Buffer.from(given), Buffer.from(expected))) return null;
    return ticketId;
  } catch {
    return null;
  }
}

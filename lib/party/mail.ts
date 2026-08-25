import QRCode from 'qrcode';
import { MOCK_EVENT } from './mock-event';
import { formatEventDate, formatNaira } from './format';
import type { PartyOrder, PartyTicket } from './types';

function siteUrl(origin?: string) {
  return (origin || process.env.NEXT_PUBLIC_SITE_URL || process.env.PARTY_SITE_URL || '').replace(/\/$/, '');
}

function ticketUrl(origin: string | undefined, ticketId: string) {
  const base = siteUrl(origin) || 'https://xoral.world';
  return `${base}/party/ticket/${ticketId}`;
}

async function sendResend(to: string, subject: string, html: string, attachments: { filename: string; content: string }[]) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.PARTY_FROM_EMAIL || 'Xoral Party <tickets@xoral.studio>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html, attachments }),
  });
  return res.ok;
}

export async function sendTicketEmail(order: PartyOrder, tickets: PartyTicket[], origin?: string) {
  if (!order.email) return false;
  const attachments = await Promise.all(
    tickets.map(async (ticket, i) => ({
      filename: `xoral-ticket-${i + 1}.png`,
      content: (await QRCode.toBuffer(ticket.qrPayload, { margin: 1, width: 360 })).toString('base64'),
    })),
  );
  const links = tickets
    .map((ticket) => `<p style="margin:12px 0"><a href="${ticketUrl(origin, ticket.id)}">${ticket.ticketTypeName} · ${ticket.id}</a></p>`)
    .join('');
  const html = `
    <div style="font-family:Arial,sans-serif;background:#050308;color:#f7f1ea;padding:24px">
      <p style="letter-spacing:.2em;text-transform:uppercase;color:#e8c36a">Xoral Party VOL. 08</p>
      <h1 style="font-size:28px;line-height:1.1">You're in.</h1>
      <p>Hi ${order.fullName.split(' ')[0]}, your payment is confirmed.</p>
      <p>${formatEventDate(MOCK_EVENT.startsAt)} · ${MOCK_EVENT.scheduleLabel}<br/>${MOCK_EVENT.venue}, ${MOCK_EVENT.address} · ${MOCK_EVENT.city}</p>
      <p>Paid ${formatNaira(order.totalKobo)}. Show a QR at the door. 18+ with ID.</p>
      ${links}
      <p style="color:#9a8f86;font-size:12px">ONE PARTY. TWO WORLDS. · 30 September 2026</p>
    </div>
  `;
  const sent = await sendResend(order.email, 'Your Xoral Party tickets', html, attachments);
  if (!sent) {
    console.warn('[party] Ticket email not sent. Set RESEND_API_KEY and PARTY_FROM_EMAIL.');
  }
  return sent;
}

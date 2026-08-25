'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { readTickets, type StoredTicket } from '@/lib/party/client-store';
import { formatEventDate } from '@/lib/party/format';
import { MOCK_EVENT } from '@/lib/party/mock-event';

export default function DigitalTicketPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<StoredTicket | null>(null);
  const [qr, setQr] = useState('');
  const [shareSafe, setShareSafe] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const local = readTickets().find((t) => t.id === id);
    if (local) {
      setTicket(local);
      return;
    }
    void fetch(`/api/party/ticket/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.ticket) {
          setMissing(true);
          return;
        }
        setTicket({
          ...json.ticket,
          eventName: `${json.event.name} ${json.event.volume}`,
          eventDate: json.event.startsAt,
          venue: json.event.venue,
          orderNumber: json.order?.id || json.ticket.orderId,
        });
      })
      .catch(() => setMissing(true));
  }, [id]);

  useEffect(() => {
    if (!ticket) return;
    const payload = shareSafe ? `XORAL PARTY · ${ticket.ticketTypeName}` : ticket.qrPayload;
    void QRCode.toDataURL(payload, { margin: 1, width: 320, color: { dark: '#14010c', light: '#f7f1ea' } }).then(setQr);
  }, [ticket, shareSafe]);

  if (missing) {
    return (
      <div className="xp-wrap pt-28 pb-24">
        <h1 className="xp-display text-4xl">TICKET NOT FOUND</h1>
        <p className="mt-4 text-white/60">Use the link in your confirmation email.</p>
      </div>
    );
  }

  if (!ticket) {
    return <div className="xp-wrap pt-28 pb-24 text-white/60">Loading ticket…</div>;
  }

  return (
    <div className="xp-wrap pt-28 pb-24 max-w-md">
      <article className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-b from-[#2a1024] to-[#0b0710] p-6">
        <p className="xp-kicker">Bison Note</p>
        <h1 className="xp-display text-4xl mt-3">{ticket.eventName}</h1>
        <p className="mt-2 text-white/70">{formatEventDate(ticket.eventDate)} · {MOCK_EVENT.scheduleLabel}</p>
        <p className="text-white/70">{ticket.venue}</p>
        <div className="mt-6 border-t border-dashed border-white/20 pt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Guest</p>
          <p className="text-2xl mt-1">{ticket.guestName}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/40">Category</p>
          <p className="mt-1">{ticket.ticketTypeName}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/40">Ticket ID</p>
          <p className="mt-1 font-mono text-sm">{ticket.id}</p>
          <p className="mt-2 text-xs text-white/40">Order {ticket.orderNumber}</p>
        </div>
        {qr && (
          <img src={qr} alt={shareSafe ? 'Shareable ticket graphic' : 'Entry QR code'} className="mt-6 w-full rounded-2xl" />
        )}
        {shareSafe && <p className="mt-3 text-xs text-[var(--xp-gold)]">Share mode: entry QR is hidden.</p>}
      </article>
      <div className="mt-6 flex flex-col gap-3">
        <button type="button" className="xp-btn xp-btn-ghost" onClick={() => setShareSafe((v) => !v)}>
          {shareSafe ? 'Show entry QR' : 'Share ticket (hide QR)'}
        </button>
      </div>
    </div>
  );
}

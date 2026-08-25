'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatEventDate, formatNaira } from '@/lib/party/format';
import { formatBu } from '@/lib/party/bison';
import type { PartyAdminSnapshot } from '@/lib/party/admin-snapshot';
import { COMMISSION_RATE } from '@/lib/party/sales-config';

type Tab = 'overview' | 'orders' | 'tickets' | 'team' | 'door';

function money(kobo: number) {
  return `${formatBu(kobo)} · ${formatNaira(kobo)}`;
}

function stamp(iso: string) {
  if (!iso) return '—';
  const d = iso.slice(0, 16).replace('T', ' ');
  return d;
}

export function PartySuperAdmin({ data }: { data: PartyAdminSnapshot }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const paid = data.orders.filter((o) => o.status === 'paid');
  const pending = data.orders.filter((o) => o.status === 'pending');
  const failed = data.orders.filter((o) => o.status === 'failed');
  const revenue = paid.reduce((s, o) => s + o.totalKobo, 0);
  const commission = data.sales.reduce((s, row) => s + row.commissionKobo, 0);
  const attendees = paid.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0);
  const checkedIn = data.issued.filter((t) => t.checkedInAt).length;
  const vendors = data.people.filter((p) => p.role === 'vendor');
  const sellers = data.people.filter((p) => p.role === 'seller');

  const query = q.trim().toLowerCase();
  const match = (parts: Array<string | undefined | null>) =>
    !query || parts.some((p) => (p || '').toLowerCase().includes(query));

  const orders = useMemo(
    () => data.orders.filter((o) => match([o.id, o.email, o.fullName, o.phone, o.referralCode, o.status, o.paymentReference])),
    [data.orders, query],
  );
  const issued = useMemo(
    () => data.issued.filter((t) => match([t.id, t.guestName, t.ticketTypeName, t.orderId, t.checkedInAt ? 'in' : 'out'])),
    [data.issued, query],
  );
  const people = useMemo(
    () => data.people.filter((p) => match([p.name, p.email, p.phone, p.code, p.role])),
    [data.people, query],
  );
  const sales = useMemo(
    () => data.sales.filter((s) => match([s.guestName, s.guestEmail, s.orderId, s.personId])),
    [data.sales, query],
  );

  const leaderboard = [...data.people]
    .map((p) => {
      const rows = data.sales.filter((s) => s.personId === p.id);
      return {
        ...p,
        attendees: rows.reduce((n, s) => n + s.attendees, 0),
        amount: rows.reduce((n, s) => n + s.amountKobo, 0),
        commission: rows.reduce((n, s) => n + s.commissionKobo, 0),
      };
    })
    .sort((a, b) => b.attendees - a.attendees || b.amount - a.amount);

  async function resetDoor(ticketId: string) {
    setBusy(ticketId);
    try {
      const res = await fetch('/api/admin/party/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, action: 'reset' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not reset');
      toast.success('Check-in cleared');
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not reset');
    } finally {
      setBusy(null);
    }
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: `Orders (${data.orders.length})` },
    { id: 'tickets', label: `Tickets (${data.issued.length})` },
    { id: 'team', label: `Sales desk (${data.people.length})` },
    { id: 'door', label: `Door (${checkedIn}/${data.issued.length})` },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Super admin</p>
          <h1 className="text-2xl font-black mt-1">Xoral Party</h1>
          <p className="text-sm text-foreground/60 mt-1">
            {data.event.name} {data.event.volume} · {formatEventDate(data.event.startsAt)} · {data.event.venue}, {data.event.city}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/party" className="rounded-lg border border-border px-3 py-2 hover:bg-card">Public site</Link>
          <Link href="/party/sales" className="rounded-lg border border-border px-3 py-2 hover:bg-card">Sales desk</Link>
          <Link href="/party/check-in" className="rounded-lg border border-border px-3 py-2 hover:bg-card">Door scanner</Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Paid revenue', value: money(revenue), sub: `${paid.length} paid · ${pending.length} pending · ${failed.length} failed` },
          { label: 'Guests sold', value: String(attendees), sub: `${data.issued.length} digital tickets issued` },
          { label: 'Door', value: `${checkedIn} in`, sub: `${Math.max(0, data.issued.length - checkedIn)} still outside` },
          { label: `Commission (${Math.round(COMMISSION_RATE * 100)}%)`, value: money(commission), sub: `${vendors.length} vendors · ${sellers.length} sellers` },
        ].map((card) => (
          <div key={card.label} className="glass-card rounded-xl p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/45">{card.label}</p>
            <p className="mt-2 text-lg font-bold leading-tight">{card.value}</p>
            <p className="mt-1 text-xs text-foreground/50">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${tab === item.id ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground/70'}`}
          >
            {item.label}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, code, order…"
          className="ml-auto min-w-[200px] flex-1 max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <section className="glass-card rounded-xl p-5 overflow-x-auto">
            <h2 className="font-semibold mb-3">Inventory</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-foreground/45">
                  <th className="py-2">Ticket</th>
                  <th>Guys</th>
                  <th>Girls</th>
                  <th>Ladies Duo</th>
                  <th>Sold</th>
                  <th>Left</th>
                  <th>Cap</th>
                </tr>
              </thead>
              <tbody>
                {data.tickets.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="py-2">{t.name}</td>
                    <td>{formatNaira(t.maleKobo)}</td>
                    <td>{formatNaira(t.femaleKobo)}</td>
                    <td>{formatNaira(t.femaleMultiKobo * 2)} / 2</td>
                    <td>{t.sold}</td>
                    <td className={t.remaining === 0 ? 'text-destructive' : ''}>{t.remaining === 0 ? 'Sold out' : t.remaining}</td>
                    <td>{t.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="glass-card rounded-xl p-5 overflow-x-auto">
            <h2 className="font-semibold mb-3">Sales leaderboard</h2>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-foreground/50">No vendors or sellers yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-foreground/45">
                    <th className="py-2">Person</th>
                    <th>Role</th>
                    <th>Code</th>
                    <th>Sold</th>
                    <th>Take</th>
                    <th>Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="py-2">{p.name}</td>
                      <td className="capitalize">{p.role}</td>
                      <td className="font-mono text-xs">{p.code}</td>
                      <td>{p.attendees}</td>
                      <td>{money(p.amount)}</td>
                      <td>{money(p.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}

      {tab === 'orders' && (
        <section className="glass-card rounded-xl p-5 overflow-x-auto">
          {orders.length === 0 ? (
            <p className="text-sm text-foreground/50">No matching orders.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-foreground/45">
                  <th className="py-2">When</th>
                  <th>Guest</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Ref</th>
                  <th>Mail</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border align-top">
                    <td className="py-2 whitespace-nowrap">{stamp(o.createdAt)}</td>
                    <td>
                      <p>{o.fullName}</p>
                      <p className="text-xs text-foreground/50">{o.email} · {o.phone}</p>
                      {o.referralCode && <p className="text-xs text-primary">ref {o.referralCode}</p>}
                    </td>
                    <td className="capitalize">{o.status}</td>
                    <td>{money(o.totalKobo)}</td>
                    <td className="font-mono text-xs">{o.paymentReference || o.id}</td>
                    <td>{o.emailSentAt ? stamp(o.emailSentAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {tab === 'tickets' && (
        <section className="glass-card rounded-xl p-5 overflow-x-auto">
          {issued.length === 0 ? (
            <p className="text-sm text-foreground/50">No matching tickets.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-foreground/45">
                  <th className="py-2">Guest</th>
                  <th>Type</th>
                  <th>Order</th>
                  <th>Door</th>
                </tr>
              </thead>
              <tbody>
                {issued.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="py-2">
                      <Link href={`/party/ticket/${t.id}`} className="hover:text-primary">{t.guestName}</Link>
                      <p className="font-mono text-[10px] text-foreground/40">{t.id}</p>
                    </td>
                    <td>{t.ticketTypeName}</td>
                    <td className="font-mono text-xs">{t.orderId}</td>
                    <td>{t.checkedInAt ? stamp(t.checkedInAt) : 'Not in'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {tab === 'team' && (
        <div className="space-y-6">
          <section className="glass-card rounded-xl p-5 overflow-x-auto">
            <h2 className="font-semibold mb-3">Vendors & sellers</h2>
            {people.length === 0 ? (
              <p className="text-sm text-foreground/50">No matching accounts.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-foreground/45">
                    <th className="py-2">Name</th>
                    <th>Role</th>
                    <th>Code</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="py-2">{p.name}</td>
                      <td className="capitalize">{p.role}{p.vendorId ? ` · ${p.vendorId}` : ''}</td>
                      <td className="font-mono text-xs">{p.code}</td>
                      <td className="text-xs">{p.email}<br />{p.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
          <section className="glass-card rounded-xl p-5 overflow-x-auto">
            <h2 className="font-semibold mb-3">Attributed sales</h2>
            {sales.length === 0 ? (
              <p className="text-sm text-foreground/50">No matching sales.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-foreground/45">
                    <th className="py-2">When</th>
                    <th>Guest</th>
                    <th>Heads</th>
                    <th>Amount</th>
                    <th>Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-2 whitespace-nowrap">{stamp(s.createdAt)}</td>
                      <td>{s.guestName}<p className="text-xs text-foreground/50">{s.guestEmail}</p></td>
                      <td>{s.attendees}</td>
                      <td>{money(s.amountKobo)}</td>
                      <td>{money(s.commissionKobo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}

      {tab === 'door' && (
        <section className="glass-card rounded-xl p-5 overflow-x-auto">
          {issued.length === 0 ? (
            <p className="text-sm text-foreground/50">No tickets issued yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-foreground/45">
                  <th className="py-2">Guest</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {issued.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="py-2">{t.guestName}</td>
                    <td>{t.ticketTypeName}</td>
                    <td>{t.checkedInAt ? `In · ${stamp(t.checkedInAt)}` : 'Outside'}</td>
                    <td>
                      {t.checkedInAt && (
                        <button
                          type="button"
                          disabled={busy === t.id}
                          onClick={() => void resetDoor(t.id)}
                          className="text-xs text-primary hover:underline disabled:opacity-50"
                        >
                          {busy === t.id ? 'Clearing…' : 'Clear check-in'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}

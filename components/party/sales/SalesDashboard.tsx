'use client';

import { FormEvent, useEffect, useState } from 'react';
import { formatNaira } from '@/lib/party/format';
import { MILESTONES, PERSON_TARGET } from '@/lib/party/sales-config';

type Dash = {
  me: { id: string; role: 'vendor' | 'seller'; name: string; email: string; code: string };
  attendees: number;
  commissionKobo: number;
  target: number;
  milestone: { by: string; attendees: number; label: string };
  sales: Array<{
    id: string;
    orderId: string;
    personId: string;
    attendees: number;
    amountKobo: number;
    commissionKobo: number;
    createdAt: string;
    guestName: string;
    guestEmail: string;
    soldBy?: string;
  }>;
  sellers: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    code: string;
    attendees: number;
    amountKobo: number;
    commissionKobo: number;
  }>;
  teamAttendees: number;
  personalAttendees: number;
  personalCommissionKobo: number;
  personalAmountKobo?: number;
  bonus75: boolean;
  bonus100: boolean;
  bonus100Kobo: number;
  topSeller: boolean;
  topSellerKobo: number;
};

function sellLink(code: string) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/party/tickets?ref=${encodeURIComponent(code)}`;
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function Ring({ value, max, label }: { value: number; max: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, max <= 0 ? 0 : value / max);
  return (
    <div className="relative mx-auto h-[168px] w-[168px]">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="xpSalesRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8c36a" />
            <stop offset="100%" stopColor="#ff2d8a" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="11" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="url(#xpSalesRing)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="xp-display text-[2rem] leading-none">{value}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/40">of {max}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--xp-gold)]">{label}</p>
      </div>
    </div>
  );
}

function PaceChart({ current }: { current: number }) {
  const w = 640;
  const h = 220;
  const padL = 36;
  const padR = 16;
  const padT = 18;
  const padB = 36;
  const max = PERSON_TARGET;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const points = MILESTONES.map((row, i) => {
    const x = padL + (i / (MILESTONES.length - 1)) * innerW;
    const y = padT + innerH - (row.attendees / max) * innerH;
    return { x, y, ...row };
  });
  const targetPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${targetPath} L${points[points.length - 1].x},${padT + innerH} L${points[0].x},${padT + innerH} Z`;
  const actualY = padT + innerH - (Math.min(current, max) / max) * innerH;
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
  let nowIndex = 0;
  for (let i = 0; i < MILESTONES.length; i++) {
    nowIndex = i;
    if (today <= MILESTONES[i].by) break;
  }
  const nowX = points[nowIndex].x;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[200px] sm:h-[240px]" role="img" aria-label="Sales pace against checkpoints">
      <defs>
        <linearGradient id="xpPaceFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff2d8a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#e8c36a" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = padT + innerH - (tick / max) * innerH;
        return (
          <g key={tick}>
            <line x1={padL} x2={w - padR} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />
            <text x={8} y={y + 4} fill="rgba(255,255,255,0.35)" fontSize="10">{tick}</text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#xpPaceFill)" />
      <path d={targetPath} fill="none" stroke="#e8c36a" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1={padL} x2={w - padR} y1={actualY} y2={actualY} stroke="#ff2d8a" strokeDasharray="5 5" strokeWidth="1.5" />
      <circle cx={nowX} cy={actualY} r="7" fill="#ff2d8a" stroke="#fff" strokeWidth="2" />
      {points.map((p) => (
        <g key={p.by}>
          <circle cx={p.x} cy={p.y} r="3.5" fill={current >= p.attendees ? '#e8c36a' : 'rgba(255,255,255,0.35)'} />
          <text x={p.x} y={h - 10} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function SalesDashboard() {
  const [dash, setDash] = useState<Dash | null>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [tab, setTab] = useState<'home' | 'sellers' | 'sales'>('home');
  const [copied, setCopied] = useState('');

  async function load() {
    const res = await fetch('/api/party/sales/me', { cache: 'no-store' });
    if (!res.ok) {
      setDash(null);
      return;
    }
    setDash(await res.json());
  }

  useEffect(() => {
    void load();
  }, []);

  async function onAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/party/sales/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: mode,
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        password: form.get('password'),
        invite: form.get('invite'),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Could not continue.');
      return;
    }
    setDash(null);
    void load();
  }

  async function onAddSeller(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/party/sales/sellers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        password: form.get('password'),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Could not add seller.');
      return;
    }
    (e.currentTarget as HTMLFormElement).reset();
    void load();
  }

  async function logout() {
    await fetch('/api/party/sales/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    setDash(null);
  }

  const count = dash ? (dash.me.role === 'vendor' ? dash.teamAttendees : dash.personalAttendees) : 0;
  const duePct = dash ? Math.min(100, Math.round((count / dash.milestone.attendees) * 100)) : 0;

  if (!dash) {
    return (
      <div className="xp-wrap pt-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-24 max-w-lg">
        <p className="xp-kicker">Sales team</p>
        <h1 className="xp-display text-[2rem] sm:text-5xl mt-3">{mode === 'login' ? 'TEAM LOGIN' : 'REGISTER VENDOR'}</h1>
        <p className="mt-3 text-white/60">Vendors register here. Sellers use the login their vendor created for them.</p>
        <form onSubmit={onAuth} className="mt-8 space-y-3">
          {mode === 'register' && (
            <>
              <input name="name" required placeholder="Full name" className="xp-field" />
              <input name="phone" required placeholder="Phone" className="xp-field" />
              <input name="invite" placeholder="Vendor invite code (if you were given one)" className="xp-field" />
            </>
          )}
          <input name="email" type="email" required placeholder="Email" className="xp-field" />
          <input name="password" type="password" required minLength={6} placeholder="Password" className="xp-field" />
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <button type="submit" className="xp-btn xp-btn-primary w-full">{mode === 'login' ? 'Log in' : 'Create vendor account'}</button>
        </form>
        <button type="button" className="mt-6 text-sm text-white/50" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'New vendor? Register' : 'Already on the team? Log in'}
        </button>
      </div>
    );
  }

  const vendor = dash.me.role === 'vendor';
  const tabs = [
    { id: 'home' as const, label: 'Pace' },
    ...(vendor ? [{ id: 'sellers' as const, label: 'Sellers' }] : []),
    { id: 'sales' as const, label: 'Sales' },
  ];

  return (
    <div className="xp-wrap pt-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="xp-kicker">{vendor ? 'Vendor desk' : 'Seller desk'}</p>
          <h1 className="xp-display text-[1.85rem] sm:text-4xl mt-2 tracking-[0.08em]">{dash.me.name.split(' ')[0]}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[var(--xp-gold)]"
            onClick={async () => {
              if (await copyText(sellLink(dash.me.code))) {
                setCopied(dash.me.code);
                window.setTimeout(() => setCopied(''), 1500);
              }
            }}
          >
            {copied === dash.me.code ? 'Copied' : `Copy · ${dash.me.code}`}
          </button>
          <button type="button" className="xp-btn xp-btn-ghost !py-2 !px-4 !text-xs" onClick={() => void logout()}>
            Log out
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[200px_1fr_1fr]">
        <div className="xp-glass p-5 flex flex-col items-center justify-center">
          <Ring value={count} max={PERSON_TARGET} label={vendor ? 'Team' : 'Sold'} />
        </div>
        <div className="xp-glass p-6 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Commission · 10%</p>
          <p className="xp-display text-4xl sm:text-5xl mt-3 text-[var(--xp-gold)]">{formatNaira(dash.personalCommissionKobo)}</p>
          <p className="mt-2 text-sm text-white/45">
            {vendor
              ? 'From tickets you sold yourself'
              : dash.personalCommissionKobo > 0
                ? `That’s 10% of ${formatNaira(dash.personalAmountKobo || dash.personalCommissionKobo * 10)} in tickets you sold`
                : '10% of every ticket you sell'}
          </p>
        </div>
        <div className="xp-glass p-6 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">This checkpoint · {dash.milestone.label}</p>
          <p className="xp-display text-4xl sm:text-5xl mt-3">{count}<span className="text-white/30 text-2xl"> / {dash.milestone.attendees}</span></p>
          <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[var(--xp-gold)] to-[var(--xp-magenta)]" style={{ width: `${duePct}%` }} />
          </div>
          <p className="mt-2 text-sm text-white/45">{duePct}% of what’s due now</p>
        </div>
      </div>

      {vendor ? (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className={`rounded-full px-3 py-1.5 border ${dash.bonus75 ? 'border-[var(--xp-gold)] text-[var(--xp-gold)]' : 'border-white/15 text-white/40'}`}>
            75 {dash.bonus75 ? 'hit' : 'open'}
          </span>
          <span className={`rounded-full px-3 py-1.5 border ${dash.bonus100 ? 'border-[var(--xp-magenta)] text-[var(--xp-magenta)]' : 'border-white/15 text-white/40'}`}>
            100 {dash.bonus100 ? '+ ₦20,000' : 'locked'}
          </span>
          <span className={`rounded-full px-3 py-1.5 border ${dash.topSeller ? 'border-[var(--xp-gold)] text-[var(--xp-gold)]' : 'border-white/15 text-white/40'}`}>
            {dash.topSeller ? 'Top seller + ₦30,000' : 'Top seller ₦30,000'}
          </span>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full px-3 py-1.5 border border-[var(--xp-gold)] text-[var(--xp-gold)]">
            You keep 10% of every ticket you sell
          </span>
        </div>
      )}

      <div className="mt-8 flex rounded-full border border-white/10 p-1 w-fit bg-black/30">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-5 py-2 text-xs uppercase tracking-[0.16em] ${tab === item.id ? 'bg-gradient-to-r from-[var(--xp-gold)] to-[var(--xp-magenta)] text-black' : 'text-white/50'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'home' && (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="xp-glass p-5 sm:p-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="xp-kicker">Pace</p>
                <p className="mt-2 text-sm text-white/50">Gold line is the target. Pink is where you are.</p>
              </div>
              <p className="text-xs text-white/35 hidden sm:block">100 attendees</p>
            </div>
            <div className="mt-2">
              <PaceChart current={count} />
            </div>
          </div>
          <div className="xp-glass p-5 sm:p-6">
            <p className="xp-kicker">Checkpoints</p>
            <ul className="mt-5 space-y-4">
              {MILESTONES.map((row) => {
                const hit = count >= row.attendees;
                const rowPct = Math.min(100, Math.round((count / row.attendees) * 100));
                const due = dash.milestone.by === row.by;
                return (
                  <li key={row.by}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className={due ? 'text-[var(--xp-gold)]' : 'text-white/70'}>{row.label}</span>
                      <span className={hit ? 'text-[var(--xp-gold)]' : 'text-white/40'}>
                        {hit ? 'Done' : `${Math.min(count, row.attendees)}/${row.attendees}`}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${hit ? 'bg-[var(--xp-gold)]' : 'bg-gradient-to-r from-[var(--xp-gold)] to-[var(--xp-magenta)]'}`}
                        style={{ width: `${rowPct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {tab === 'sellers' && vendor && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <form onSubmit={onAddSeller} className="xp-glass p-5 sm:p-6 space-y-3">
            <p className="xp-kicker">Add a seller</p>
            <input name="name" required placeholder="Full name" className="xp-field" />
            <input name="phone" required placeholder="Phone" className="xp-field" />
            <input name="email" type="email" required placeholder="Email" className="xp-field" />
            <input name="password" type="password" required minLength={6} placeholder="Password for them" className="xp-field" />
            {error && <p className="text-sm text-rose-300">{error}</p>}
            <button type="submit" className="xp-btn xp-btn-primary w-full">Register seller</button>
          </form>
          <div className="xp-glass p-5 sm:p-6">
            <p className="xp-kicker">Your sellers</p>
            <ul className="mt-5 space-y-4">
              {dash.sellers.length === 0 && <li className="text-white/45 text-sm">No sellers yet.</li>}
              {dash.sellers.map((seller) => {
                const sellerPct = Math.min(100, Math.round((seller.attendees / PERSON_TARGET) * 100));
                return (
                  <li key={seller.id} className="rounded-2xl border border-white/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{seller.name}</p>
                        <p className="text-xs text-white/40 mt-1">{seller.attendees} attendees · sold {formatNaira(seller.amountKobo || 0)}</p>
                        <p className="text-sm text-[var(--xp-gold)] mt-1">Commission {formatNaira(seller.commissionKobo)}</p>
                      </div>
                      <button
                        type="button"
                        className="text-[10px] uppercase tracking-[0.16em] text-[var(--xp-gold)]"
                        onClick={async () => {
                          if (await copyText(sellLink(seller.code))) {
                            setCopied(seller.code);
                            window.setTimeout(() => setCopied(''), 1500);
                          }
                        }}
                      >
                        {copied === seller.code ? 'Copied' : seller.code}
                      </button>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[var(--xp-gold)] to-[var(--xp-magenta)]" style={{ width: `${sellerPct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {tab === 'sales' && (
        <div className="mt-6 xp-glass overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/35 text-[10px] uppercase tracking-[0.16em]">
              <tr>
                <th className="p-4">Guest</th>
                <th className="p-4">Sold by</th>
                <th className="p-4">In</th>
                <th className="p-4">Paid</th>
                <th className="p-4">10%</th>
              </tr>
            </thead>
            <tbody>
              {dash.sales.map((sale) => (
                <tr key={sale.id} className="border-t border-white/10">
                  <td className="p-4">{sale.guestName}<div className="text-xs text-white/35">{sale.guestEmail}</div></td>
                  <td className="p-4 text-white/70">{sale.soldBy || '—'}</td>
                  <td className="p-4">{sale.attendees}</td>
                  <td className="p-4">{formatNaira(sale.amountKobo)}</td>
                  <td className="p-4 text-[var(--xp-gold)]">{formatNaira(sale.commissionKobo)}</td>
                </tr>
              ))}
              {dash.sales.length === 0 && (
                <tr><td className="p-6 text-white/45" colSpan={5}>No paid sales on this link yet.</td></tr>
              )}
            </tbody>
            {dash.sales.length > 0 && (
              <tfoot>
                <tr className="border-t border-white/15">
                  <td className="p-4 text-white/50" colSpan={3}>{vendor ? 'Team total' : 'Your total'}</td>
                  <td className="p-4">{formatNaira(dash.sales.reduce((sum, sale) => sum + sale.amountKobo, 0))}</td>
                  <td className="p-4 text-[var(--xp-gold)]">{formatNaira(dash.sales.reduce((sum, sale) => sum + sale.commissionKobo, 0))}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

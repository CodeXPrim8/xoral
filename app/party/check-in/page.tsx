'use client';

import { FormEvent, useState } from 'react';

type Result =
  | { status: 'valid'; guestName: string; ticketType: string; orderId: string; at: string }
  | { status: 'already'; guestName: string; ticketType: string; orderId: string; at: string }
  | { status: 'invalid'; message: string };

export default function CheckInPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [payload, setPayload] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [gateError, setGateError] = useState('');

  async function unlock(e: FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/party/check-in/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      setGateError('Staff PIN is incorrect.');
      return;
    }
    setUnlocked(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/party/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, pin }),
    });
    setResult(await res.json());
  }

  if (!unlocked) {
    return (
      <div className="xp-wrap pt-28 pb-24 max-w-sm">
        <h1 className="xp-display text-4xl">STAFF ACCESS</h1>
        <form onSubmit={unlock} className="mt-6 space-y-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Check-in PIN"
            className="xp-field"
          />
          {gateError && <p className="text-sm text-rose-300">{gateError}</p>}
          <button type="submit" className="xp-btn xp-btn-primary w-full">Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="xp-wrap pt-28 pb-24 max-w-lg">
      <p className="xp-kicker">Staff</p>
      <h1 className="xp-display text-5xl mt-3">CHECK-IN</h1>
      <p className="mt-3 text-white/60">Scan a ticket QR or paste the payload. Duplicate entry is blocked.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          placeholder="QR payload"
          className="xp-field"
        />
        <button type="submit" className="xp-btn xp-btn-primary w-full">Check in</button>
      </form>
      {result?.status === 'valid' && (
        <div className="mt-8 xp-glass p-6">
          <p className="xp-display text-4xl text-emerald-300">VALID</p>
          <p className="mt-3">{result.guestName}</p>
          <p>{result.ticketType}</p>
          <p className="text-sm text-white/50">Order {result.orderId}</p>
          <p className="text-sm text-white/50">Entry {new Date(result.at).toLocaleString()}</p>
        </div>
      )}
      {result?.status === 'already' && (
        <div className="mt-8 xp-glass p-6">
          <p className="xp-display text-4xl text-amber-300">ALREADY CHECKED IN</p>
          <p className="mt-3">{result.guestName}</p>
          <p className="text-sm text-white/50">Previously {new Date(result.at).toLocaleString()}</p>
        </div>
      )}
      {result?.status === 'invalid' && (
        <div className="mt-8 xp-glass p-6">
          <p className="xp-display text-4xl text-rose-300">INVALID TICKET</p>
          <p className="mt-3 text-white/70">{result.message}</p>
        </div>
      )}
    </div>
  );
}

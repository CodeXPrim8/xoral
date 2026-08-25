'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { MOCK_EVENT } from '@/lib/party/mock-event';
import { formatEventDate } from '@/lib/party/format';
import { attendShareCaption, ticketShareUrl } from '@/lib/party/share-attend';

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let cursor = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursor);
      line = word;
      cursor += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursor);
  return cursor;
}

async function drawFlyer(ticketUrl: string) {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not draw flyer');

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#14010c');
  bg.addColorStop(0.45, '#050308');
  bg.addColorStop(1, '#1a0a12');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(232,195,106,0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  ctx.fillStyle = '#e8c36a';
  ctx.font = '600 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("I'LL BE THERE", width / 2, 180);

  ctx.fillStyle = '#f7f1ea';
  ctx.font = '800 92px sans-serif';
  ctx.fillText('XORAL PARTY', width / 2, 310);

  ctx.fillStyle = '#ff2d8a';
  ctx.font = '700 42px sans-serif';
  ctx.fillText(MOCK_EVENT.volume, width / 2, 380);

  ctx.fillStyle = '#e8c36a';
  ctx.font = '600 32px sans-serif';
  ctx.fillText(MOCK_EVENT.tagline, width / 2, 470);

  ctx.fillStyle = 'rgba(247,241,234,0.85)';
  ctx.font = '400 34px sans-serif';
  wrap(ctx, formatEventDate(MOCK_EVENT.startsAt), width / 2, 580, 860, 48);
  ctx.fillText(`${MOCK_EVENT.venue}, ${MOCK_EVENT.address} · ${MOCK_EVENT.city}`, width / 2, 660);
  ctx.font = '400 28px sans-serif';
  ctx.fillStyle = 'rgba(247,241,234,0.65)';
  wrap(ctx, MOCK_EVENT.scheduleLabel, width / 2, 730, 860, 40);

  const qr = await QRCode.toDataURL(ticketUrl, {
    margin: 1,
    width: 280,
    color: { dark: '#14010c', light: '#f7f1ea' },
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = qr;
  });
  ctx.drawImage(image, (width - 260) / 2, 860, 260, 260);

  ctx.fillStyle = '#e8c36a';
  ctx.font = '600 22px sans-serif';
  ctx.fillText('SCAN FOR TICKETS', width / 2, 1160);
  ctx.fillStyle = 'rgba(247,241,234,0.55)';
  ctx.font = '400 20px sans-serif';
  ctx.fillText(ticketUrl.replace(/^https?:\/\//, ''), width / 2, 1210);

  return canvas.toDataURL('image/png');
}

export function AttendShare({ salesCode }: { salesCode?: string | null }) {
  const [flyer, setFlyer] = useState('');
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const ticketUrl = ticketShareUrl(origin, salesCode);
  const caption = attendShareCaption(ticketUrl);

  useEffect(() => {
    if (!open) return;
    void drawFlyer(ticketUrl).then(setFlyer).catch(() => setNotice('Could not build the flyer.'));
  }, [open, ticketUrl]);

  async function copyCaption() {
    await navigator.clipboard.writeText(caption);
    setNotice('Caption copied. Paste it under your post.');
  }

  function downloadFlyer() {
    if (!flyer) return;
    const a = document.createElement('a');
    a.href = flyer;
    a.download = 'xoral-party-im-going.png';
    a.click();
    setNotice('Flyer saved. Use it on Instagram or WhatsApp status.');
  }

  async function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, '_blank', 'noopener,noreferrer');
  }

  async function shareInstagram() {
    await copyCaption();
    downloadFlyer();
    setNotice('Flyer saved and caption copied. Open Instagram, post the flyer, then paste.');
  }

  async function shareNative() {
    try {
      if (flyer && navigator.canShare) {
        const res = await fetch(flyer);
        const blob = await res.blob();
        const file = new File([blob], 'xoral-party.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Xoral Party', text: caption });
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ title: 'Xoral Party', text: caption, url: ticketUrl });
        return;
      }
      await copyCaption();
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div className="xp-glass mt-12 p-6 text-left max-w-lg mx-auto">
      <p className="xp-kicker">Bring your people</p>
      {!open ? (
        <>
          <button type="button" className="xp-btn xp-btn-primary mt-5 w-full" onClick={() => setOpen(true)}>
            Tell people you&apos;ll be at Xoral Party
          </button>
          <p className="mt-3 text-sm text-white/45">Creates a flyer and a post with your ticket link.</p>
        </>
      ) : (
        <>
          <p className="mt-3 text-lg">I&apos;ll be at Xoral Party.</p>
          <p className="mt-1 text-sm text-white/55">
            {formatEventDate(MOCK_EVENT.startsAt)} · {MOCK_EVENT.venue}, {MOCK_EVENT.city}
          </p>
          {flyer && (
            <img src={flyer} alt="Xoral Party share flyer" className="mt-5 w-full rounded-2xl border border-white/10" />
          )}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" className="xp-btn xp-btn-primary !text-xs" onClick={() => void shareWhatsApp()}>WhatsApp</button>
            <button type="button" className="xp-btn xp-btn-ghost !text-xs" onClick={() => void shareInstagram()}>Instagram</button>
            <button type="button" className="xp-btn xp-btn-ghost !text-xs" onClick={() => void copyCaption()}>Copy post</button>
            <button type="button" className="xp-btn xp-btn-ghost !text-xs" onClick={downloadFlyer}>Save flyer</button>
          </div>
          <button type="button" className="mt-3 w-full text-xs uppercase tracking-[0.16em] text-white/40" onClick={() => void shareNative()}>
            More apps
          </button>
          {notice && <p className="mt-3 text-sm text-[var(--xp-gold)]">{notice}</p>}
        </>
      )}
    </div>
  );
}

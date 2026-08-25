'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import {
  compressImage,
  deleteNote,
  queueXoralShare,
  readNotes,
  readPhotos,
  savePhoto,
  upsertNote,
  type ClemxNote,
  type ClemxPhoto,
} from '@/lib/clemx/library';

const THREADS = [
  { id: 'sandra', name: 'Sandra Rosewood', last: 'Don’t be late 30 September.', time: '2m' },
  { id: 'clark', name: 'Clark Sylvester', last: 'Parking is a myth in Ikeja.', time: '18m' },
  { id: 'fiona', name: 'Fiona Matthew', last: 'The fit better not flop on the 30th.', time: '1h' },
  { id: 'lora', name: 'Lora Adams', last: 'I already have a sentence for this.', time: '3h' },
  { id: 'davis', name: 'Davis Blake', last: 'I can almost hear Lagos from here.', time: '1d' },
];

export function PhotosApp({ onOpenXoral }: { onOpenXoral?: (kind?: 'post' | 'reel') => void }) {
  const [photos, setPhotos] = useState<ClemxPhoto[]>([]);
  const [open, setOpen] = useState<ClemxPhoto | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = () => setPhotos(readPhotos());
    load();
    window.addEventListener('clemx-photos', load);
    return () => window.removeEventListener('clemx-photos', load);
  }, []);

  async function addFromGallery(file: File) {
    const raw = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(file);
    });
    if (!raw) return;
    savePhoto(await compressImage(raw));
    setPhotos(readPhotos());
  }

  function share(kind: 'post' | 'reel') {
    if (!open) return;
    queueXoralShare(open.src, kind);
    setOpen(null);
    onOpenXoral?.(kind);
  }

  return (
    <div className="cx-ios-app">
      <div className="cx-notes-top">
        <h3>Photos</h3>
        <button type="button" onClick={() => fileRef.current?.click()}>Add</button>
      </div>
      <p className="cx-ios-sub">Recents · {photos.length}</p>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void addFromGallery(file);
        }}
      />
      {photos.length === 0 && <p className="cx-ios-sub">No photos yet. Shoot with Camera or add from your gallery.</p>}
      <div className="cx-photos">
        {photos.map((photo) => (
          <button key={photo.id} type="button" onClick={() => setOpen(photo)}>
            <img src={photo.src} alt="" />
          </button>
        ))}
      </div>
      {open && (
        <div className="cx-photo-full">
          <img src={open.src} alt="" />
          <div className="cx-photo-actions">
            <button type="button" onClick={() => setOpen(null)}>Close</button>
            <button type="button" onClick={() => share('post')}>Post to Xoral</button>
            <button type="button" onClick={() => share('reel')}>Post to Reels</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SafariApp({
  onOpenTickets,
  onOpenPhone,
  onOpenFeed,
  onOpenWeather,
  onOpenBu,
}: {
  onOpenTickets?: () => void;
  onOpenPhone?: () => void;
  onOpenFeed?: () => void;
  onOpenWeather?: () => void;
  onOpenBu?: () => void;
}) {
  const [url, setUrl] = useState('xoral.world/party/tickets');
  return (
    <div className="cx-ios-app cx-safari">
      <form
        className="cx-safari-bar"
        onSubmit={(e) => {
          e.preventDefault();
          if (/ticket/i.test(url)) onOpenTickets?.();
          else if (/buapp|Ƀu|\bbu\b/i.test(url)) onOpenBu?.();
          else if (/xoral/i.test(url)) onOpenFeed?.();
          else if (/vitel|phone|call/i.test(url)) onOpenPhone?.();
          else if (/weather|ikeja/i.test(url)) onOpenWeather?.();
        }}
      >
        <input value={url} onChange={(e) => setUrl(e.target.value)} />
      </form>
      <div className="cx-safari-page">
        <p className="cx-safari-kicker">Favourites</p>
        <div className="cx-favs">
          <button type="button" onClick={() => { setUrl('xoral.world/party/tickets'); onOpenTickets?.(); }}><b>X</b> Tickets</button>
          <button type="button" onClick={() => { setUrl('xoral.world'); onOpenFeed?.(); }}><b>O</b> Xoral</button>
          <button type="button" onClick={() => { setUrl('buapp.vercel.app'); onOpenBu?.(); }}><b>Ƀ</b> ɃU</button>
          <button type="button" onClick={() => { setUrl('vitel.wireless'); onOpenPhone?.(); }}><b>V</b> Phone</button>
        </div>
        <p className="cx-ios-sub mt">Xoral Party VOL. 08 · 30 Sept 2026 · Ambiance, Ikeja</p>
        <button type="button" className="cx-tix-safari" onClick={() => onOpenTickets?.()}>
          Buy tickets
        </button>
      </div>
    </div>
  );
}

export function MessagesApp() {
  const [open, setOpen] = useState<(typeof THREADS)[0] | null>(null);
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div className="cx-ios-app">
      {!open ? (
        <>
          <h3>Messages</h3>
          <div className="cx-threads">
            {THREADS.map((t) => (
              <button key={t.id} type="button" className="cx-thread" onClick={() => { setOpen(t); setSent([]); }}>
                <span className="cx-thread-av">{t.name[0]}</span>
                <span>
                  <strong>{t.name}</strong>
                  <small>{t.last}</small>
                </span>
                <em>{t.time}</em>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="cx-chat">
          <button type="button" className="cx-chat-back" onClick={() => setOpen(null)}>‹ {open.name}</button>
          <div className="cx-chat-log">
            <p className="cx-bubble them">{open.last}</p>
            {sent.map((m) => <p key={m} className="cx-bubble me">{m}</p>)}
          </div>
          <form
            className="cx-chat-in"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              if (!text.trim()) return;
              setSent((s) => [...s, text.trim()]);
              setText('');
            }}
          >
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="iMessage" />
          </form>
        </div>
      )}
    </div>
  );
}

export function WeatherApp() {
  return (
    <div className="cx-ios-app cx-weather">
      <p className="cx-weather-city">Ikeja</p>
      <p className="cx-weather-temp">28°</p>
      <p>Mostly Clear</p>
      <p className="cx-ios-sub">H:31° L:24°</p>
      <div className="cx-weather-row">
        {['Now', '1PM', '2PM', '3PM', '4PM'].map((h, i) => (
          <span key={h}><em>{h}</em><b>{28 - i}°</b></span>
        ))}
      </div>
    </div>
  );
}

export function ClockApp({ clock, meridiem }: { clock: string; meridiem?: string }) {
  const [date, setDate] = useState('');
  const face = clock ? `${clock} ${meridiem || ''}`.trim() : '--:--';
  useEffect(() => {
    const d = new Date();
    setDate(d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
  }, [clock]);
  return (
    <div className="cx-ios-app cx-clock">
      <p className="cx-clock-big">{face}</p>
      <p>{date}</p>
      <div className="cx-world">
        <p><span>Lagos</span><b>{face}</b></p>
        <p><span>Velora Prime</span><b>{face}</b></p>
        <p><span>Noxhaven</span><b>{face}</b></p>
      </div>
    </div>
  );
}

export function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [lastB, setLastB] = useState<number | null>(null);

  function format(n: number) {
    if (!Number.isFinite(n)) return 'Error';
    const abs = Math.abs(n);
    if (abs !== 0 && (abs >= 1e10 || abs < 1e-7)) return n.toExponential(5).replace(/(\.\d*?)0+e/, '$1e').replace(/\.e/, 'e');
    const text = String(Number(n.toPrecision(12)));
    return text.length > 12 ? n.toExponential(5) : text;
  }

  function apply(a: number, operator: string, b: number) {
    if (operator === '+') return a + b;
    if (operator === '−') return a - b;
    if (operator === '×') return a * b;
    if (operator === '÷') return b === 0 ? NaN : a / b;
    return b;
  }

  function input(n: string) {
    setDisplay((d) => (waiting || d === '0' || d === 'Error' ? n : (d + n).slice(0, 12)));
    setWaiting(false);
  }

  function percent() {
    const cur = parseFloat(display);
    if (!Number.isFinite(cur)) return;
    if (acc !== null && op) setDisplay(format(acc * (cur / 100)));
    else setDisplay(format(cur / 100));
    setWaiting(true);
  }

  function operate(next: string) {
    const cur = parseFloat(display);
    if (next === '=') {
      if (op && acc !== null) {
        const b = waiting && lastB !== null ? lastB : cur;
        const res = apply(acc, op, b);
        setAcc(res);
        setLastB(b);
        setDisplay(format(res));
        setWaiting(true);
      }
      return;
    }
    if (acc !== null && op && !waiting) {
      const res = apply(acc, op, cur);
      setAcc(res);
      setDisplay(format(res));
      setLastB(cur);
    } else if (!waiting || acc === null) {
      setAcc(cur);
    }
    setOp(next);
    setWaiting(true);
  }

  const keys = useMemo(() => ['AC', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='], []);
  return (
    <div className="cx-ios-app cx-calc">
      <p className="cx-calc-out">{display}</p>
      <div className="cx-calc-pad">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            className={k === '0' ? 'wide' : /[÷×−+=]/.test(k) ? 'op' : /AC|±|%/.test(k) ? 'fn' : ''}
            onClick={() => {
              if (k === 'AC') {
                setDisplay('0');
                setAcc(null);
                setOp(null);
                setWaiting(false);
                setLastB(null);
              }               else if (k === '±') setDisplay((d) => format(parseFloat(d) * -1));
              else if (k === '%') percent();
              else if (k === '.') {
                setDisplay((d) => (waiting ? '0.' : d.includes('.') ? d : `${d}.`));
                setWaiting(false);
              } else if (/[÷×−+=]/.test(k)) operate(k);
              else input(k);
            }}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

const TRACKS = [
  { title: 'XO8 Night Mix', artist: 'Clemx Radio', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { title: 'Seam After Hours', artist: 'Vitel Wireless', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { title: 'Ikeja Gold', artist: 'Ambiance', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export function MusicApp() {
  const [on, setOn] = useState(false);
  const [index, setIndex] = useState(0);
  const track = TRACKS[index];
  return (
    <div className="cx-ios-app cx-music">
      <img src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=640&h=640&q=60" alt="" className="cx-album" />
      <p className="cx-music-title">{track.title}</p>
      <p className="cx-ios-sub">{track.artist}</p>
      <div className="cx-music-ctrl">
        <button type="button" onClick={() => setIndex((i) => (i + TRACKS.length - 1) % TRACKS.length)} aria-label="Previous">
          <SkipBack className="w-6 h-6" />
        </button>
        <button type="button" onClick={() => setOn((v) => !v)} aria-label={on ? 'Pause' : 'Play'}>
          {on ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </button>
        <button type="button" onClick={() => setIndex((i) => (i + 1) % TRACKS.length)} aria-label="Next">
          <SkipForward className="w-6 h-6" />
        </button>
      </div>
      {on && <audio key={track.src} src={track.src} autoPlay loop />}
    </div>
  );
}

export function NotesApp() {
  const [notes, setNotes] = useState<ClemxNote[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const list = readNotes();
    setNotes(list);
    if (!localStorage.getItem('clemx-notes')) writeSeed(list);
  }, []);

  function writeSeed(list: ClemxNote[]) {
    try {
      localStorage.setItem('clemx-notes', JSON.stringify(list));
    } catch { /* ignore */ }
  }

  function current() {
    return notes.find((n) => n.id === openId) || null;
  }

  function save(partial: Partial<ClemxNote>) {
    setNotes((list) => {
      const now = list.find((n) => n.id === openId);
      if (!now) return list;
      const body = partial.body ?? now.body;
      const next: ClemxNote = {
        ...now,
        ...partial,
        body,
        title: body.split('\n')[0]?.slice(0, 48) || 'Note',
        updatedAt: Date.now(),
      };
      upsertNote(next);
      return [next, ...list.filter((n) => n.id !== next.id)];
    });
  }

  function create() {
    const note: ClemxNote = { id: `n_${Date.now()}`, title: 'New Note', body: '', updatedAt: Date.now() };
    upsertNote(note);
    setNotes((list) => [note, ...list]);
    setOpenId(note.id);
  }

  const open = current();
  if (open) {
    return (
      <div className="cx-ios-app cx-note-edit">
        <div className="cx-notes-top">
          <button type="button" onClick={() => setOpenId(null)}>Notes</button>
          <button type="button" onClick={() => save({})}>Saved</button>
        </div>
        <textarea
          className="cx-note"
          value={open.body}
          placeholder="Start writing…"
          onChange={(e) => save({ body: e.target.value })}
        />
      </div>
    );
  }

  return (
    <div className="cx-ios-app">
      <div className="cx-notes-top">
        <h3>Notes</h3>
        <button type="button" onClick={create}>New</button>
      </div>
      <div className="cx-note-list">
        {notes.map((note) => (
          <button key={note.id} type="button" className="cx-note-row" onClick={() => setOpenId(note.id)}>
            <strong>{note.title || 'Note'}</strong>
            <small>{note.body.split('\n')[1] || 'No extra text'}</small>
            <em
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteNote(note.id);
                setNotes(readNotes());
              }}
            >
              Delete
            </em>
          </button>
        ))}
      </div>
    </div>
  );
}

export function BuApp() {
  return (
    <div className="cx-ios-app">
      <div className="cx-bu">
        <p className="cx-bu-brand">Celebrate</p>
        <div className="cx-bu-card">
          <p>1 ɃU = ₦1,000</p>
          <a className="cx-bu-open" href="https://buapp.vercel.app/" target="_blank" rel="noreferrer">
            Open BU app
          </a>
        </div>
      </div>
    </div>
  );
}

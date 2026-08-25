'use client';

import { FormEvent, PointerEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Calculator,
  Camera,
  Clock,
  CloudSun,
  Compass,
  Image as ImageIcon,
  MessageCircle,
  Music2,
  NotebookPen,
  Phone,
  Radio,
  Settings,
  SwitchCamera,
  Ticket,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  CalculatorApp,
  ClockApp,
  MessagesApp,
  MusicApp,
  NotesApp,
  PhotosApp,
  SafariApp,
  WeatherApp,
  BuApp,
} from '@/components/party/phone/IosApps';
import { TicketsApp } from '@/components/party/phone/TicketsApp';
import { compressImage, savePhoto } from '@/lib/clemx/library';

export type ClemxModel = 'XE' | 'FE';
export type ClemxApp =
  | 'home'
  | 'feed'
  | 'camera'
  | 'phone'
  | 'settings'
  | 'photos'
  | 'safari'
  | 'messages'
  | 'weather'
  | 'clock'
  | 'calculator'
  | 'music'
  | 'notes'
  | 'tickets'
  | 'bu';
type Power = 'off' | 'booting' | 'on' | 'sleep';
type CamPerm = 'idle' | 'prompt' | 'allowed' | 'denied';
type Facing = 'user' | 'environment';

type Contact = { id: string; name: string; number: string };

const MODEL_KEY = 'clemx-os-model';
const CONTACTS_KEY = 'clemx-os-contacts';
const CAM_KEY = 'clemx-os-camera';
const POWER_KEY = 'clemx-os-power';
const APP_KEY = 'clemx-os-app';
const APPS: ClemxApp[] = ['home', 'feed', 'camera', 'phone', 'settings', 'photos', 'safari', 'messages', 'weather', 'clock', 'calculator', 'music', 'notes', 'tickets', 'bu'];

function loadModel(): ClemxModel {
  try {
    return localStorage.getItem(MODEL_KEY) === 'FE' ? 'FE' : 'XE';
  } catch {
    return 'XE';
  }
}

function loadContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Contact[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadCamPerm(): CamPerm {
  try {
    const v = localStorage.getItem(CAM_KEY);
    if (v === 'allowed' || v === 'denied') return v;
  } catch { /* ignore */ }
  return 'idle';
}

function loadPower(): Power {
  try {
    const v = localStorage.getItem(POWER_KEY);
    if (v === 'on' || v === 'sleep') return 'on';
  } catch { /* ignore */ }
  return 'off';
}

function loadApp(): ClemxApp {
  try {
    const v = localStorage.getItem(APP_KEY) as ClemxApp | null;
    if (v && APPS.includes(v) && v !== 'camera') return v;
  } catch { /* ignore */ }
  return 'home';
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function Signal() {
  return (
    <span className="cx-signal" aria-hidden>
      <i /><i /><i /><i />
    </span>
  );
}

export function ClemxPhone({
  children,
  unread = 0,
  onFeedOpen,
  fullScreen = false,
  native = false,
  onToggleFull,
  onOpenNotifications,
  notificationTray,
}: {
  children: React.ReactNode;
  unread?: number;
  onFeedOpen?: () => void;
  fullScreen?: boolean;
  native?: boolean;
  onToggleFull?: () => void;
  onOpenNotifications?: () => void;
  notificationTray?: React.ReactNode;
}) {
  const [model, setModel] = useState<ClemxModel>('XE');
  const [power, setPower] = useState<Power>('off');
  const [app, setApp] = useState<ClemxApp>('home');
  const [osReady, setOsReady] = useState(false);
  const [bootStage, setBootStage] = useState<'logo' | 'brand' | 'series' | ''>('');
  const [clock, setClock] = useState('');
  const [meridiem, setMeridiem] = useState('');
  const [dateLine, setDateLine] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dial, setDial] = useState('');
  const [name, setName] = useState('');
  const [calling, setCalling] = useState<string | null>(null);
  const [camError, setCamError] = useState('');
  const [camPerm, setCamPerm] = useState<CamPerm>('idle');
  const [httpsLink, setHttpsLink] = useState('https://chelsea-examples-brilliant-frontier.trycloudflare.com/party');
  const [camNeedHttps, setCamNeedHttps] = useState(false);
  const [facing, setFacing] = useState<Facing>('environment');
  const [dual, setDual] = useState(false);
  const [dualNote, setDualNote] = useState('');
  const [shotFlash, setShotFlash] = useState(false);
  const [shotSaved, setShotSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const backRef = useRef<HTMLVideoElement>(null);
  const frontRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const backStream = useRef<MediaStream | null>(null);
  const frontStream = useRef<MediaStream | null>(null);
  const mixRef = useRef<HTMLCanvasElement>(null);
  const mixRaf = useRef<number | null>(null);
  const lastBackFrame = useRef<HTMLCanvasElement | null>(null);
  const lastFrontFrame = useRef<HTMLCanvasElement | null>(null);
  const dualAlive = useRef(false);
  const reviveTimer = useRef<number | null>(null);
  const bootTimer = useRef<number[]>([]);
  const holdTimer = useRef<number | null>(null);
  const heldRef = useRef(false);
  const tapsRef = useRef<number[]>([]);
  const powerRef = useRef<Power>('off');
  powerRef.current = power;

  useEffect(() => {
    setModel(loadModel());
    setContacts(loadContacts());
    setCamPerm(loadCamPerm());
    const savedPower = loadPower();
    if (savedPower === 'on') {
      setPower('on');
      powerRef.current = 'on';
      setApp(loadApp());
    }
    setOsReady(true);
    const tick = () => {
      const d = new Date();
      const hour = d.getHours() % 12 || 12;
      setClock(`${hour}:${pad(d.getMinutes())}`);
      setMeridiem(d.getHours() >= 12 ? 'PM' : 'AM');
      setDateLine(d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    tick();
    const id = window.setInterval(tick, 15000);
    void fetch('/party-https.json', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: { origin?: string }) => {
        if (data?.origin) setHttpsLink(`${String(data.origin).replace(/\/$/, '')}/party`);
      })
      .catch(() => undefined);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (app !== 'camera') return;
    if (dual) {
      if (backStream.current) bindVideo(backRef.current, backStream.current);
      if (frontStream.current) bindVideo(frontRef.current, frontStream.current);
      startMixer();
      return;
    }
    if (mixRaf.current) {
      window.cancelAnimationFrame(mixRaf.current);
      mixRaf.current = null;
    }
    const stream = streamRef.current || backStream.current || frontStream.current;
    if (stream) bindVideo(backRef.current, stream);
  }, [app, dual, facing, camPerm]);

  function persistModel(next: ClemxModel) {
    setModel(next);
    try {
      localStorage.setItem(MODEL_KEY, next);
    } catch { /* ignore */ }
  }

  function persistContacts(next: Contact[]) {
    setContacts(next);
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(next));
    } catch { /* ignore */ }
  }

  function persistCam(next: CamPerm) {
    setCamPerm(next);
    try {
      if (next === 'allowed' || next === 'denied') localStorage.setItem(CAM_KEY, next);
    } catch { /* ignore */ }
  }

  function persistPower(next: Power) {
    setPower(next);
    powerRef.current = next;
    try {
      if (next === 'on' || next === 'sleep') localStorage.setItem(POWER_KEY, 'on');
      if (next === 'off') localStorage.setItem(POWER_KEY, 'off');
    } catch { /* ignore */ }
  }

  function persistApp(next: ClemxApp) {
    setApp(next);
    try {
      if (next !== 'camera') localStorage.setItem(APP_KEY, next);
    } catch { /* ignore */ }
  }

  function powerOff() {
    bootTimer.current.forEach((id) => window.clearTimeout(id));
    bootTimer.current = [];
    stopAllCameras();
    setCalling(null);
    persistApp('home');
    setBootStage('');
    persistPower('off');
  }

  function sleepPhone() {
    if (powerRef.current !== 'on') return;
    videoRef.current?.pause();
    backRef.current?.pause();
    frontRef.current?.pause();
    persistPower('sleep');
  }

  function wakePhone() {
    if (powerRef.current !== 'sleep') return;
    persistPower('on');
    if (videoRef.current?.srcObject) void videoRef.current.play().catch(() => undefined);
    if (backRef.current?.srcObject) void backRef.current.play().catch(() => undefined);
    if (frontRef.current?.srcObject) void frontRef.current.play().catch(() => undefined);
  }

  function startBoot() {
    if (powerRef.current === 'booting' || powerRef.current === 'on') return;
    bootTimer.current.forEach((id) => window.clearTimeout(id));
    setPower('booting');
    setBootStage('logo');
    const t1 = window.setTimeout(() => setBootStage('brand'), 900);
    const t2 = window.setTimeout(() => setBootStage('series'), 2100);
    const t3 = window.setTimeout(() => {
      persistApp('home');
      setBootStage('');
      persistPower('on');
    }, 3400);
    bootTimer.current = [t1, t2, t3];
  }

  function onTripleTap() {
    if (powerRef.current !== 'off') return;
    const now = Date.now();
    tapsRef.current = tapsRef.current.filter((t) => now - t < 900);
    tapsRef.current.push(now);
    if (tapsRef.current.length >= 3) {
      tapsRef.current = [];
      startBoot();
    }
  }

  function onPowerDown(e: PointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    heldRef.current = false;
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => {
      heldRef.current = true;
      const now = powerRef.current;
      if (now === 'off') startBoot();
      else if (now === 'on' || now === 'sleep') powerOff();
    }, 3000);
  }

  function onPowerUp() {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (heldRef.current) return;
    const now = powerRef.current;
    if (now === 'on') sleepPhone();
    else if (now === 'sleep') wakePhone();
  }

  function stopMixer() {
    dualAlive.current = false;
    if (mixRaf.current) {
      window.cancelAnimationFrame(mixRaf.current);
      mixRaf.current = null;
    }
    if (reviveTimer.current) {
      window.clearInterval(reviveTimer.current);
      reviveTimer.current = null;
    }
  }

  function grabFrame(video: HTMLVideoElement | null, store: { current: HTMLCanvasElement | null }) {
    if (video && video.readyState >= 2 && video.videoWidth > 0) {
      if (!store.current) store.current = document.createElement('canvas');
      const frame = store.current;
      if (frame.width !== video.videoWidth) frame.width = video.videoWidth;
      if (frame.height !== video.videoHeight) frame.height = video.videoHeight;
      const ctx = frame.getContext('2d');
      ctx?.drawImage(video, 0, 0);
    }
    return store.current;
  }

  function startMixer() {
    dualAlive.current = true;
    const draw = () => {
      if (!dualAlive.current) return;
      const canvas = mixRef.current;
      const back = backRef.current;
      const front = frontRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = Math.max(1, canvas.clientWidth);
          const h = Math.max(1, canvas.clientHeight);
          if (canvas.width !== w) canvas.width = w;
          if (canvas.height !== h) canvas.height = h;
          ctx.fillStyle = '#111';
          ctx.fillRect(0, 0, w, h);
          const backFrame = grabFrame(back, lastBackFrame);
          if (backFrame) ctx.drawImage(backFrame, 0, 0, w, h);
          const frontFrame = grabFrame(front, lastFrontFrame);
          if (frontFrame) {
            const pw = Math.round(w * 0.36);
            const ph = Math.round(pw * 1.28);
            const x = Math.round((w - pw) / 2);
            const y = h - ph - 56;
            ctx.save();
            ctx.beginPath();
            const r = 16;
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + pw, y, x + pw, y + ph, r);
            ctx.arcTo(x + pw, y + ph, x, y + ph, r);
            ctx.arcTo(x, y + ph, x, y, r);
            ctx.arcTo(x, y, x + pw, y, r);
            ctx.closePath();
            ctx.clip();
            ctx.translate(x + pw, y);
            ctx.scale(-1, 1);
            ctx.drawImage(frontFrame, 0, 0, pw, ph);
            ctx.restore();
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + pw, y, x + pw, y + ph, r);
            ctx.arcTo(x + pw, y + ph, x, y + ph, r);
            ctx.arcTo(x, y + ph, x, y, r);
            ctx.arcTo(x, y, x + pw, y, r);
            ctx.stroke();
          }
        }
      }
      mixRaf.current = window.requestAnimationFrame(draw);
    };
    if (mixRaf.current) window.cancelAnimationFrame(mixRaf.current);
    mixRaf.current = window.requestAnimationFrame(draw);
  }

  function bindVideo(el: HTMLVideoElement | null, stream: MediaStream) {
    if (!el) return;
    el.setAttribute('playsinline', 'true');
    el.setAttribute('webkit-playsinline', 'true');
    el.muted = true;
    if (el.srcObject !== stream) el.srcObject = stream;
    void el.play().catch(() => undefined);
  }

  function stopAllCameras() {
    stopMixer();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    backStream.current?.getTracks().forEach((t) => t.stop());
    frontStream.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    backStream.current = null;
    frontStream.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (backRef.current) backRef.current.srcObject = null;
    if (frontRef.current) frontRef.current.srcObject = null;
  }

  function trackGone(stream: MediaStream | null) {
    if (!stream) return true;
    const tracks = stream.getVideoTracks();
    return !tracks.length || tracks.every((t) => t.readyState === 'ended');
  }

  function keepTrack(track: MediaStreamTrack) {
    track.enabled = true;
    try {
      track.contentHint = 'motion';
    } catch { /* ignore */ }
    track.onmute = () => {
      track.enabled = true;
    };
  }

  function idOf(stream: MediaStream | null) {
    return stream?.getVideoTracks()[0]?.getSettings().deviceId || '';
  }

  function facingOf(stream: MediaStream | null): Facing | '' {
    const mode = stream?.getVideoTracks()[0]?.getSettings().facingMode;
    if (mode === 'user' || mode === 'environment') return mode;
    return '';
  }

  function waitFrame() {
    return new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
    });
  }

  function waitPlaying(el: HTMLVideoElement | null, ms = 900) {
    return new Promise<void>((resolve) => {
      if (!el) {
        resolve();
        return;
      }
      if (el.readyState >= 2 && el.videoWidth > 0) {
        resolve();
        return;
      }
      const done = () => {
        el.removeEventListener('playing', done);
        el.removeEventListener('loadeddata', done);
        window.clearTimeout(timer);
        resolve();
      };
      const timer = window.setTimeout(done, ms);
      el.addEventListener('playing', done);
      el.addEventListener('loadeddata', done);
    });
  }

  function pickCamera(devices: MediaDeviceInfo[], mode: Facing, excludeId?: string) {
    const cams = devices.filter((d) => d.kind === 'videoinput' && d.deviceId && d.deviceId !== excludeId);
    if (mode === 'user') {
      return (
        cams.find((d) => /front|user|face|facetime/i.test(d.label)) ||
        cams.find((d) => !/back|rear|environment|wide|ultra|tele/i.test(d.label)) ||
        cams[0]
      );
    }
    return (
      cams.find((d) => /back|rear|environment/i.test(d.label) && !/front|face/i.test(d.label)) ||
      cams.find((d) => /wide|ultra|tele/i.test(d.label) && !/front|face/i.test(d.label)) ||
      cams.find((d) => !/front|user|face|facetime/i.test(d.label)) ||
      cams[cams.length - 1]
    );
  }

  async function openCamExact(deviceId: string, quality: 'high' | 'low') {
    const size =
      quality === 'high'
        ? { width: { ideal: 960 }, height: { ideal: 540 }, frameRate: { ideal: 24 } }
        : { width: { ideal: 240 }, height: { ideal: 320 }, frameRate: { ideal: 12 } };
    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { deviceId: { exact: deviceId }, ...size },
    });
  }

  async function openCam(mode: Facing, quality: 'high' | 'low', excludeId?: string) {
    const size =
      quality === 'high'
        ? { width: { ideal: 960 }, height: { ideal: 540 }, frameRate: { ideal: 24 } }
        : { width: { ideal: 240 }, height: { ideal: 320 }, frameRate: { ideal: 12 } };
    const devices = await navigator.mediaDevices.enumerateDevices();
    const picked = pickCamera(devices, mode, excludeId);
    const tries: MediaStreamConstraints[] = [];
    if (picked?.deviceId) {
      tries.push({ audio: false, video: { deviceId: { exact: picked.deviceId }, ...size } });
      tries.push({ audio: false, video: { deviceId: { exact: picked.deviceId } } });
    }
    tries.push({ audio: false, video: { facingMode: { exact: mode }, ...size } });
    tries.push({ audio: false, video: { facingMode: { ideal: mode }, ...size } });
    let last: unknown;
    for (const constraint of tries) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraint);
      } catch (err) {
        last = err;
      }
    }
    throw last instanceof Error ? last : new Error('Camera failed');
  }

  function attachDual(back: MediaStream | null, front: MediaStream | null) {
    if (back) {
      back.getVideoTracks().forEach(keepTrack);
      backStream.current = back;
      streamRef.current = back;
    }
    if (front) {
      front.getVideoTracks().forEach(keepTrack);
      frontStream.current = front;
    }
    setFacing('environment');
    setDual(true);
    persistCam('allowed');
    setDualNote('');
    window.requestAnimationFrame(() => {
      if (back) bindVideo(backRef.current, back);
      if (front) bindVideo(frontRef.current, front);
      startMixer();
    });
    watchDual();
  }

  function watchDual() {
    if (reviveTimer.current) window.clearInterval(reviveTimer.current);
    reviveTimer.current = window.setInterval(() => {
      if (!dualAlive.current) return;
      backStream.current?.getVideoTracks().forEach((t) => {
        t.enabled = true;
      });
      frontStream.current?.getVideoTracks().forEach((t) => {
        t.enabled = true;
      });
      if (trackGone(backStream.current) || trackGone(frontStream.current)) {
        void reviveDual();
      }
    }, 1200);
  }

  async function reviveDual() {
    if (!dualAlive.current) return;
    try {
      if (trackGone(backStream.current)) {
        const next = await openCam('environment', 'high', idOf(frontStream.current));
        if (!dualAlive.current) {
          next.getTracks().forEach((t) => t.stop());
          return;
        }
        next.getVideoTracks().forEach(keepTrack);
        backStream.current = next;
        streamRef.current = next;
        bindVideo(backRef.current, next);
        await waitPlaying(backRef.current);
      }
      if (trackGone(frontStream.current)) {
        const next = await openCam('user', 'low', idOf(backStream.current));
        if (!dualAlive.current) {
          next.getTracks().forEach((t) => t.stop());
          return;
        }
        next.getVideoTracks().forEach(keepTrack);
        frontStream.current = next;
        bindVideo(frontRef.current, next);
      }
    } catch {
      /* keep the live lens; retry on the next tick */
    }
  }

  async function startSingle(mode: Facing) {
    setCamError('');
    setCamNeedHttps(false);
    setDualNote('');
    lastBackFrame.current = null;
    lastFrontFrame.current = null;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCamNeedHttps(true);
      persistCam('prompt');
      return;
    }
    stopAllCameras();
    await new Promise((r) => window.setTimeout(r, 180));
    try {
      const stream = await openCam(mode, 'high');
      streamRef.current = stream;
      if (mode === 'environment') backStream.current = stream;
      else frontStream.current = stream;
      setFacing(facingOf(stream) || mode);
      setDual(false);
      persistCam('allowed');
      window.requestAnimationFrame(() => bindVideo(backRef.current, stream));
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      persistCam('denied');
      if (name === 'NotFoundError') setCamError('No camera was found on this device.');
      else if (name === 'NotReadableError') setCamError('The camera is already in use by another app.');
      else setCamError('Safari blocked the camera. Check Settings → Safari → Camera, then tap Allow again.');
    }
  }

  async function startDual() {
    setCamError('');
    setDualNote('');
    lastBackFrame.current = null;
    lastFrontFrame.current = null;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCamNeedHttps(true);
      persistCam('prompt');
      return;
    }
    stopAllCameras();
    setDual(true);
    persistCam('allowed');
    await waitFrame();
    try {
      try {
        const warm = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        warm.getTracks().forEach((t) => t.stop());
        await new Promise((r) => window.setTimeout(r, 120));
      } catch {
        /* labels may still be empty */
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const backDev = pickCamera(devices, 'environment');
      const frontDev = pickCamera(devices, 'user', backDev?.deviceId);

      let back: MediaStream | null = null;
      let front: MediaStream | null = null;

      if (backDev?.deviceId) {
        back = await openCamExact(backDev.deviceId, 'high').catch(() => openCam('environment', 'high').catch(() => null));
      } else {
        back = await openCam('environment', 'high').catch(() => null);
      }

      if (back) {
        back.getVideoTracks().forEach(keepTrack);
        backStream.current = back;
        streamRef.current = back;
        bindVideo(backRef.current, back);
        startMixer();
        await waitPlaying(backRef.current);
      }

      if (frontDev?.deviceId && frontDev.deviceId !== backDev?.deviceId) {
        front = await openCamExact(frontDev.deviceId, 'low').catch(() => null);
      }
      if (!front) {
        front = await openCam('user', 'low', idOf(back)).catch(() => null);
      }
      if (!front && back) {
        const others = devices.filter((d) => d.kind === 'videoinput' && d.deviceId && d.deviceId !== idOf(back));
        for (const device of others) {
          front = await openCamExact(device.deviceId, 'low').catch(() => null);
          if (front) break;
        }
      }

      if (front) {
        front.getVideoTracks().forEach(keepTrack);
        frontStream.current = front;
        bindVideo(frontRef.current, front);
        await waitPlaying(frontRef.current);
      }

      if (!back && front) {
        back = await openCam('environment', 'high', idOf(front)).catch(() => null);
        if (back) {
          back.getVideoTracks().forEach(keepTrack);
          backStream.current = back;
          streamRef.current = back;
          bindVideo(backRef.current, back);
        }
      }

      if (back || front) {
        attachDual(back, front);
        return;
      }

      setCamError('Could not open the cameras. Tap Both again.');
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      persistCam('denied');
      if (name === 'NotFoundError') setCamError('No camera was found on this device.');
      else setCamError('Could not open the cameras. Tap Both again.');
    }
  }

  async function startCamera() {
    if (dual) await startDual();
    else await startSingle(facing);
  }

  async function swapCamera() {
    if (dual && backStream.current && frontStream.current) {
      const back = backStream.current;
      const front = frontStream.current;
      backStream.current = front;
      frontStream.current = back;
      bindVideo(backRef.current, front);
      bindVideo(frontRef.current, back);
      setFacing((v) => (v === 'user' ? 'environment' : 'user'));
      return;
    }
    await startSingle(facing === 'user' ? 'environment' : 'user');
  }

  async function toggleDual() {
    if (dual) await startSingle('environment');
    else await startDual();
  }

  async function snapPhoto() {
    const mix = mixRef.current;
    const video = backRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (dual && mix && mix.width > 1) {
      canvas.width = mix.width;
      canvas.height = mix.height;
      ctx.drawImage(mix, 0, 0);
    } else if (video && video.videoWidth > 1) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (facing === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0);
    } else {
      setCamError('Camera is not ready yet.');
      return;
    }
    const raw = canvas.toDataURL('image/jpeg', 0.84);
    savePhoto(await compressImage(raw));
    setShotFlash(true);
    setShotSaved(true);
    window.setTimeout(() => setShotFlash(false), 160);
    window.setTimeout(() => setShotSaved(false), 1400);
  }

  async function openApp(next: ClemxApp) {
    persistApp(next);
    if (next === 'feed') onFeedOpen?.();
    if (next !== 'camera') {
      stopAllCameras();
      setDual(false);
      setCamNeedHttps(false);
      return;
    }
    setCamError('');
    if (!window.isSecureContext) {
      setCamNeedHttps(true);
      persistCam('prompt');
      return;
    }
    if (camPerm === 'allowed') {
      await startCamera();
      return;
    }
    persistCam('prompt');
  }

  function saveContact(e: FormEvent) {
    e.preventDefault();
    const n = name.trim();
    const num = dial.replace(/\s/g, '');
    if (!n || !num) return;
    persistContacts([{ id: `${Date.now()}`, name: n, number: num }, ...contacts].slice(0, 80));
    setName('');
    setDial('');
  }

  const keys = useMemo(() => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'], []);

  function AppBtn({ id, label, icon, tone }: { id: ClemxApp; label: string; icon: ReactNode; tone: string }) {
    return (
      <button type="button" className="cx-app" onClick={() => void openApp(id)}>
        <span className={`cx-icon ${tone}`}>
          {icon}
          {id === 'feed' && unread > 0 && <b />}
        </span>
        <em>{label}</em>
      </button>
    );
  }

  return (
    <div className={`cx-phone cx-${model.toLowerCase()}${fullScreen ? ' cx-full' : ''}${native ? ' cx-native' : ''}`}>
      <div className="cx-bezel">
      <button
        type="button"
        className="cx-power"
        onPointerDown={onPowerDown}
        onPointerUp={onPowerUp}
        onPointerCancel={onPowerUp}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Side button. Tap to sleep or wake. Hold 3 seconds to power off. Triple-tap the screen to power on."
      />
        <div className="cx-island" />
        {power === 'on' && (
          <div className="cx-status">
            <span className="cx-status-left">
              <button
                type="button"
                className="cx-time"
                onClick={() => onOpenNotifications?.()}
                aria-label={unread > 0 ? `${unread} notifications` : 'Notifications'}
              >
                {clock ? `${clock} ${meridiem}` : '--:--'}
              </button>
            </span>
            <span className="cx-status-right">
              <Signal />
              <span className="cx-carrier">Vitel Wireless</span>
              <span className="cx-wifi" />
              <span className="cx-battery"><i /></span>
            </span>
          </div>
        )}

        <div className="cx-screen">
          {!osReady && <div className="cx-off" aria-hidden />}
          {osReady && power === 'off' && (
            <button type="button" className="cx-off" onClick={onTripleTap} aria-label="Tap three times to power on">
              <p>Clemx Series {model}</p>
              <span>Tap three times to power on</span>
            </button>
          )}

          {power === 'booting' && (
            <div className="cx-boot">
              {(bootStage === 'logo' || bootStage === 'brand') && (
                <>
                  <img src="/clemx-logo.png" alt="" className="cx-boot-logo" draggable={false} />
                  {bootStage === 'brand' && <p className="cx-boot-name">Clemx</p>}
                </>
              )}
              {bootStage === 'series' && (
                <p className="cx-boot-line">Series {model}</p>
              )}
            </div>
          )}

          {(power === 'on' || power === 'sleep') && (
            <>
              {app === 'home' && (
                <div className="cx-home">
                  <div className="cx-home-clock">
                    <p className="cx-home-date-lg">{dateLine || 'Clemx OS'}</p>
                    <p className="cx-home-time">
                      {clock || '--:--'}
                      {meridiem && <span>{meridiem}</span>}
                    </p>
                  </div>
                  <button type="button" className="cx-widget" onClick={() => void openApp('weather')}>
                    <CloudSun className="w-5 h-5" />
                    <span>
                      <strong>Ikeja</strong>
                      <em>28° · Mostly Clear</em>
                    </span>
                  </button>
                  <div className="cx-grid">
                    <AppBtn id="tickets" label="Tickets" tone="cx-icon-ticket" icon={<Ticket className="w-6 h-6" />} />
                    <AppBtn id="bu" label="ɃU" tone="cx-icon-bu" icon={<span className="cx-bu-glyph">Ƀ</span>} />
                    <AppBtn id="messages" label="Messages" tone="cx-icon-msg" icon={<MessageCircle className="w-6 h-6" />} />
                    <AppBtn id="safari" label="Safari" tone="cx-icon-safari" icon={<Compass className="w-6 h-6" />} />
                    <AppBtn id="photos" label="Photos" tone="cx-icon-photos" icon={<ImageIcon className="w-6 h-6" />} />
                    <AppBtn id="camera" label="Camera" tone="cx-icon-cam" icon={<Camera className="w-6 h-6" />} />
                    <AppBtn id="feed" label="Xoral" tone="cx-icon-feed" icon={<Radio className="w-6 h-6" />} />
                    <AppBtn id="weather" label="Weather" tone="cx-icon-weather" icon={<CloudSun className="w-6 h-6" />} />
                    <AppBtn id="clock" label="Clock" tone="cx-icon-clock" icon={<Clock className="w-6 h-6" />} />
                    <AppBtn id="calculator" label="Calculator" tone="cx-icon-calc" icon={<Calculator className="w-6 h-6" />} />
                    <AppBtn id="music" label="Music" tone="cx-icon-music" icon={<Music2 className="w-6 h-6" />} />
                    <AppBtn id="notes" label="Notes" tone="cx-icon-notes" icon={<NotebookPen className="w-6 h-6" />} />
                    <AppBtn id="phone" label="Phone" tone="cx-icon-phone" icon={<Phone className="w-6 h-6" />} />
                    <AppBtn id="settings" label="Settings" tone="cx-icon-settings" icon={<Settings className="w-6 h-6" />} />
                  </div>
                  <div className="cx-dock">
                    <AppBtn id="phone" label="Phone" tone="cx-icon-phone" icon={<Phone className="w-6 h-6" />} />
                    <AppBtn id="tickets" label="Tickets" tone="cx-icon-ticket" icon={<Ticket className="w-6 h-6" />} />
                    <AppBtn id="feed" label="Xoral" tone="cx-icon-feed" icon={<Radio className="w-6 h-6" />} />
                    <AppBtn id="camera" label="Camera" tone="cx-icon-cam" icon={<Camera className="w-6 h-6" />} />
                  </div>
                </div>
              )}

              {app === 'feed' && <div className="cx-app-screen">{children}</div>}
              {app === 'photos' && <div className="cx-app-screen cx-light"><PhotosApp onOpenXoral={() => void openApp('feed')} /></div>}
              {app === 'safari' && (
                <div className="cx-app-screen cx-light">
                  <SafariApp
                    onOpenTickets={() => void openApp('tickets')}
                    onOpenPhone={() => void openApp('phone')}
                    onOpenFeed={() => void openApp('feed')}
                    onOpenWeather={() => void openApp('weather')}
                    onOpenBu={() => void openApp('bu')}
                  />
                </div>
              )}
              {app === 'messages' && <div className="cx-app-screen cx-light"><MessagesApp /></div>}
              {app === 'weather' && <div className="cx-app-screen"><WeatherApp /></div>}
              {app === 'clock' && <div className="cx-app-screen cx-light"><ClockApp clock={clock} meridiem={meridiem} /></div>}
              {app === 'calculator' && <div className="cx-app-screen"><CalculatorApp /></div>}
              {app === 'music' && <div className="cx-app-screen"><MusicApp /></div>}
              {app === 'notes' && <div className="cx-app-screen cx-light"><NotesApp /></div>}
              {app === 'tickets' && <div className="cx-app-screen"><TicketsApp /></div>}
              {app === 'bu' && <div className="cx-app-screen cx-light"><BuApp /></div>}

              {app === 'camera' && (
                <div className="cx-app-screen cx-cam">
                  <div className="cx-cam-stage">
                    <canvas ref={mixRef} className={`cx-cam-mix${dual ? '' : ' is-off'}`} />
                    <video
                      ref={backRef}
                      className={`cx-cam-main${dual ? ' cx-cam-feed' : ''}${!dual && facing === 'user' ? ' selfie' : ''}`}
                      playsInline
                      muted
                      autoPlay
                    />
                    <video
                      ref={frontRef}
                      className={`cx-cam-front${dual ? ' cx-cam-feed' : ' is-off'}`}
                      playsInline
                      muted
                      autoPlay
                    />
                  </div>
                  {camNeedHttps && (
                    <div className="cx-cam-help">
                      <h4>Camera needs HTTPS</h4>
                      <p>
                        This phone opened <strong>http://192.168…</strong>. iPhone blocks the camera on HTTP, even after you tap Allow.
                      </p>
                      <p>Open the secure party link, then try Camera again.</p>
                      <a className="cx-cam-https" href={httpsLink}>
                        Open secure camera
                      </a>
                    </div>
                  )}
                  {camError && !camNeedHttps && <p className="cx-cam-err">{camError}</p>}
                  {dualNote && !camNeedHttps && <p className="cx-cam-err">{dualNote}</p>}
                  {camPerm === 'prompt' && !camNeedHttps && (
                    <div className="cx-alert" role="dialog" aria-label="Camera permission">
                      <h4>Camera</h4>
                      <p>“Camera” Would Like to Access the Camera</p>
                      <div className="cx-alert-row">
                        <button type="button" onClick={() => { persistCam('denied'); setCamError('Camera needs permission on this device.'); }}>Don’t Allow</button>
                        <button type="button" onClick={() => void startCamera()}>OK</button>
                      </div>
                    </div>
                  )}
                  {shotFlash && <div className="cx-cam-flash" />}
                  {shotSaved && <p className="cx-cam-saved">Saved to Photos</p>}
                  {camPerm === 'allowed' && !camNeedHttps && (
                    <div className="cx-cam-bar">
                      <button type="button" onClick={() => void swapCamera()}>
                        <SwitchCamera className="w-4 h-4" />
                        Swap
                      </button>
                      <button type="button" className="cx-shutter" onClick={() => void snapPhoto()} aria-label="Take photo" />
                      <button type="button" className={dual ? 'on' : ''} onClick={() => void toggleDual()}>
                        <Users className="w-4 h-4" />
                        {dual ? 'Both on' : 'Both'}
                      </button>
                    </div>
                  )}
                  <p className="cx-cam-label">{dual ? 'Back + Front' : facing === 'user' ? 'Front camera' : 'Back camera'}</p>
                </div>
              )}

              {app === 'phone' && (
                <div className="cx-app-screen cx-dial">
                  {calling ? (
                    <div className="cx-calling">
                      <p>Calling</p>
                      <h3>{calling}</h3>
                      <p className="cx-carrier">Vitel Wireless</p>
                      <button type="button" className="cx-end" onClick={() => setCalling(null)}>End</button>
                    </div>
                  ) : (
                    <>
                      <p className="cx-dial-num">{dial || 'Enter a number'}</p>
                      <div className="cx-pad">
                        {keys.map((k) => (
                          <button key={k} type="button" onClick={() => setDial((d) => (d + k).slice(0, 16))}>{k}</button>
                        ))}
                      </div>
                      <div className="cx-dial-actions">
                        <button type="button" className="cx-call" onClick={() => dial && setCalling(dial)} aria-label="Call">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button type="button" className="cx-backspace" onClick={() => setDial((d) => d.toString().slice(0, -1))}>⌫</button>
                      </div>
                      <form className="cx-save" onSubmit={saveContact}>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                        <button type="submit" aria-label="Save contact"><UserPlus className="w-4 h-4" /></button>
                      </form>
                      <div className="cx-contacts">
                        {contacts.length === 0 && <p className="cx-empty">No contacts yet. Save one above.</p>}
                        {contacts.map((c) => (
                          <button key={c.id} type="button" className="cx-contact" onClick={() => { setDial(c.number); setCalling(c.name); }}>
                            <span>{c.name}</span>
                            <small>{c.number}</small>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {app === 'settings' && (
                <div className="cx-app-screen cx-settings">
                  <h3>Settings</h3>
                  <p className="cx-muted">Clemx OS · Clemx Series {model}</p>
                  <p className="cx-row-label">Phone model</p>
                  <div className="cx-seg">
                    <button type="button" className={model === 'XE' ? 'on' : ''} onClick={() => persistModel('XE')}>Series XE</button>
                    <button type="button" className={model === 'FE' ? 'on' : ''} onClick={() => persistModel('FE')}>Series FE</button>
                  </div>
                  <p className="cx-row-label">Camera</p>
                  <button
                    type="button"
                    className="cx-card cx-card-btn"
                    onClick={() => { persistCam('idle'); void openApp('camera'); }}
                  >
                    {camPerm === 'allowed' ? 'Allowed · tap to ask again' : camPerm === 'denied' ? 'Denied · tap to ask again' : 'Ask when Camera opens'}
                  </button>
                  <p className="cx-hint">XE is the flagship. FE is the everyday Clemx. Tap the screen three times to power on. Hold the side button 3 seconds to power off.</p>
                  <p className="cx-row-label">Network</p>
                  <p className="cx-card">Vitel Wireless · 5G</p>
                </div>
              )}

              {app !== 'home' && (
                <button type="button" className="cx-homebar" onClick={() => { persistApp('home'); stopAllCameras(); setDual(false); }} aria-label="Go home" />
              )}
              {power === 'sleep' && (
                <button type="button" className="cx-sleep" onClick={wakePhone} aria-label="Tap to wake" />
              )}
              {notificationTray}
            </>
          )}
        </div>
      </div>
      {fullScreen && onToggleFull && !native && (
        <div className="cx-chrome">
          <button type="button" onClick={onToggleFull}>
            Back to site
          </button>
        </div>
      )}
      <p className="cx-model-tag">Clemx Series {model} · Clemx OS</p>
    </div>
  );
}

'use client';

import type { GuestWallEntry, PartyTicket } from './types';

const TICKETS_KEY = 'xoral-party-tickets';
const GUESTS_KEY = 'xoral-party-guest-wall';
const REFERRAL_KEY = 'xoral-party-referral';
const SOUND_KEY = 'xoral-party-sound';
const CHARACTER_KEY = 'xoral-party-character-enabled';

export type StoredTicket = PartyTicket & {
  eventName: string;
  eventDate: string;
  venue: string;
  orderNumber: string;
  shareSafe?: boolean;
};

export function readTickets(): StoredTicket[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(TICKETS_KEY) || '[]') as StoredTicket[];
  } catch {
    return [];
  }
}

export function saveTicketsLocal(tickets: StoredTicket[]) {
  const existing = readTickets();
  const merged = [...tickets, ...existing.filter((t) => !tickets.some((n) => n.id === t.id))];
  localStorage.setItem(TICKETS_KEY, JSON.stringify(merged));
}

export function readGuestWall(): GuestWallEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(GUESTS_KEY) || '[]') as GuestWallEntry[];
  } catch {
    return [];
  }
}

export function addGuestWall(entry: GuestWallEntry) {
  const next = [entry, ...readGuestWall()].slice(0, 80);
  localStorage.setItem(GUESTS_KEY, JSON.stringify(next));
}

export function getOrCreateReferralCode(firstName: string) {
  const existing = localStorage.getItem(REFERRAL_KEY);
  if (existing) return existing;
  const slug = `${firstName.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'guest'}-${Math.random().toString(36).slice(2, 6)}`;
  localStorage.setItem(REFERRAL_KEY, slug);
  return slug;
}

export function soundEnabled() {
  return localStorage.getItem(SOUND_KEY) === 'on';
}

export function setSoundEnabled(on: boolean) {
  localStorage.setItem(SOUND_KEY, on ? 'on' : 'off');
}

export function characterAssistantEnabled() {
  return localStorage.getItem(CHARACTER_KEY) !== 'off';
}

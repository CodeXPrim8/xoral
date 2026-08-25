import 'server-only';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { partyCloud, usingPartyCloud } from './cloud';
import { MOCK_EVENT } from './mock-event';
import { hashPassword, makeSalesCode, nid, verifyPassword } from './password';
import type {
  PartyEvent,
  PartyOrder,
  PartyTicket,
  SaleRecord,
  SalesPerson,
  SalesRole,
  SalesSession,
} from './types';

type Store = {
  orders: Map<string, PartyOrder>;
  tickets: Map<string, PartyTicket>;
  checkIns: Map<string, string>;
  people: Map<string, SalesPerson>;
  sessions: Map<string, SalesSession>;
  sales: Map<string, SaleRecord>;
};

type FileShape = {
  orders?: PartyOrder[];
  tickets?: PartyTicket[];
  checkIns?: [string, string][];
  people?: SalesPerson[];
  sessions?: SalesSession[];
  sales?: SaleRecord[];
};

const DIR = join(process.cwd(), 'data', 'party');
const FILE = join(DIR, 'db.json');
const globalStore = globalThis as typeof globalThis & {
  __xoralPartyStore?: Store;
  __xoralPartyLoaded?: boolean;
};

function emptyStore(): Store {
  return {
    orders: new Map(),
    tickets: new Map(),
    checkIns: new Map(),
    people: new Map(),
    sessions: new Map(),
    sales: new Map(),
  };
}

function persistFile(s: Store) {
  if (usingPartyCloud()) return;
  try {
    mkdirSync(DIR, { recursive: true });
    const next = JSON.stringify({
      orders: [...(s.orders?.values() ?? [])],
      tickets: [...(s.tickets?.values() ?? [])],
      checkIns: [...(s.checkIns?.entries() ?? [])],
      people: [...(s.people?.values() ?? [])],
      sessions: [...(s.sessions?.values() ?? [])].filter((row) => row.expiresAt > Date.now()),
      sales: [...(s.sales?.values() ?? [])],
    });
    if (existsSync(FILE) && readFileSync(FILE, 'utf8') === next) return;
    writeFileSync(FILE, next);
  } catch {
    /* quota / lock / serverless fs */
  }
}

async function cloudUpsert(table: string, row: Record<string, unknown>) {
  const db = partyCloud();
  if (!db) return;
  try {
    const { error } = await db.from(table).upsert(row);
    if (error) console.error(`[party] ${table} persist failed`, error.message);
  } catch (err) {
    console.error(`[party] ${table} persist failed`, err instanceof Error ? err.message : err);
  }
}

function persist(s: Store) {
  persistFile(s);
}

function hydrate(): Store {
  const empty = emptyStore();
  try {
    if (!existsSync(FILE)) return empty;
    const raw = JSON.parse(readFileSync(FILE, 'utf8')) as FileShape;
    for (const order of raw.orders || []) empty.orders.set(order.id, order);
    for (const ticket of raw.tickets || []) empty.tickets.set(ticket.id, ticket);
    for (const [id, at] of raw.checkIns || []) empty.checkIns.set(id, at);
    for (const person of raw.people || []) empty.people.set(person.id, person);
    for (const session of raw.sessions || []) {
      if (session.expiresAt > Date.now()) empty.sessions.set(session.token, session);
    }
    for (const sale of raw.sales || []) empty.sales.set(sale.id, sale);
  } catch {
    /* start empty */
  }
  return empty;
}

function store(): Store {
  let s = globalStore.__xoralPartyStore;
  if (!s) {
    s = hydrate();
    globalStore.__xoralPartyStore = s;
  }
  if (!(s.orders instanceof Map)) s.orders = new Map();
  if (!(s.tickets instanceof Map)) s.tickets = new Map();
  if (!(s.checkIns instanceof Map)) s.checkIns = new Map();
  if (!(s.people instanceof Map)) s.people = new Map();
  if (!(s.sessions instanceof Map)) s.sessions = new Map();
  if (!(s.sales instanceof Map)) s.sales = new Map();
  globalStore.__xoralPartyLoaded = true;
  return s;
}

export async function hydrateStore() {
  const s = store();
  const db = partyCloud();
  if (!db) return s;
  try {
    const [orders, tickets, people, sessions, sales] = await Promise.all([
      db.from('party_live_orders').select('id,data'),
      db.from('party_live_tickets').select('id,order_id,data'),
      db.from('party_live_people').select('id,data'),
      db.from('party_live_sessions').select('token,data'),
      db.from('party_live_sales').select('id,data'),
    ]);
    for (const row of orders.data || []) {
      const data = row.data as PartyOrder;
      if (data?.id) s.orders.set(data.id, data);
    }
    for (const row of tickets.data || []) {
      const data = row.data as PartyTicket;
      if (data?.id) {
        s.tickets.set(data.id, data);
        if (data.checkedInAt) s.checkIns.set(data.id, data.checkedInAt);
      }
    }
    for (const row of people.data || []) {
      const data = row.data as SalesPerson;
      if (data?.id) s.people.set(data.id, data);
    }
    for (const row of sessions.data || []) {
      const data = row.data as SalesSession;
      if (data?.token && data.expiresAt > Date.now()) s.sessions.set(data.token, data);
    }
    for (const row of sales.data || []) {
      const data = row.data as SaleRecord;
      if (data?.id) s.sales.set(data.id, data);
    }
  } catch (err) {
    console.error('[party] cloud hydrate failed', err instanceof Error ? err.message : err);
  }
  return s;
}

export async function saveOrder(order: PartyOrder) {
  const s = store();
  s.orders.set(order.id, order);
  persist(s);
  await cloudUpsert('party_live_orders', { id: order.id, data: order, updated_at: new Date().toISOString() });
}

export function getOrder(id: string) {
  return store().orders.get(id) ?? null;
}

export function findOrder(idOrRef: string) {
  const s = store();
  const direct = s.orders.get(idOrRef) || s.orders.get(idOrRef.replace(/^mock_/, ''));
  if (direct) return direct;
  return [...s.orders.values()].find((order) => order.paymentReference === idOrRef) ?? null;
}

export async function saveTickets(tickets: PartyTicket[]) {
  const s = store();
  for (const ticket of tickets) s.tickets.set(ticket.id, ticket);
  persist(s);
  await Promise.all(tickets.map((ticket) => cloudUpsert('party_live_tickets', {
    id: ticket.id,
    order_id: ticket.orderId,
    data: ticket,
    updated_at: new Date().toISOString(),
  })));
}

export function getTicket(id: string) {
  return store().tickets.get(id) ?? null;
}

export function getTicketsByOrder(orderId: string) {
  return [...store().tickets.values()].filter((ticket) => ticket.orderId === orderId);
}

export function listTickets() {
  return [...store().tickets.values()];
}

export function listOrders() {
  return [...store().orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listPeople() {
  return [...store().people.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function soldByType() {
  const counts: Record<string, number> = {};
  for (const ticket of store().tickets.values()) {
    counts[ticket.ticketTypeId] = (counts[ticket.ticketTypeId] || 0) + 1;
  }
  return counts;
}

export function eventWithLiveInventory(event: PartyEvent = MOCK_EVENT): PartyEvent {
  const sold = soldByType();
  return {
    ...event,
    ticketTypes: event.ticketTypes.map((t) => ({
      ...t,
      remaining: Math.max(0, t.capacity - (sold[t.id] || 0)),
    })),
  };
}

export function remainingForType(ticketTypeId: string) {
  const type = MOCK_EVENT.ticketTypes.find((t) => t.id === ticketTypeId);
  if (!type) return 0;
  return Math.max(0, type.capacity - (soldByType()[ticketTypeId] || 0));
}

export async function checkInTicket(ticketId: string): Promise<{ ok: true; first: boolean; at: string } | { ok: false; reason: 'missing' }> {
  const s = store();
  const ticket = s.tickets.get(ticketId);
  if (!ticket) return { ok: false, reason: 'missing' };
  if (ticket.checkedInAt) return { ok: true, first: false, at: ticket.checkedInAt };
  const at = new Date().toISOString();
  ticket.checkedInAt = at;
  s.tickets.set(ticketId, ticket);
  s.checkIns.set(ticketId, at);
  persist(s);
  await cloudUpsert('party_live_tickets', {
    id: ticket.id,
    order_id: ticket.orderId,
    data: ticket,
    updated_at: at,
  });
  return { ok: true, first: true, at };
}

export async function resetCheckIn(ticketId: string) {
  const s = store();
  const ticket = s.tickets.get(ticketId);
  if (!ticket) return false;
  ticket.checkedInAt = null;
  s.tickets.set(ticketId, ticket);
  s.checkIns.delete(ticketId);
  persist(s);
  await cloudUpsert('party_live_tickets', {
    id: ticket.id,
    order_id: ticket.orderId,
    data: ticket,
    updated_at: new Date().toISOString(),
  });
  return true;
}

export function getPerson(id: string) {
  return store().people.get(id) ?? null;
}

export function getPersonByEmail(email: string) {
  const key = email.trim().toLowerCase();
  return [...store().people.values()].find((p) => p.email === key) ?? null;
}

export function getPersonByCode(code: string) {
  const key = code.trim().toLowerCase();
  if (!key) return null;
  return [...store().people.values()].find((p) => p.code.toLowerCase() === key) ?? null;
}

export function listSellers(vendorId: string) {
  return [...store().people.values()].filter((p) => p.role === 'seller' && p.vendorId === vendorId);
}

export function listVendors() {
  return [...store().people.values()].filter((p) => p.role === 'vendor');
}

export function listSales() {
  return [...store().sales.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function salesForPerson(personId: string) {
  return listSales().filter((s) => s.personId === personId);
}

export function salesForVendorTeam(vendorId: string) {
  return listSales().filter((s) => s.vendorId === vendorId);
}

function uniqueCode(name: string) {
  for (let i = 0; i < 8; i++) {
    const code = makeSalesCode(name);
    if (!getPersonByCode(code)) return code;
  }
  return makeSalesCode(`${name}${Date.now()}`);
}

export async function createPerson(input: {
  role: SalesRole;
  vendorId?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (getPersonByEmail(email)) throw new Error('That email already has a sales account.');
  const person: SalesPerson = {
    id: nid(input.role === 'vendor' ? 'vnd' : 'slr'),
    role: input.role,
    vendorId: input.role === 'seller' ? input.vendorId : undefined,
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    passwordHash: hashPassword(input.password),
    code: uniqueCode(input.name),
    createdAt: new Date().toISOString(),
  };
  const s = store();
  s.people.set(person.id, person);
  persist(s);
  await cloudUpsert('party_live_people', {
    id: person.id,
    email: person.email,
    code: person.code,
    data: person,
    updated_at: new Date().toISOString(),
  });
  return person;
}

export function authenticatePerson(email: string, password: string) {
  const person = getPersonByEmail(email);
  if (!person || !verifyPassword(password, person.passwordHash)) return null;
  return person;
}

export async function createSalesSession(personId: string) {
  const session: SalesSession = {
    token: nid('sst'),
    personId,
    expiresAt: Date.now() + 30 * 86400000,
  };
  const s = store();
  s.sessions.set(session.token, session);
  persist(s);
  await cloudUpsert('party_live_sessions', {
    token: session.token,
    person_id: session.personId,
    expires_at: new Date(session.expiresAt).toISOString(),
    data: session,
  });
  return session;
}

export function personFromToken(token?: string | null) {
  if (!token) return null;
  const session = store().sessions.get(token);
  if (!session || session.expiresAt < Date.now()) return null;
  return getPerson(session.personId);
}

export async function clearSalesSession(token?: string | null) {
  if (!token) return;
  const s = store();
  s.sessions.delete(token);
  persist(s);
  const db = partyCloud();
  if (db) await db.from('party_live_sessions').delete().eq('token', token);
}

export async function recordSaleIfNeeded(order: PartyOrder) {
  if ([...store().sales.values()].some((s) => s.orderId === order.id)) return;
  const person = order.referralCode ? getPersonByCode(order.referralCode) : null;
  if (!person) return;
  const attendees = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const sale: SaleRecord = {
    id: nid('sale'),
    orderId: order.id,
    personId: person.id,
    vendorId: person.role === 'vendor' ? person.id : person.vendorId || person.id,
    attendees,
    amountKobo: order.totalKobo,
    commissionKobo: Math.floor(order.totalKobo * 0.1),
    createdAt: new Date().toISOString(),
    guestName: order.fullName,
    guestEmail: order.email,
  };
  const s = store();
  s.sales.set(sale.id, sale);
  persist(s);
  await cloudUpsert('party_live_sales', {
    id: sale.id,
    order_id: sale.orderId,
    person_id: sale.personId,
    vendor_id: sale.vendorId,
    data: sale,
    created_at: sale.createdAt,
  });
  return sale;
}

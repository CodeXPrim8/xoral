import { MOCK_EVENT } from './mock-event';
import {
  eventWithLiveInventory,
  hydrateStore,
  listOrders,
  listPeople,
  listSales,
  listTickets,
} from './store';
import type { PartyOrder, PartyTicket, SaleRecord, SalesPerson } from './types';

export type PartyAdminSnapshot = {
  event: {
    name: string;
    volume: string;
    startsAt: string;
    scheduleLabel: string;
    venue: string;
    address: string;
    city: string;
    ageRequirement: string;
  };
  tickets: Array<{
    id: string;
    name: string;
    maleKobo: number;
    femaleKobo: number;
    femaleMultiKobo: number;
    sold: number;
    remaining: number;
    capacity: number;
  }>;
  orders: PartyOrder[];
  issued: PartyTicket[];
  people: Array<Pick<SalesPerson, 'id' | 'role' | 'vendorId' | 'name' | 'email' | 'phone' | 'code' | 'createdAt'>>;
  sales: SaleRecord[];
};

export async function getPartyAdminSnapshot(): Promise<PartyAdminSnapshot> {
  await hydrateStore();
  const event = eventWithLiveInventory(MOCK_EVENT);
  return {
    event: {
      name: event.name,
      volume: event.volume,
      startsAt: event.startsAt,
      scheduleLabel: event.scheduleLabel,
      venue: event.venue,
      address: event.address,
      city: event.city,
      ageRequirement: event.ageRequirement,
    },
    tickets: event.ticketTypes.map((t) => ({
      id: t.id,
      name: t.name,
      maleKobo: t.pricing.maleKobo,
      femaleKobo: t.pricing.femaleKobo,
      femaleMultiKobo: t.pricing.femaleMultiKobo,
      sold: t.capacity - t.remaining,
      remaining: t.remaining,
      capacity: t.capacity,
    })),
    orders: listOrders(),
    issued: listTickets().sort((a, b) => a.guestName.localeCompare(b.guestName)),
    people: listPeople().map(({ passwordHash: _pw, ...row }) => row),
    sales: listSales(),
  };
}

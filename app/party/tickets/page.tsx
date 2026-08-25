import { MOCK_EVENT } from '@/lib/party/mock-event';
import { eventWithLiveInventory, hydrateStore } from '@/lib/party/store';
import { PartyTicketGrid } from '@/components/party/sections/PartyTicketGrid';

export const metadata = {
  title: 'Tickets — Xoral Party',
};

export default async function PartyTicketsPage() {
  await hydrateStore();
  return (
    <div className="pt-[calc(4.75rem+env(safe-area-inset-top,0px))] pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
      <PartyTicketGrid event={eventWithLiveInventory(MOCK_EVENT)} checkout />
    </div>
  );
}

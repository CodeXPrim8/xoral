import { MOCK_EVENT } from '@/lib/party/mock-event';
import { eventWithLiveInventory, hydrateStore } from '@/lib/party/store';
import { PartyNextEvent } from '@/components/party/sections/PartyNextEvent';

export const metadata = { title: 'Events — Xoral Party' };

export default async function EventsPage() {
  await hydrateStore();
  return (
    <div className="pt-16">
      <PartyNextEvent event={eventWithLiveInventory(MOCK_EVENT)} />
    </div>
  );
}

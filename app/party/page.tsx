import { MOCK_EVENT, GALLERY_ITEMS, PARTY_CHARACTERS, PARTY_FAQS, PARTY_PARTNERS } from '@/lib/party/mock-event';
import { eventWithLiveInventory, hydrateStore } from '@/lib/party/store';
import { PartyHero } from '@/components/party/sections/PartyHero';
import { PartyCountdown } from '@/components/party/sections/PartyCountdown';
import { PartyConcept } from '@/components/party/sections/PartyConcept';
import { PartyNextEvent } from '@/components/party/sections/PartyNextEvent';
import { PartyTicketGrid } from '@/components/party/sections/PartyTicketGrid';
import { PartyCharacters } from '@/components/party/sections/PartyCharacters';
import { XoralSocial } from '@/components/party/social/XoralSocial';
import { PartyPortal } from '@/components/party/sections/PartyPortal';
import { PartyGallery } from '@/components/party/sections/PartyGallery';
import { PartyYouHadToBeThere } from '@/components/party/sections/PartyYouHadToBeThere';
import { PartyWhosGoing } from '@/components/party/sections/PartyWhosGoing';
import { PartyCrew } from '@/components/party/sections/PartyCrew';
import { PartyPartners } from '@/components/party/sections/PartyPartners';
import { PartyFaq } from '@/components/party/sections/PartyFaq';
import { PartyFinalCta } from '@/components/party/sections/PartyFinalCta';

export default async function PartyHomePage() {
  await hydrateStore();
  const event = eventWithLiveInventory(MOCK_EVENT);
  return (
    <>
      <PartyHero event={event} />
      <PartyCountdown startsAt={event.doorsOpenAt} />
      <PartyConcept />
      <PartyNextEvent event={event} />
      <XoralSocial />
      <PartyCharacters characters={PARTY_CHARACTERS} />
      <PartyPortal />
      <PartyTicketGrid event={event} />
      <PartyGallery items={GALLERY_ITEMS} compact />
      <PartyYouHadToBeThere />
      <PartyWhosGoing />
      <PartyCrew />
      <PartyPartners partners={PARTY_PARTNERS} />
      <PartyFaq items={PARTY_FAQS} />
      <PartyFinalCta />
    </>
  );
}

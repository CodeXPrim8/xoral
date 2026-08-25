import { PARTY_FAQS } from '@/lib/party/mock-event';
import { PartyFaq } from '@/components/party/sections/PartyFaq';

export const metadata = { title: 'FAQ — Xoral Party' };

export default function FaqPage() {
  return (
    <div className="pt-16">
      <PartyFaq items={PARTY_FAQS} />
    </div>
  );
}

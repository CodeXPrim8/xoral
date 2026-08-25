import { GALLERY_ITEMS } from '@/lib/party/mock-event';
import { PartyGallery } from '@/components/party/sections/PartyGallery';

export const metadata = { title: 'Gallery — Xoral Party' };

export default function GalleryPage() {
  return (
    <div className="pt-16">
      <PartyGallery items={GALLERY_ITEMS} />
    </div>
  );
}

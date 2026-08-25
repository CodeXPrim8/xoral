import type { Partner } from '@/lib/party/types';

export function PartyPartners({ partners }: { partners: Partner[] }) {
  return (
    <section className="xp-section">
      <div className="xp-wrap">
        <p className="xp-kicker">Partners</p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {partners.map((p) => (
            <div key={p.id} className="xp-glass px-4 py-6 text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">{p.category}</p>
              <p className="mt-2 font-semibold">{p.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

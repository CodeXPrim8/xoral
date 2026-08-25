import Link from 'next/link';

export function PartyCrew() {
  return (
    <section className="xp-section" id="crew">
      <div className="xp-wrap xp-glass p-5 md:p-12 flex flex-col md:flex-row md:flex-wrap items-stretch md:items-end justify-between gap-6">
        <div>
          <p className="xp-kicker">09 — Community</p>
          <h2 className="xp-display mt-3 text-[2rem] sm:text-4xl md:text-6xl">PARTY CREW</h2>
          <p className="mt-4 max-w-lg text-white/65">
            Ambassadors, organizers, promoters, creators, community partners. If you move a city, help us fill Ambiance on 30 September.
          </p>
        </div>
        <Link href="/party/crew" className="xp-btn xp-btn-primary">
          Join the movement
        </Link>
      </div>
    </section>
  );
}

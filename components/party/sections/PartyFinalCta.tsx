import Link from 'next/link';

export function PartyFinalCta() {
  return (
    <section className="xp-section pb-[calc(var(--xp-sticky-h)+2rem)]">
      <div className="xp-wrap text-center">
        <p className="xp-kicker">10 — 30 September</p>
        <h2 className="xp-display mt-4 text-[2.1rem] sm:text-5xl md:text-8xl leading-[0.95]">SEE YOU 30 SEPTEMBER.</h2>
        <Link href="/party/tickets" className="xp-btn xp-btn-primary mt-10">
          Get Tickets
        </Link>
      </div>
    </section>
  );
}

import Link from 'next/link';

export function PartyYouHadToBeThere() {
  return (
    <section className="xp-section">
      <div className="xp-wrap">
        <h2 className="xp-display text-[2.1rem] sm:text-5xl md:text-7xl leading-[0.95]">30 SEPTEMBER WILL BE ONE OF A KIND.</h2>
        <p className="mt-4 max-w-xl text-white/65">
          Guest reactions and moments from previous editions will live here after the night. Until then, get your ticket for Ambiance, Ikeja.
        </p>
        <Link href="/party/tickets" className="xp-btn xp-btn-primary mt-8">
          Get tickets for the 30th
        </Link>
      </div>
    </section>
  );
}

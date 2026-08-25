export function PartyConcept() {
  return (
    <section className="xp-section" id="concept">
      <div className="xp-wrap grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <p className="xp-kicker">03 — 30 September</p>
          <h2 className="xp-display mt-4 text-[2rem] sm:text-4xl md:text-6xl">
            30 SEPTEMBER IS GOING TO BE ONE OF A KIND.
          </h2>
          <p className="mt-6 text-lg text-white/70 leading-relaxed">
            Inside the Xoral Universe, the characters are living their stories and getting ready.
            On 30 September, Xoral Party brings that celebration into our world at Ambiance, Ikeja.
          </p>
          <p className="mt-6 text-white/90">
            Two crowds.
            <br />
            Two realities.
            <br />
            One night coming.
          </p>
        </div>
        <div className="relative h-[240px] sm:h-[320px] lg:h-[420px] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#3a1028,transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_40%,#1a2458,transparent_50%)] mix-blend-screen animate-pulse" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-[var(--xp-gold)] to-transparent" />
          <p className="absolute left-6 bottom-6 text-sm tracking-[0.2em] uppercase text-white/60">Here</p>
          <p className="absolute right-6 bottom-6 text-sm tracking-[0.2em] uppercase text-[var(--xp-cyan)]">There</p>
        </div>
      </div>
    </section>
  );
}

'use client';

import { FormEvent, useState } from 'react';

export default function CrewPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="xp-wrap pt-28 pb-24 max-w-lg">
      <p className="xp-kicker">Community</p>
      <h1 className="xp-display text-5xl mt-3">JOIN THE MOVEMENT</h1>
      <p className="mt-4 text-white/65">Ambassadors, organizers, promoters, creators, community partners.</p>
      {sent ? (
        <p className="mt-10 text-[var(--xp-gold)]">Application received. We&apos;ll be in touch.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input required name="name" placeholder="Full name" autoComplete="name" className="xp-field" />
          <input required type="email" name="email" placeholder="Email" autoComplete="email" className="xp-field" />
          <input name="city" placeholder="City" className="xp-field" />
          <select name="role" className="xp-field">
            <option value="ambassador">Ambassador</option>
            <option value="organizer">Organizer</option>
            <option value="promoter">Promoter</option>
            <option value="creator">Creator</option>
            <option value="partner">Community partner</option>
          </select>
          <textarea name="why" rows={4} placeholder="Why you" className="xp-field min-h-28" />
          <button type="submit" className="xp-btn xp-btn-primary w-full">Submit</button>
        </form>
      )}
    </div>
  );
}

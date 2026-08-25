'use client';

import { useEffect, useState } from 'react';
import type { PartyEvent } from './types';

export function useLiveEvent(initial: PartyEvent) {
  const [event, setEvent] = useState(initial);

  useEffect(() => {
    let on = true;
    const load = () => {
      fetch('/api/party/event', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data: { event?: PartyEvent }) => {
          if (on && data.event) setEvent(data.event);
        })
        .catch(() => undefined);
    };
    load();
    const id = window.setInterval(load, 15000);
    return () => {
      on = false;
      window.clearInterval(id);
    };
  }, []);

  return event;
}

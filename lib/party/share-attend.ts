import { MOCK_EVENT } from './mock-event';
import { formatEventDate } from './format';

export const SHARE_HASHTAGS = [
  '#XoralParty',
  '#XoralPartyVOL08',
  '#OnePartyTwoWorlds',
  '#Lagos',
  '#AmbianceIkeja',
];

export function ticketShareUrl(origin: string, salesCode?: string | null) {
  const base = `${origin.replace(/\/$/, '')}/party/tickets`;
  const code = salesCode?.trim();
  return code ? `${base}?ref=${encodeURIComponent(code)}` : base;
}

export function attendShareText(ticketUrl: string) {
  return [
    `I'll be at ${MOCK_EVENT.name} ${MOCK_EVENT.volume}.`,
    '',
    `${formatEventDate(MOCK_EVENT.startsAt)} · ${MOCK_EVENT.venue}, ${MOCK_EVENT.address}, ${MOCK_EVENT.city}`,
    MOCK_EVENT.scheduleLabel,
    MOCK_EVENT.tagline,
    '',
    'Get your ticket:',
    ticketUrl,
    '',
    SHARE_HASHTAGS.join(' '),
  ].join('\n');
}

export function attendShareCaption(ticketUrl: string) {
  return attendShareText(ticketUrl);
}

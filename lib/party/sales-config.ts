export const COMMISSION_RATE = 0.1;
export const PERSON_TARGET = 100;
export const TEAM_MIN = 300;
export const TEAM_TARGET = 400;
export const BONUS_75 = 75;
export const BONUS_100 = 100;
export const BONUS_100_KOBO = 2_000_000;
export const BONUS_TOP_KOBO = 3_000_000;

export const MILESTONES: Array<{ by: string; attendees: number; label: string }> = [
  { by: '2026-08-31', attendees: 15, label: '31 Aug' },
  { by: '2026-09-07', attendees: 30, label: '7 Sep' },
  { by: '2026-09-14', attendees: 50, label: '14 Sep' },
  { by: '2026-09-21', attendees: 70, label: '21 Sep' },
  { by: '2026-09-27', attendees: 90, label: '27 Sep' },
  { by: '2026-09-30', attendees: 100, label: '30 Sep' },
];

export function commissionKobo(amountKobo: number) {
  return Math.floor(amountKobo * COMMISSION_RATE);
}

export function currentMilestone(now = Date.now()) {
  const today = new Date(now).toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
  let current = MILESTONES[0];
  for (const row of MILESTONES) {
    if (today <= row.by) {
      current = row;
      break;
    }
    current = row;
  }
  return current;
}

export function pinOk(pin: string | undefined) {
  const expected = process.env.PARTY_CHECKIN_PIN || (process.env.NODE_ENV === 'production' ? '' : 'xoral');
  return Boolean(expected) && pin === expected;
}

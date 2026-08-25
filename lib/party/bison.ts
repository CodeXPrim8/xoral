import { formatNaira } from './format';

/** 1 Bison Note (ɃU) = ₦1,000. Settlement still happens in naira. */
export const BU_KOBO = 100_000;

export function koboToBu(kobo: number) {
  return kobo / BU_KOBO;
}

export function formatBu(kobo: number) {
  const bu = koboToBu(kobo);
  const n = Number.isInteger(bu) ? String(bu) : bu.toFixed(1).replace(/\.0$/, '');
  return `${n} ɃU`;
}

export function formatBuWithNaira(kobo: number) {
  return `${formatBu(kobo)} · ${formatNaira(kobo)}`;
}
